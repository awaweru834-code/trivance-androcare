from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.models import User, DoctorPatientAssignment
from core.schemas import DoctorCreateByAdminRequest, AssignPatientRequest, UserInfoResponse
from core.auth import hash_password, require_roles

router = APIRouter(prefix="/admin", tags=["System Admin Portal"])


@router.post("/create-doctor", response_model=UserInfoResponse)
def create_doctor_account(
    payload: DoctorCreateByAdminRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["ADMIN"])),
):
    """
    System Admin endpoint to create verified Doctor accounts.
    """
    clean_email = payload.email.lower().strip()
    if db.query(User).filter(User.email == clean_email).first():
        raise HTTPException(status_code=400, detail="Email is already registered.")

    doctor = User(
        full_name=payload.full_name.strip(),
        email=clean_email,
        password_hash=hash_password(payload.password),
        role="DOCTOR",
        specialization=payload.specialization,
        license_number=payload.license_number,
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return UserInfoResponse.model_validate(doctor)


@router.post("/assign-patient")
def assign_patient_to_doctor(
    payload: AssignPatientRequest,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["ADMIN"])),
):
    """
    Assigns a patient to a specific doctor so the doctor can access their clinical file.
    """
    doctor = db.query(User).filter(User.id == payload.doctor_id, User.role == "DOCTOR").first()
    patient = db.query(User).filter(User.id == payload.patient_id, User.role == "PATIENT").first()
    if not doctor or not patient:
        raise HTTPException(status_code=404, detail="Doctor or Patient not found.")

    existing = (
        db.query(DoctorPatientAssignment)
        .filter(
            DoctorPatientAssignment.patient_id == payload.patient_id,
        )
        .first()
    )
    if existing:
        existing.doctor_id = payload.doctor_id
        existing.assigned_by_id = admin_user.id
    else:
        db.add(
            DoctorPatientAssignment(
                doctor_id=payload.doctor_id,
                patient_id=payload.patient_id,
                assigned_by_id=admin_user.id,
            )
        )
    db.commit()
    return {
        "status": "assigned",
        "doctor_name": doctor.full_name,
        "patient_name": patient.full_name,
    }


@router.get("/overview")
def get_admin_system_overview(
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles(["ADMIN"])),
):
    doctors = db.query(User).filter(User.role == "DOCTOR").all()
    patients = db.query(User).filter(User.role == "PATIENT").all()
    assignments = db.query(DoctorPatientAssignment).all()

    assignment_map = {a.patient_id: a.doctor_id for a in assignments}
    doctor_name_map = {d.id: d.full_name for d in doctors}

    return {
        "doctors": [
            {
                "id": d.id,
                "full_name": d.full_name,
                "email": d.email,
                "specialization": d.specialization,
                "license_number": d.license_number,
                "assigned_count": sum(1 for a in assignments if a.doctor_id == d.id),
            }
            for d in doctors
        ],
        "patients": [
            {
                "id": p.id,
                "full_name": p.full_name,
                "email": p.email,
                "age": p.age,
                "infertility_type": p.infertility_type,
                "assigned_doctor_id": assignment_map.get(p.id),
                "assigned_doctor_name": doctor_name_map.get(assignment_map.get(p.id), "Unassigned"),
            }
            for p in patients
        ],
    }
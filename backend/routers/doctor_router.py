from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.models import User, DoctorPatientAssignment, ClinicalRecord, DailyJournal
from core.schemas import ClinicalEvaluationInput, DoctorNoteUpdateRequest
from core.auth import require_roles
from core.rate_limiter import clinical_rate_limiter
from services.cdss_service import AndroCareCDSSService

router = APIRouter(prefix="/doctor", tags=["Doctor Clinical Portal"])


def verify_doctor_access_to_patient(db: Session, current_user: User, patient_id: int) -> User:
    patient = db.query(User).filter(User.id == patient_id, User.role == "PATIENT").first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")

    if current_user.role == "ADMIN":
        return patient

    assignment = (
        db.query(DoctorPatientAssignment)
        .filter(
            DoctorPatientAssignment.doctor_id == current_user.id,
            DoctorPatientAssignment.patient_id == patient_id,
        )
        .first()
    )
    if not assignment:
        raise HTTPException(
            status_code=403,
            detail="Access denied: This patient is not assigned to your clinical roster.",
        )
    return patient


@router.get("/my-patients")
def get_assigned_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["DOCTOR", "ADMIN"])),
):
    """
    Returns ONLY the patients assigned to the logged-in doctor (or all patients for System Admin).
    """
    if current_user.role == "ADMIN":
        patients = db.query(User).filter(User.role == "PATIENT").all()
    else:
        assigned_ids = [
            a.patient_id
            for a in db.query(DoctorPatientAssignment)
            .filter(DoctorPatientAssignment.doctor_id == current_user.id)
            .all()
        ]
        patients = db.query(User).filter(User.id.in_(assigned_ids)).all() if assigned_ids else []

    roster = []
    for p in patients:
        latest_record = (
            db.query(ClinicalRecord)
            .filter(ClinicalRecord.patient_id == p.id)
            .order_by(ClinicalRecord.created_at.desc())
            .first()
        )
        journal_count = db.query(DailyJournal).filter(DailyJournal.patient_id == p.id).count()

        roster.append(
            {
                "patient_id": p.id,
                "full_name": p.full_name,
                "email": p.email,
                "age": p.age,
                "infertility_type": p.infertility_type,
                "months_trying": p.months_trying,
                "journal_days_logged": journal_count,
                "latest_nomenclature": latest_record.primary_nomenclature if latest_record else "Pending Initial Workup",
                "vitality_score": latest_record.vitality_score if latest_record else None,
                "has_doctor_note": bool(latest_record and latest_record.doctor_custom_note),
                "last_evaluated": latest_record.created_at.strftime("%b %d, %Y") if latest_record else "Not Evaluated",
            }
        )
    return {"doctor": current_user.full_name, "role": current_user.role, "patients": roster}


@router.get("/patients/{patient_id}/file")
def get_patient_clinical_file(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["DOCTOR", "ADMIN"])),
):
    """
    Opens a specific assigned patient's file, returning their clinical labs,
    WHO Universal Norm comparison graph data, automated CDSS notes, custom doctor note, and journal track record.
    """
    patient = verify_doctor_access_to_patient(db, current_user, patient_id)

    latest_record = (
        db.query(ClinicalRecord)
        .filter(ClinicalRecord.patient_id == patient.id)
        .order_by(ClinicalRecord.created_at.desc())
        .first()
    )

    journals = (
        db.query(DailyJournal)
        .filter(DailyJournal.patient_id == patient.id)
        .order_by(DailyJournal.cycle_day.asc())
        .all()
    )

    evaluation_details = None
    raw_inputs = None
    doctor_custom_note = ""
    doctor_note_updated_at = None

    if latest_record:
        eval_input = ClinicalEvaluationInput(
            volume_ml=latest_record.volume_ml,
            concentration_m_ml=latest_record.concentration_m_ml,
            motility_pct=latest_record.motility_pct,
            morphology_pct=latest_record.morphology_pct,
            viability_pct=latest_record.viability_pct,
            ph=latest_record.ph,
            fsh_miu_ml=latest_record.fsh_miu_ml,
            lh_miu_ml=latest_record.lh_miu_ml,
            testosterone_ng_dl=latest_record.testosterone_ng_dl,
            prolactin_ng_ml=latest_record.prolactin_ng_ml,
            palpable_varicocele=latest_record.palpable_varicocele,
            vas_deferens_present=latest_record.vas_deferens_present,
            testicular_atrophy=latest_record.testicular_atrophy,
            taking_exogenous_testosterone=latest_record.taking_exogenous_testosterone,
            recurrent_pregnancy_loss=latest_record.recurrent_pregnancy_loss,
            upcoming_gonadotoxic_therapy=latest_record.upcoming_gonadotoxic_therapy,
            doctor_custom_note=latest_record.doctor_custom_note or "",
        )
        raw_inputs = eval_input.model_dump()
        doctor_custom_note = latest_record.doctor_custom_note or ""
        doctor_note_updated_at = (
            latest_record.doctor_note_updated_at.strftime("%b %d, %Y · %H:%M")
            if latest_record.doctor_note_updated_at
            else None
        )
        evaluation_details = AndroCareCDSSService.evaluate_and_compare_to_universal_norms(
            eval_input, patient_age=patient.age, infertility_type=patient.infertility_type
        )

    return {
        "patient": {
            "id": patient.id,
            "full_name": patient.full_name,
            "email": patient.email,
            "age": patient.age,
            "infertility_type": patient.infertility_type,
            "months_trying": patient.months_trying,
        },
        "raw_clinical_inputs": raw_inputs,
        "cdss_evaluation": evaluation_details,
        "doctor_custom_note": doctor_custom_note,
        "doctor_note_updated_at": doctor_note_updated_at,
        "patient_journal_track_record": [
            {
                "cycle_day": j.cycle_day,
                "daily_vitality_score": j.daily_vitality_score,
                "mood_score": j.mood_score,
                "sleep_hours": j.sleep_hours,
                "personal_reflection": j.personal_reflection,
            }
            for j in journals
        ],
    }


@router.post("/patients/{patient_id}/evaluate", dependencies=[Depends(clinical_rate_limiter)])
def evaluate_and_save_patient_file(
    patient_id: int,
    payload: ClinicalEvaluationInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["DOCTOR", "ADMIN"])),
):
    """
    Runs the WHO Universal Norm & AUA/ASRM comparison algorithm and saves the clinical record.
    """
    patient = verify_doctor_access_to_patient(db, current_user, patient_id)

    previous_record = (
        db.query(ClinicalRecord)
        .filter(ClinicalRecord.patient_id == patient.id)
        .order_by(ClinicalRecord.created_at.desc())
        .first()
    )

    note_to_save = (
        payload.doctor_custom_note
        if payload.doctor_custom_note is not None
        else (previous_record.doctor_custom_note if previous_record else "")
    )

    result = AndroCareCDSSService.evaluate_and_compare_to_universal_norms(
        payload, patient_age=patient.age, infertility_type=patient.infertility_type
    )

    record = ClinicalRecord(
        patient_id=patient.id,
        recorded_by_id=current_user.id,
        volume_ml=payload.volume_ml,
        concentration_m_ml=payload.concentration_m_ml,
        motility_pct=payload.motility_pct,
        morphology_pct=payload.morphology_pct,
        viability_pct=payload.viability_pct,
        ph=payload.ph,
        fsh_miu_ml=payload.fsh_miu_ml,
        lh_miu_ml=payload.lh_miu_ml,
        testosterone_ng_dl=payload.testosterone_ng_dl,
        prolactin_ng_ml=payload.prolactin_ng_ml,
        palpable_varicocele=payload.palpable_varicocele,
        vas_deferens_present=payload.vas_deferens_present,
        testicular_atrophy=payload.testicular_atrophy,
        taking_exogenous_testosterone=payload.taking_exogenous_testosterone,
        recurrent_pregnancy_loss=payload.recurrent_pregnancy_loss,
        upcoming_gonadotoxic_therapy=payload.upcoming_gonadotoxic_therapy,
        primary_nomenclature=result["primary_nomenclature"],
        etiology_category=result["etiology_category"],
        vitality_score=result["vitality_score"],
        clinical_support_note=result["clinical_support_note"],
        doctor_custom_note=note_to_save,
        doctor_note_updated_at=datetime.utcnow() if note_to_save else None,
    )
    db.add(record)
    db.commit()

    return result


@router.put("/patients/{patient_id}/note", dependencies=[Depends(clinical_rate_limiter)])
def save_doctor_note_for_patient(
    patient_id: int,
    payload: DoctorNoteUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["DOCTOR", "ADMIN"])),
):
    """
    Allows the assigned doctor to write or update a personalized Doctor's Note
    that is directly displayed on the Patient's dashboard.
    """
    patient = verify_doctor_access_to_patient(db, current_user, patient_id)

    latest_record = (
        db.query(ClinicalRecord)
        .filter(ClinicalRecord.patient_id == patient.id)
        .order_by(ClinicalRecord.created_at.desc())
        .first()
    )

    if not latest_record:
        # Create a baseline record if the doctor writes a note before running full lab evaluation
        default_input = ClinicalEvaluationInput(
            volume_ml=2.0,
            concentration_m_ml=16.0,
            motility_pct=42.0,
            morphology_pct=4.0,
            viability_pct=58.0,
            ph=7.4,
            fsh_miu_ml=5.0,
            lh_miu_ml=4.8,
            testosterone_ng_dl=450.0,
            prolactin_ng_ml=10.0,
        )
        res = AndroCareCDSSService.evaluate_and_compare_to_universal_norms(
            default_input, patient_age=patient.age, infertility_type=patient.infertility_type
        )
        latest_record = ClinicalRecord(
            patient_id=patient.id,
            recorded_by_id=current_user.id,
            volume_ml=2.0,
            concentration_m_ml=16.0,
            motility_pct=42.0,
            morphology_pct=4.0,
            viability_pct=58.0,
            ph=7.4,
            fsh_miu_ml=5.0,
            lh_miu_ml=4.8,
            testosterone_ng_dl=450.0,
            prolactin_ng_ml=10.0,
            primary_nomenclature=res["primary_nomenclature"],
            etiology_category=res["etiology_category"],
            vitality_score=res["vitality_score"],
            clinical_support_note=res["clinical_support_note"],
            doctor_custom_note=payload.doctor_custom_note.strip(),
            doctor_note_updated_at=datetime.utcnow(),
        )
        db.add(latest_record)
    else:
        latest_record.doctor_custom_note = payload.doctor_custom_note.strip()
        latest_record.doctor_note_updated_at = datetime.utcnow()
        latest_record.recorded_by_id = current_user.id

    db.commit()
    db.refresh(latest_record)

    return {
        "status": "saved",
        "patient_id": patient.id,
        "doctor_custom_note": latest_record.doctor_custom_note,
        "doctor_note_updated_at": latest_record.doctor_note_updated_at.strftime("%b %d, %Y · %H:%M"),
    }
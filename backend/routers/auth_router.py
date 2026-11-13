from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.models import User, DoctorPatientAssignment
from core.schemas import LoginRequest, PatientSignupRequest, TokenResponse, UserInfoResponse
from core.auth import hash_password, verify_password, create_access_token, get_current_user
from core.rate_limiter import auth_rate_limiter

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])


@router.post("/login", response_model=TokenResponse, dependencies=[Depends(auth_rate_limiter)])
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(user_id=user.id, email=user.email, role=user.role)
    return TokenResponse(access_token=token, user=UserInfoResponse.model_validate(user))


@router.post("/register-patient", response_model=TokenResponse, dependencies=[Depends(auth_rate_limiter)])
def register_patient(payload: PatientSignupRequest, db: Session = Depends(get_db)):
    """
    Public endpoint for Patients to create an account.
    Doctor accounts cannot be created here (must be created by System Admin).
    """
    clean_email = payload.email.lower().strip()
    existing = db.query(User).filter(User.email == clean_email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    new_patient = User(
        full_name=payload.full_name.strip(),
        email=clean_email,
        password_hash=hash_password(payload.password),
        role="PATIENT",
        age=payload.age,
        infertility_type=payload.infertility_type,
        months_trying=payload.months_trying,
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    # Auto-assign to the primary on-call doctor so new patients immediately appear in a doctor's queue
    first_doctor = db.query(User).filter(User.role == "DOCTOR").first()
    if first_doctor:
        assignment = DoctorPatientAssignment(
            doctor_id=first_doctor.id,
            patient_id=new_patient.id,
            assigned_by_id=first_doctor.id,
        )
        db.add(assignment)
        db.commit()

    token = create_access_token(user_id=new_patient.id, email=new_patient.email, role=new_patient.role)
    return TokenResponse(access_token=token, user=UserInfoResponse.model_validate(new_patient))


@router.get("/me", response_model=UserInfoResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserInfoResponse.model_validate(current_user)
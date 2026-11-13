from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# --- AUTH & RBAC SCHEMAS ---
class LoginRequest(BaseModel):
    email: str
    password: str


class PatientSignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: str
    password: str = Field(..., min_length=4)
    age: int = Field(default=30, ge=18, le=80)
    infertility_type: str = Field(default="primary")
    months_trying: int = Field(default=12, ge=0, le=240)


class DoctorCreateByAdminRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: str
    password: str = Field(..., min_length=4)
    specialization: str = Field(default="Andrology & Reproductive Urology")
    license_number: str = Field(default="KMPDC-ANDRO-2026")


class AssignPatientRequest(BaseModel):
    doctor_id: int
    patient_id: int


class UserInfoResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    specialization: Optional[str] = None
    age: Optional[int] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInfoResponse


# --- CLINICAL EVALUATION & DOCTOR NOTE SCHEMAS ---
class ClinicalEvaluationInput(BaseModel):
    volume_ml: float = Field(..., ge=0.0, le=15.0)
    concentration_m_ml: float = Field(..., ge=0.0, le=300.0)
    motility_pct: float = Field(..., ge=0.0, le=100.0)
    morphology_pct: float = Field(..., ge=0.0, le=100.0)
    viability_pct: float = Field(..., ge=0.0, le=100.0)
    ph: float = Field(..., ge=5.0, le=9.5)

    fsh_miu_ml: float = Field(..., ge=0.0, le=100.0)
    lh_miu_ml: float = Field(..., ge=0.0, le=100.0)
    testosterone_ng_dl: float = Field(..., ge=0.0, le=1600.0)
    prolactin_ng_ml: float = Field(..., ge=0.0, le=200.0)

    palpable_varicocele: bool = False
    vas_deferens_present: bool = True
    testicular_atrophy: bool = False
    taking_exogenous_testosterone: bool = False
    recurrent_pregnancy_loss: bool = False
    upcoming_gonadotoxic_therapy: bool = False

    doctor_custom_note: Optional[str] = None


class DoctorNoteUpdateRequest(BaseModel):
    doctor_custom_note: str = Field(..., min_length=2, max_length=3000)


class UniversalNormMetric(BaseModel):
    metric: str
    patient_value: float
    universal_norm_target: float
    unit: str
    patient_normalized_pct: int  # Scaled so 100% = Universal WHO Norm
    universal_norm_pct: int = 100
    status: str  # "Above Universal Norm", "Below Norm", "Critical Deficit"
    clinical_interpretation: str


# --- PATIENT JOURNAL SCHEMAS ---
class JournalCreateRequest(BaseModel):
    cycle_day: int = Field(..., ge=1, le=75)
    avoided_tobacco_alcohol: bool = True
    heat_and_toxin_protection: bool = True
    balanced_nutrition_exercise: bool = True
    zero_exogenous_steroids: bool = True
    sleep_hours: float = Field(default=7.5, ge=0.0, le=16.0)
    mood_score: int = Field(default=8, ge=1, le=10)
    personal_reflection: Optional[str] = ""


class JournalEntryResponse(BaseModel):
    id: int
    cycle_day: int
    avoided_tobacco_alcohol: bool
    heat_and_toxin_protection: bool
    balanced_nutrition_exercise: bool
    zero_exogenous_steroids: bool
    sleep_hours: float
    mood_score: int
    daily_vitality_score: int
    personal_reflection: Optional[str]
    logged_at: datetime

    class Config:
        from_attributes = True
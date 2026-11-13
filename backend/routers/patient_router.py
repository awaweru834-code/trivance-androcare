from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from core.models import User, DailyJournal, ClinicalRecord, DoctorPatientAssignment
from core.schemas import JournalCreateRequest, JournalEntryResponse
from core.auth import require_roles

router = APIRouter(prefix="/patient", tags=["Patient 75-Day Companion Portal"])


@router.post("/journal", response_model=JournalEntryResponse)
def log_daily_journal(
    payload: JournalCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["PATIENT", "ADMIN"])),
):
    """
    Saves the patient's simple daily spermatogenesis journal entry to PostgreSQL.
    """
    score = 20
    if payload.avoided_tobacco_alcohol:
        score += 20
    if payload.heat_and_toxin_protection:
        score += 20
    if payload.balanced_nutrition_exercise:
        score += 20
    if payload.zero_exogenous_steroids:
        score += 20

    existing = (
        db.query(DailyJournal)
        .filter(
            DailyJournal.patient_id == current_user.id,
            DailyJournal.cycle_day == payload.cycle_day,
        )
        .first()
    )

    if existing:
        existing.avoided_tobacco_alcohol = payload.avoided_tobacco_alcohol
        existing.heat_and_toxin_protection = payload.heat_and_toxin_protection
        existing.balanced_nutrition_exercise = payload.balanced_nutrition_exercise
        existing.zero_exogenous_steroids = payload.zero_exogenous_steroids
        existing.sleep_hours = payload.sleep_hours
        existing.mood_score = payload.mood_score
        existing.daily_vitality_score = score
        existing.personal_reflection = payload.personal_reflection or ""
        db.commit()
        db.refresh(existing)
        return JournalEntryResponse.model_validate(existing)

    entry = DailyJournal(
        patient_id=current_user.id,
        cycle_day=payload.cycle_day,
        avoided_tobacco_alcohol=payload.avoided_tobacco_alcohol,
        heat_and_toxin_protection=payload.heat_and_toxin_protection,
        balanced_nutrition_exercise=payload.balanced_nutrition_exercise,
        zero_exogenous_steroids=payload.zero_exogenous_steroids,
        sleep_hours=payload.sleep_hours,
        mood_score=payload.mood_score,
        daily_vitality_score=score,
        personal_reflection=payload.personal_reflection or "",
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return JournalEntryResponse.model_validate(entry)


@router.get("/dashboard")
def get_patient_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(["PATIENT", "ADMIN"])),
):
    """
    Returns the patient's historical journal track record for graphing,
    assigned doctor info, the doctor's custom note, and a simple summary of their latest clinical evaluation.
    """
    entries = (
        db.query(DailyJournal)
        .filter(DailyJournal.patient_id == current_user.id)
        .order_by(DailyJournal.cycle_day.asc())
        .all()
    )

    assignment = (
        db.query(DoctorPatientAssignment)
        .filter(DoctorPatientAssignment.patient_id == current_user.id)
        .first()
    )
    doctor_name = assignment.doctor.full_name if (assignment and assignment.doctor) else "Pending Doctor Assignment"
    doctor_specialization = (
        assignment.doctor.specialization if (assignment and assignment.doctor) else "Reproductive Specialist"
    )

    latest_clinical = (
        db.query(ClinicalRecord)
        .filter(ClinicalRecord.patient_id == current_user.id)
        .order_by(ClinicalRecord.created_at.desc())
        .first()
    )

    avg_compliance = (
        int(round(sum(e.daily_vitality_score for e in entries) / len(entries)))
        if entries
        else 0
    )

    return {
        "patient_name": current_user.full_name,
        "assigned_doctor": doctor_name,
        "assigned_doctor_specialization": doctor_specialization,
        "spermatogenesis_target_days": 75,
        "days_completed": len(entries),
        "average_habit_score": avg_compliance,
        "latest_clinical_summary": {
            "status_title": latest_clinical.primary_nomenclature if latest_clinical else "Awaiting First Lab Analysis",
            "vitality_score": latest_clinical.vitality_score if latest_clinical else None,
            "doctor_custom_note": (
                latest_clinical.doctor_custom_note
                if (latest_clinical and latest_clinical.doctor_custom_note)
                else "Your specialist is reviewing your baseline profile. Keep logging your daily 75-day spermatogenesis habits below."
            ),
            "doctor_note_updated_at": (
                latest_clinical.doctor_note_updated_at.strftime("%b %d, %Y · %H:%M")
                if (latest_clinical and latest_clinical.doctor_note_updated_at)
                else "Baseline Guidance"
            ),
            "automated_cdss_summary": latest_clinical.clinical_support_note
            if latest_clinical
            else "Automated WHO/AUA comparison will appear once your clinician inputs your semen analysis.",
        },
        "track_record": [
            {
                "id": e.id,
                "cycle_day": e.cycle_day,
                "daily_vitality_score": e.daily_vitality_score,
                "mood_score": e.mood_score,
                "sleep_hours": e.sleep_hours,
                "avoided_tobacco_alcohol": e.avoided_tobacco_alcohol,
                "heat_and_toxin_protection": e.heat_and_toxin_protection,
                "balanced_nutrition_exercise": e.balanced_nutrition_exercise,
                "zero_exogenous_steroids": e.zero_exogenous_steroids,
                "personal_reflection": e.personal_reflection,
            }
            for e in entries
        ],
    }
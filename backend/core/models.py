from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(256), nullable=False)
    role = Column(String(20), nullable=False, default="PATIENT")  # ADMIN | DOCTOR | PATIENT

    # Doctor-specific fields
    specialization = Column(String(120), nullable=True)
    license_number = Column(String(60), nullable=True)

    # Patient-specific baseline fields
    age = Column(Integer, default=30)
    infertility_type = Column(String(30), default="primary")  # primary | secondary
    months_trying = Column(Integer, default=12)

    created_at = Column(DateTime, default=datetime.utcnow)

    clinical_records = relationship(
        "ClinicalRecord",
        back_populates="patient",
        foreign_keys="ClinicalRecord.patient_id",
        cascade="all, delete-orphan",
    )
    journal_entries = relationship(
        "DailyJournal",
        back_populates="patient",
        cascade="all, delete-orphan",
    )


class DoctorPatientAssignment(Base):
    __tablename__ = "doctor_patient_assignments"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)

    doctor = relationship("User", foreign_keys=[doctor_id])
    patient = relationship("User", foreign_keys=[patient_id])


class ClinicalRecord(Base):
    __tablename__ = "clinical_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    recorded_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Semen Analysis Parameters (WHO 6th Edition)
    volume_ml = Column(Float, nullable=False)
    concentration_m_ml = Column(Float, nullable=False)
    motility_pct = Column(Float, nullable=False)
    morphology_pct = Column(Float, nullable=False)
    viability_pct = Column(Float, nullable=False)
    ph = Column(Float, nullable=False)

    # Hormonal Profile (HPG-Axis)
    fsh_miu_ml = Column(Float, nullable=False)
    lh_miu_ml = Column(Float, nullable=False)
    testosterone_ng_dl = Column(Float, nullable=False)
    prolactin_ng_ml = Column(Float, nullable=False)

    # Physical & Clinical History Flags
    palpable_varicocele = Column(Boolean, default=False)
    vas_deferens_present = Column(Boolean, default=True)
    testicular_atrophy = Column(Boolean, default=False)
    taking_exogenous_testosterone = Column(Boolean, default=False)
    recurrent_pregnancy_loss = Column(Boolean, default=False)
    upcoming_gonadotoxic_therapy = Column(Boolean, default=False)

    # Computed CDSS Summary Outputs
    primary_nomenclature = Column(String(160), nullable=False)
    etiology_category = Column(String(160), nullable=False)
    vitality_score = Column(Integer, nullable=False)
    clinical_support_note = Column(Text, nullable=False)

    # Personalized Doctor's Note to Patient
    doctor_custom_note = Column(Text, nullable=True, default="")
    doctor_note_updated_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("User", back_populates="clinical_records", foreign_keys=[patient_id])


class DailyJournal(Base):
    __tablename__ = "daily_journals"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    cycle_day = Column(Integer, nullable=False)  # Day 1 to 75 of spermatogenesis

    # Simple Patient Lifestyle Checkboxes
    avoided_tobacco_alcohol = Column(Boolean, default=True)
    heat_and_toxin_protection = Column(Boolean, default=True)
    balanced_nutrition_exercise = Column(Boolean, default=True)
    zero_exogenous_steroids = Column(Boolean, default=True)

    # Wellbeing & Sleep
    sleep_hours = Column(Float, default=7.5)
    mood_score = Column(Integer, default=8)  # 1 (High Distress) to 10 (Resilient)
    daily_vitality_score = Column(Integer, nullable=False)  # Computed 0-100 track score
    personal_reflection = Column(String(500), default="")

    logged_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("User", back_populates="journal_entries")
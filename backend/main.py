from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, inspect
from sqlalchemy.orm import Session
from core.database import Base, engine, SessionLocal
from core.models import User, DoctorPatientAssignment, ClinicalRecord, DailyJournal
from core.auth import hash_password
from core.schemas import ClinicalEvaluationInput
from services.cdss_service import AndroCareCDSSService
from routers.auth_router import router as auth_router
from routers.admin_router import router as admin_router
from routers.doctor_router import router as doctor_router
from routers.patient_router import router as patient_router

app = FastAPI(
    title="Tri-Vance AndroCare RBAC & Clinical CDSS API",
    version="3.2.0",
    description="Role-Based Male Fertility Clinical Decision Support, Doctor's Note & 75-Day Patient Journal Backend",
)

# 1. Bulletproof CORS for all Vercel preview & production URLs + localhost (NO trailing slashes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://frontend-psi-steel-61.vercel.app",
        "https://frontend-9nmmtp6qc-awaweru834-workspace.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Mount routers at /api/v1 AND root so requests work even if /api/v1 is omitted in Vercel env vars
API_PREFIX = "/api/v1"
for prefix in [API_PREFIX, ""]:
    app.include_router(auth_router, prefix=prefix)
    app.include_router(admin_router, prefix=prefix)
    app.include_router(doctor_router, prefix=prefix)
    app.include_router(patient_router, prefix=prefix)

def ensure_doctor_note_columns():
    """
    Safely inspects the table columns first so PostgreSQL never enters a failed transaction block.
    """
    try:
        inspector = inspect(engine)
        if "clinical_records" not in inspector.get_table_names():
            return

        existing_cols = {col["name"] for col in inspector.get_columns("clinical_records")}

        if "doctor_custom_note" not in existing_cols:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE clinical_records ADD COLUMN doctor_custom_note TEXT"))

        if "doctor_note_updated_at" not in existing_cols:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE clinical_records ADD COLUMN doctor_note_updated_at TIMESTAMP"))
    except Exception as e:
        print(f"Schema check note: {e}")


def seed_initial_hackathon_data(db: Session):
    existing_admin = db.query(User).filter(User.email == "admin@trivance.med").first()
    if existing_admin:
        existing_admin.full_name = "Hospital System Admin"
        db.commit()

        patients = db.query(User).filter(User.role == "PATIENT").all()
        for pt in patients:
            has_journals = db.query(DailyJournal).filter(DailyJournal.patient_id == pt.id).first()
            if not has_journals:
                for day, sc, mood, note in [
                    (1, 80, 7, "Day 1 of the 75-day spermatogenesis cycle logged."),
                    (7, 100, 8, "Completed full week of heat protection and clean nutrition."),
                    (14, 100, 9, "Feeling strong consistency with the lifestyle protocol."),
                ]:
                    db.add(
                        DailyJournal(
                            patient_id=pt.id,
                            cycle_day=day,
                            avoided_tobacco_alcohol=True,
                            heat_and_toxin_protection=True,
                            balanced_nutrition_exercise=True,
                            zero_exogenous_steroids=True,
                            sleep_hours=7.5,
                            mood_score=mood,
                            daily_vitality_score=sc,
                            personal_reflection=note,
                        )
                    )
        db.commit()
        return

    # 1. Neutral Hospital System Admin
    admin = User(
        full_name="Hospital System Admin",
        email="admin@trivance.med",
        password_hash=hash_password("admin123"),
        role="ADMIN",
    )
    # 2. Doctors
    dr_kaswii = User(
        full_name="Dr. Kaswii Ruth",
        email="kaswii@trivance.med",
        password_hash=hash_password("doctor123"),
        role="DOCTOR",
        specialization="Reproductive Urology & Andrology",
        license_number="KMPDC-9921",
    )
    dr_abigail = User(
        full_name="Dr. Chepkemoi Abigail",
        email="abigail@trivance.med",
        password_hash=hash_password("doctor123"),
        role="DOCTOR",
        specialization="Endocrine Fertility Specialist",
        license_number="KMPDC-9948",
    )

    # 3. Dummy Patients
    pt_michael = User(
        full_name="Michael Ochieng",
        email="michael@patient.med",
        password_hash=hash_password("patient123"),
        role="PATIENT",
        age=34,
        infertility_type="secondary",
        months_trying=16,
    )
    pt_david = User(
        full_name="David Kamau",
        email="david@patient.med",
        password_hash=hash_password("patient123"),
        role="PATIENT",
        age=31,
        infertility_type="primary",
        months_trying=18,
    )
    pt_james = User(
        full_name="James Mwangi",
        email="james@patient.med",
        password_hash=hash_password("patient123"),
        role="PATIENT",
        age=29,
        infertility_type="primary",
        months_trying=14,
    )

    db.add_all([admin, dr_kaswii, dr_abigail, pt_michael, pt_david, pt_james])
    db.commit()
    for u in [admin, dr_kaswii, dr_abigail, pt_michael, pt_david, pt_james]:
        db.refresh(u)

    # 4. Assignments
    db.add_all(
        [
            DoctorPatientAssignment(doctor_id=dr_kaswii.id, patient_id=pt_michael.id, assigned_by_id=admin.id),
            DoctorPatientAssignment(doctor_id=dr_kaswii.id, patient_id=pt_david.id, assigned_by_id=admin.id),
            DoctorPatientAssignment(doctor_id=dr_abigail.id, patient_id=pt_james.id, assigned_by_id=admin.id),
        ]
    )
    db.commit()

    # 5. Seed Clinical Evaluations + Personalized Doctor's Notes
    sample_cases = [
        (
            pt_michael,
            dr_kaswii,
            ClinicalEvaluationInput(
                volume_ml=2.4,
                concentration_m_ml=9.2,
                motility_pct=31.0,
                morphology_pct=2.5,
                viability_pct=58.0,
                ph=7.4,
                fsh_miu_ml=6.1,
                lh_miu_ml=5.0,
                testosterone_ng_dl=410.0,
                prolactin_ng_ml=10.5,
                palpable_varicocele=True,
                vas_deferens_present=True,
                testicular_atrophy=False,
                taking_exogenous_testosterone=False,
                recurrent_pregnancy_loss=True,
                upcoming_gonadotoxic_therapy=False,
                doctor_custom_note=(
                    "Hi Michael — Your endocrine hormone levels (Testosterone 410 ng/dL, FSH 6.1 mIU/mL) are healthy. "
                    "Because you have a clinically palpable varicocele alongside mild OAT parameters, we will schedule "
                    "a microsurgical varicocelectomy consult and a Sperm DNA Fragmentation assay. Keep up your great "
                    "consistency on the 75-day lifestyle journal!"
                ),
            ),
        ),
        (
            pt_david,
            dr_kaswii,
            ClinicalEvaluationInput(
                volume_ml=1.9,
                concentration_m_ml=0.0,
                motility_pct=0.0,
                morphology_pct=0.0,
                viability_pct=0.0,
                ph=7.5,
                fsh_miu_ml=22.4,
                lh_miu_ml=14.8,
                testosterone_ng_dl=215.0,
                prolactin_ng_ml=12.0,
                palpable_varicocele=False,
                vas_deferens_present=True,
                testicular_atrophy=True,
                taking_exogenous_testosterone=False,
                recurrent_pregnancy_loss=False,
                upcoming_gonadotoxic_therapy=False,
                doctor_custom_note=(
                    "Hi David — Your hormone panel shows elevated FSH (22.4 mIU/mL) with low testosterone, indicating "
                    "a non-obstructive pattern. Do not take any exogenous testosterone boosters, as they suppress natural "
                    "signals. Our next step is a Karyotype and Y-Chromosome Microdeletion blood test before planning Micro-TESE + ICSI."
                ),
            ),
        ),
        (
            pt_james,
            dr_abigail,
            ClinicalEvaluationInput(
                volume_ml=0.7,
                concentration_m_ml=0.0,
                motility_pct=0.0,
                morphology_pct=0.0,
                viability_pct=0.0,
                ph=6.5,
                fsh_miu_ml=4.5,
                lh_miu_ml=4.9,
                testosterone_ng_dl=530.0,
                prolactin_ng_ml=9.2,
                palpable_varicocele=False,
                vas_deferens_present=True,
                testicular_atrophy=False,
                taking_exogenous_testosterone=False,
                recurrent_pregnancy_loss=False,
                upcoming_gonadotoxic_therapy=False,
                doctor_custom_note=(
                    "Hi James — Good news: your pituitary and testicular hormones (Testosterone 530 ng/dL, FSH 4.5) are "
                    "completely normal, meaning your body is producing sperm normally. The low volume and acidic pH point "
                    "to a simple blockage (Ejaculatory Duct Obstruction). We have ordered a TRUS/Pelvic MRI to confirm."
                ),
            ),
        ),
    ]

    for pt, doc, c_input in sample_cases:
        res = AndroCareCDSSService.evaluate_and_compare_to_universal_norms(
            c_input, patient_age=pt.age, infertility_type=pt.infertility_type
        )
        dump_data = c_input.model_dump(exclude={"doctor_custom_note"})
        db.add(
            ClinicalRecord(
                patient_id=pt.id,
                recorded_by_id=doc.id,
                **dump_data,
                primary_nomenclature=res["primary_nomenclature"],
                etiology_category=res["etiology_category"],
                vitality_score=res["vitality_score"],
                clinical_support_note=res["clinical_support_note"],
                doctor_custom_note=c_input.doctor_custom_note,
                doctor_note_updated_at=datetime.utcnow(),
            )
        )

    # 6. Seed 75-day journal entries for all 3 dummy patients
    for pt in [pt_michael, pt_david, pt_james]:
        for day, tob, heat, nut, ster, slp, mood, sc, note in [
            (1, True, True, False, True, 6.5, 6, 80, "Started the 75-day spermatogenesis reset today."),
            (5, True, True, True, True, 7.5, 7, 100, "Switched to loose cotton wear and stopped heat exposure."),
            (10, True, False, True, True, 7.0, 7, 80, "Long work shift, stayed hydrated."),
            (15, True, True, True, True, 8.0, 8, 100, "Feeling more energetic after cutting alcohol completely."),
            (20, True, True, True, True, 7.5, 9, 100, "Consistent morning exercise and antioxidant diet."),
        ]:
            db.add(
                DailyJournal(
                    patient_id=pt.id,
                    cycle_day=day,
                    avoided_tobacco_alcohol=tob,
                    heat_and_toxin_protection=heat,
                    balanced_nutrition_exercise=nut,
                    zero_exogenous_steroids=ster,
                    sleep_hours=slp,
                    mood_score=mood,
                    daily_vitality_score=sc,
                    personal_reflection=note,
                )
            )
    db.commit()


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    ensure_doctor_note_columns()
    db = SessionLocal()
    try:
        seed_initial_hackathon_data(db)
    except Exception as e:
        db.rollback()
        print(f"Seed check note: {e}")
    finally:
        db.close()


@app.get("/")
def health_check():
    return {
        "status": "online",
        "api_docs": "/docs",
        "seeded_demo_logins": {
            "system_admin": "admin@trivance.med / admin123",
            "doctor_1": "kaswii@trivance.med / doctor123",
            "doctor_2": "abigail@trivance.med / doctor123",
            "patient_1": "michael@patient.med / patient123",
            "patient_2": "david@patient.med / patient123",
            "patient_3": "james@patient.med / patient123",
        },
    }
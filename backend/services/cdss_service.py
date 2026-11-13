from typing import Dict, Any, List
from core.schemas import ClinicalEvaluationInput, UniversalNormMetric


class AndroCareCDSSService:
    """
    AUA/ASRM (2020; Amended 2024) & WHO 6th Edition Clinical Decision-Support Engine.
    Computes patient-vs-Universal Norm graph comparisons and clinical support notes.
    """

    WHO_UNIVERSAL_NORMS = {
        "volume_ml": 1.4,
        "concentration_m_ml": 16.0,
        "motility_pct": 42.0,
        "morphology_pct": 4.0,
        "viability_pct": 54.0,
        "ph": 7.2,
        "testosterone_ng_dl": 350.0,
    }

    @classmethod
    def evaluate_and_compare_to_universal_norms(
        cls, data: ClinicalEvaluationInput, patient_age: int = 32, infertility_type: str = "primary"
    ) -> Dict[str, Any]:
        tags: List[str] = []
        genetic_workup: List[str] = []
        imaging_workup: List[str] = []
        treatment_recommendations: List[str] = []
        red_flags: List[str] = []

        is_azo = data.concentration_m_ml == 0
        is_severe_oligo = 0 < data.concentration_m_ml < 5.0
        is_oligo = 0 < data.concentration_m_ml < 16.0
        is_astheno = data.motility_pct < 42.0 and not is_azo
        is_terato = data.morphology_pct < 4.0 and not is_azo

        # 1. Nomenclature Classification
        if data.volume_ml == 0:
            tags.append("Aspermia")
        elif is_azo:
            tags.append("Azoospermia")
        else:
            if is_severe_oligo:
                tags.append("Severe Oligozoospermia (<5M/mL)")
            elif is_oligo:
                tags.append("Oligozoospermia (<16M/mL)")
            if is_astheno:
                tags.append("Asthenozoospermia")
            if is_terato:
                tags.append("Teratozoospermia")
            if is_oligo and is_astheno and is_terato:
                tags.insert(0, "Oligoasthenoteratospermia (OAT Syndrome)")

        if not tags:
            tags.append("Normozoospermia (Meets WHO Universal Norms)")

        primary_nomenclature = tags[0]

        # 2. Etiology Classification
        edo_pattern = (
            is_azo
            and data.volume_ml < 1.4
            and data.ph < 7.2
            and data.testosterone_ng_dl >= 300
            and data.vas_deferens_present
        )

        if data.taking_exogenous_testosterone:
            etiology = "Pre-Testicular (Iatrogenic HPG-Axis Suppression)"
        elif data.fsh_miu_ml > 7.6 and (is_azo or is_severe_oligo):
            etiology = "Primary Testicular Failure / Non-Obstructive Pattern"
        elif data.fsh_miu_ml < 1.5 and data.lh_miu_ml < 1.5 and data.testosterone_ng_dl < 300:
            etiology = "Pre-Testicular / Hypogonadotropic Hypogonadism"
        elif edo_pattern or not data.vas_deferens_present:
            etiology = "Post-Testicular / Obstructive Reproductive Tract Pattern"
        else:
            etiology = "Idiopathic / Multifactorial Male-Factor Profile"

        # 3. AUA/ASRM Genetic, Imaging, and Treatment Rules
        if infertility_type == "primary" and (is_azo or is_severe_oligo) and (
            data.fsh_miu_ml > 7.6 or data.testicular_atrophy
        ):
            genetic_workup.append("Karyotype Analysis (Screen for Klinefelter 47,XXY)")
        if infertility_type == "primary" and data.concentration_m_ml <= 1.0:
            genetic_workup.append("Y-Chromosome Microdeletion Assay (AZFa, AZFb, AZFc)")
        if not data.vas_deferens_present or (is_azo and data.volume_ml < 1.4 and data.fsh_miu_ml <= 7.6):
            genetic_workup.append("CFTR Gene Mutation Testing + Partner Carrier Screening")

        if edo_pattern:
            imaging_workup.append("Transrectal Ultrasound (TRUS) or Pelvic MRI (2024 AUA Amendment for EDO)")
        if not data.vas_deferens_present:
            imaging_workup.append("Renal Ultrasonography (Screen for ipsilateral renal agenesis in CBAVD)")
        if data.testicular_atrophy:
            imaging_workup.append("Targeted Scrotal Ultrasound (Evaluate architecture & malignancy risk)")

        if data.taking_exogenous_testosterone:
            red_flags.append(
                "CONTRAINDICATION: Immediately cease exogenous testosterone. It suppresses pituitary LH/FSH and halts spermatogenesis."
            )
            treatment_recommendations.append(
                "HPG-Axis Recovery: Transition to Clomiphene Citrate (SERM) or hCG to restore intratesticular testosterone."
            )

        if data.upcoming_gonadotoxic_therapy:
            red_flags.append(
                "URGENT ONCOFERTILITY ALERT: Bank multiple cryopreserved sperm specimens prior to chemotherapy/radiotherapy."
            )

        if data.palpable_varicocele and (is_oligo or is_astheno or is_terato):
            treatment_recommendations.append(
                "Microsurgical Varicocelectomy (Indicated for clinically palpable varicocele + abnormal semen parameters)."
            )

        if is_azo and data.fsh_miu_ml > 7.6:
            treatment_recommendations.append(
                "Microdissection Testicular Sperm Extraction (Micro-TESE) coupled with ICSI."
            )
        elif edo_pattern:
            treatment_recommendations.append("Transurethral Resection of Ejaculatory Ducts (TURED) or Sperm Retrieval + ICSI.")
        elif is_severe_oligo:
            treatment_recommendations.append("In Vitro Fertilisation (IVF) with Intracytoplasmic Sperm Injection (ICSI).")
        elif is_oligo or is_astheno:
            treatment_recommendations.append("Consider Intrauterine Insemination (IUI) or lifestyle/endocrine optimization.")

        if data.recurrent_pregnancy_loss:
            treatment_recommendations.append("Order Sperm DNA Fragmentation Assay (indicated for recurrent pregnancy loss).")

        # 4. Universal Norm Graph Comparison Data (Normalized so 100 = WHO Lower Reference Limit)
        def norm_pct(val: float, target: float) -> int:
            if target <= 0:
                return 100
            return min(160, max(0, int(round((val / target) * 100))))

        universal_comparison: List[UniversalNormMetric] = [
            UniversalNormMetric(
                metric="Volume",
                patient_value=data.volume_ml,
                universal_norm_target=1.4,
                unit="mL",
                patient_normalized_pct=norm_pct(data.volume_ml, 1.4),
                status="Above Universal Norm" if data.volume_ml >= 1.4 else "Below Norm",
                clinical_interpretation="Seminal vesicle & prostate fluid contribution (Universal norm ≥ 1.4 mL).",
            ),
            UniversalNormMetric(
                metric="Concentration",
                patient_value=data.concentration_m_ml,
                universal_norm_target=16.0,
                unit="M/mL",
                patient_normalized_pct=norm_pct(data.concentration_m_ml, 16.0),
                status="Above Universal Norm"
                if data.concentration_m_ml >= 16.0
                else ("Critical Deficit" if data.concentration_m_ml < 5.0 else "Below Norm"),
                clinical_interpretation="Seminiferous tubule output across the 75-day cycle (Universal norm ≥ 16 M/mL).",
            ),
            UniversalNormMetric(
                metric="Motility",
                patient_value=data.motility_pct,
                universal_norm_target=42.0,
                unit="%",
                patient_normalized_pct=norm_pct(data.motility_pct, 42.0),
                status="Above Universal Norm" if data.motility_pct >= 42.0 else "Below Norm",
                clinical_interpretation="Progressive & non-progressive ciliary propulsion (Universal norm ≥ 42%).",
            ),
            UniversalNormMetric(
                metric="Morphology",
                patient_value=data.morphology_pct,
                universal_norm_target=4.0,
                unit="%",
                patient_normalized_pct=norm_pct(data.morphology_pct, 4.0),
                status="Above Universal Norm" if data.morphology_pct >= 4.0 else "Below Norm",
                clinical_interpretation="Strict Kruger normal forms (Universal norm ≥ 4%).",
            ),
            UniversalNormMetric(
                metric="Viability",
                patient_value=data.viability_pct,
                universal_norm_target=54.0,
                unit="%",
                patient_normalized_pct=norm_pct(data.viability_pct, 54.0),
                status="Above Universal Norm" if data.viability_pct >= 54.0 else "Below Norm",
                clinical_interpretation="Membrane-intact live spermatozoa (Universal norm ≥ 54%).",
            ),
            UniversalNormMetric(
                metric="Testosterone",
                patient_value=data.testosterone_ng_dl,
                universal_norm_target=350.0,
                unit="ng/dL",
                patient_normalized_pct=norm_pct(data.testosterone_ng_dl, 350.0),
                status="Above Universal Norm" if data.testosterone_ng_dl >= 300.0 else "Below Norm",
                clinical_interpretation="Leydig cell androgen synthesis (Reference ≥ 300–350 ng/dL).",
            ),
        ]

        # 5. Vitality Score & Comprehensive Doctor Support Note
        score = 100
        if is_azo:
            score -= 65
        elif is_severe_oligo:
            score -= 45
        elif is_oligo:
            score -= 22
        if is_astheno:
            score -= 15
        if is_terato:
            score -= 12
        if data.taking_exogenous_testosterone:
            score -= 20
        score = max(10, min(98, score))

        deficit_metrics = [m.metric for m in universal_comparison if m.patient_normalized_pct < 100]
        if not deficit_metrics:
            comparison_sentence = (
                "All primary semen and endocrine biomarkers meet or exceed the WHO 6th Edition Universal Reference Norms."
            )
        else:
            comparison_sentence = (
                f"Compared against Universal WHO Norms, this patient exhibits deficits in: {', '.join(deficit_metrics)}."
            )

        support_note = (
            f"CLINICAL DECISION-SUPPORT SUMMARY: Patient presents with {primary_nomenclature} under a "
            f"{etiology} pattern (Fertility Vitality Index: {score}/100). {comparison_sentence} "
            f"Endocrine profile shows FSH {data.fsh_miu_ml} mIU/mL, LH {data.lh_miu_ml} mIU/mL, and Total Testosterone "
            f"{data.testosterone_ng_dl} ng/dL. "
        )
        if genetic_workup:
            support_note += f"Priority Genetic Workup: {' | '.join(genetic_workup)}. "
        if imaging_workup:
            support_note += f"Indicated Imaging: {' | '.join(imaging_workup)}. "
        if treatment_recommendations:
            support_note += f"Recommended Clinical Pathway: {' | '.join(treatment_recommendations)}"

        return {
            "primary_nomenclature": primary_nomenclature,
            "nomenclature_tags": tags,
            "etiology_category": etiology,
            "vitality_score": score,
            "clinical_support_note": support_note,
            "universal_norm_comparison": [m.model_dump() for m in universal_comparison],
            "genetic_workup": genetic_workup or ["No immediate genetic karyotype/Y-microdeletion triggers met."],
            "imaging_workup": imaging_workup or ["Routine scrotal/TRUS imaging not required at baseline."],
            "treatment_recommendations": treatment_recommendations
            or ["Continue 75-day spermatogenesis lifestyle optimization and concurrent partner evaluation."],
            "red_flags": red_flags,
        }
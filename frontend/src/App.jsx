import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Dna,
  FileText,
  FlaskConical,
  Globe,
  HeartPulse,
  Lock,
  LogOut,
  MessageSquareQuote,
  Microscope,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  UserPlus,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
} from "recharts";
import {
  apiLogin,
  apiRegisterPatient,
  apiGetAdminOverview,
  apiCreateDoctorByAdmin,
  apiAssignPatientToDoctor,
  apiGetDoctorPatients,
  apiGetPatientFile,
  apiEvaluateAndSavePatient,
  apiSaveDoctorNote,
  apiGetPatientDashboard,
  apiLogPatientJournal,
} from "./api/fertilityApi";

// ============================================================================
// COMPREHENSIVE MEDICAL KNOWLEDGE BASE FROM THE TRI-VANCE RESEARCH PAPER
// ============================================================================
const PAPER_KNOWLEDGE_CARDS = [
  // PILLAR 1: HPG AXIS & PHYSIOLOGY
  {
    category: "physiology",
    tag: "Reproductive Physiology",
    title: "The 75-Day Spermatogenesis Cycle",
    summary:
      "Germ cells (diploid spermatogonia, 2n) develop into mature haploid spermatozoa (1n) through mitosis, meiosis, and spermiogenesis inside the seminiferous tubules over ~75 days, followed by epididymal maturation.",
    clinicalPearl:
      "Any lifestyle modification, fever, gonadotoxin exposure, or endocrine therapy requires approximately 2.5 months (75 days) to fully manifest on a repeat semen analysis.",
  },
  {
    category: "physiology",
    tag: "HPG-Axis Signaling",
    title: "Hypothalamic–Pituitary–Gonadal (HPG) Feedback Loop",
    summary:
      "Hypothalamic GnRH stimulates the anterior pituitary to secrete LH and FSH. LH acts on interstitial Leydig cells to drive intratesticular testosterone. FSH acts on Sertoli cells to support spermatogenesis.",
    clinicalPearl:
      "Testosterone and Estradiol (converted via adipose aromatase) inhibit LH release, while Sertoli-derived Inhibin negatively feeds back on pituitary FSH secretion.",
  },
  {
    category: "physiology",
    tag: "AUA Safety Contraindication",
    title: "Why Exogenous Testosterone Halts Sperm Production",
    summary:
      "Exogenous testosterone or anabolic steroids trigger negative feedback at the hypothalamus and pituitary gland, shutting down endogenous GnRH, LH, and FSH secretion.",
    clinicalPearl:
      "Without LH stimulation of Leydig cells, intratesticular testosterone plummets, resulting in severe oligozoospermia or complete iatrogenic azoospermia. Never prescribe exogenous T to men desiring fertility.",
  },

  // PILLAR 2: CAUSES, NOMENCLATURE & GENETICS
  {
    category: "genetics",
    tag: "Chromosomal Anomaly",
    title: "Klinefelter Syndrome (47,XXY)",
    summary:
      "Characterized by an extra X chromosome (47,XXY), tall stature, gynecomastia, testicular atrophy, hypergonadotropic hypogonadism (elevated FSH/LH, low T), and non-obstructive azoospermia.",
    clinicalPearl:
      "Detected via Karyotype analysis. Associated with osteoporosis and pubertal abnormalities. Micro-TESE coupled with ICSI offers biological parenthood opportunities.",
  },
  {
    category: "genetics",
    tag: "Obstructive Genetics",
    title: "Cystic Fibrosis & CBAVD (CFTR Mutation)",
    summary:
      "Abnormal epithelial chloride channel transport causes Congenital Bilateral Absence of the Vas Deferens (CBAVD) and obstructive azoospermia alongside respiratory and pancreatic insufficiency.",
    clinicalPearl:
      "Men have normal testicular spermatogenesis and normal FSH/Testosterone, but low ejaculate volume and acidic pH. Requires CFTR mutation testing, partner carrier screening, and a Renal Ultrasound.",
  },
  {
    category: "genetics",
    tag: "Ultrastructural Cilia Defect",
    title: "Kartagener Syndrome (Primary Ciliary Dyskinesia)",
    summary:
      "Impaired ciliary and flagellar motor function leads to markedly abnormal or absent sperm motility (severe asthenozoospermia) despite normal sperm concentrations.",
    clinicalPearl:
      "Presents with the classic triad of situs inversus, chronic sinusitis, and bronchiectasis. Because sperm are viable, ICSI can bypass flagellar immotility.",
  },
  {
    category: "genetics",
    tag: "Pre-Testicular Endocrine",
    title: "Kallmann Syndrome (Hypogonadotropic Hypogonadism)",
    summary:
      "Failure of GnRH-secreting neurons to migrate results in absent hypothalamic GnRH production, secondary hypogonadism (low FSH, low LH, low T), and anosmia (loss of smell).",
    clinicalPearl:
      "One of the most medically reversible forms of severe male infertility—responds to Human Chorionic Gonadotropin (hCG) and FSH analogue replacement.",
  },
  {
    category: "genetics",
    tag: "Semen Nomenclature",
    title: "WHO & AUA Diagnostic Terminology",
    summary:
      "Aspermia (no ejaculate), Azoospermia (0 sperm), Oligozoospermia (<16M/mL), Severe Oligospermia (<5M/mL), Asthenozoospermia (<42% motility), Teratozoospermia (<4% morphology), and OAT Syndrome (combined deficit).",
    clinicalPearl:
      "Idiopathic infertility refers to unexplained abnormal semen parameters, whereas unexplained infertility describes infertility with normal male and female baseline workups.",
  },

  // PILLAR 3: AUA/ASRM 2020/2024 DIAGNOSTICS
  {
    category: "diagnostics",
    tag: "2024 Guideline Amendment",
    title: "TRUS & Pelvic MRI for Ejaculatory Duct Obstruction (EDO)",
    summary:
      "Transrectal Ultrasound (TRUS) or Pelvic MRI (updated in the 2024 AUA/ASRM amendment) is indicated when semen analysis reveals low volume (<1.4 mL), acidic pH (<7.2), and azoospermia with normal serum testosterone and palpable vas deferens.",
    clinicalPearl:
      "Routine scrotal ultrasound, antisperm antibody testing, and diagnostic testicular biopsy are NOT recommended during the initial evaluation of every infertile male.",
  },
  {
    category: "diagnostics",
    tag: "Molecular Genetics",
    title: "Karyotype & Y-Chromosome Microdeletion Triggers",
    summary:
      "Karyotype analysis is recommended in primary infertility with azoospermia or concentration <5M/mL when accompanied by elevated FSH or testicular atrophy. Y-chromosome microdeletion testing is indicated at ≤1M/mL.",
    clinicalPearl:
      "Genetic counselling is mandatory before assisted reproduction because chromosomal and Y-microdeletion defects can be vertically transmitted to male offspring.",
  },
  {
    category: "diagnostics",
    tag: "Specialised Assays",
    title: "Sperm DNA Fragmentation & Post-Ejaculatory Urinalysis",
    summary:
      "Sperm DNA fragmentation testing is not routine initially, but is specifically indicated for couples with recurrent pregnancy loss (RPL). Post-ejaculatory urinalysis evaluates suspected retrograde ejaculation.",
    clinicalPearl:
      "The 2024 AUA/ASRM amendment also discusses considering surgically retrieved testicular sperm for ICSI in selected non-azoospermic men with persistently elevated sperm DNA fragmentation.",
  },

  // PILLAR 4: TREATMENTS, SURGERY & ART
  {
    category: "treatment",
    tag: "Microsurgery",
    title: "Micro-TESE vs. Clinical Varicocelectomy",
    summary:
      "Microdissection Testicular Sperm Extraction (Micro-TESE) uses an operating microscope to locate sperm-producing tubules in non-obstructive azoospermia while sparing Leydig tissue. Varicocelectomy repairs dilated pampiniform plexus veins.",
    clinicalPearl:
      "AUA/ASRM guidelines recommend varicocelectomy ONLY when the varicocele is clinically palpable on physical exam alongside abnormal semen parameters—never for non-palpable imaging-only varicoceles.",
  },
  {
    category: "treatment",
    tag: "Endocrine Pharmacology",
    title: "SERMs, Aromatase Inhibitors, hCG & FSH Analogues",
    summary:
      "Clomiphene Citrate (SERM) blocks estrogen negative feedback at the hypothalamus/pituitary to boost endogenous LH, FSH, and intratesticular T. Aromatase inhibitors block T-to-Estradiol conversion in adipose tissue.",
    clinicalPearl:
      "hCG directly stimulates Leydig cells in hypogonadotropic hypogonadism, while exogenous FSH analogues may improve sperm counts in selected idiopathic oligozoospermic men.",
  },
  {
    category: "treatment",
    tag: "Assisted Reproduction & Oncofertility",
    title: "IUI, IVF, ICSI & Pre-Chemo Sperm Cryopreservation",
    summary:
      "IUI concentrates motile sperm into the uterus for mild cases; IVF and ICSI (injecting a single sperm into an oocyte) overcome severe male factor or surgical retrieval. Cryopreservation freezes sperm prior to gonadotoxic cancer therapy.",
    clinicalPearl:
      "Men facing chemotherapy, pelvic radiotherapy, or orchidectomy must be counselled to bank multiple cryopreserved semen specimens BEFORE treatment begins.",
  },

  // PILLAR 5: PREVALENCE, COMORBIDITIES & PREVENTION
  {
    category: "epidemiology",
    tag: "Systemic Health & Longevity",
    title: "Male Infertility as a Biomarker for Testicular Cancer & Mortality",
    summary:
      "The AUA/ASRM guideline highlights that men with abnormal semen parameters have an elevated risk of testicular malignancy, hypogonadism, and overall morbidity compared to fertile peers.",
    clinicalPearl:
      "Additionally, advanced paternal age (≥40 years) is associated with increased sperm DNA fragmentation, de novo genetic mutations, and offspring congenital disorders.",
  },
  {
    category: "epidemiology",
    tag: "Pediatric & Environmental Prevention",
    title: "Cryptorchidism (6–12 Months) & Occupational Toxin Shielding",
    summary:
      "Bilateral or unilateral undescended testes (cryptorchidism) should be referred to a pediatric urologist within the first 6–12 months of life for orchidopexy to preserve germ cell potential.",
    clinicalPearl:
      "Adult prevention centers on tobacco/alcohol cessation, healthy BMI, STI prevention, and personal protective equipment (PPE) against agricultural pesticides, heavy metals, and ionizing radiation.",
  },
];

const WHO_REGIONAL_DATA = [
  { region: "Western Pacific (Highest Lifetime)", prevalence: 23.2, ci: "Lifetime WHO Region" },
  { region: "Global Lifetime Average (1 in 6)", prevalence: 17.5, ci: "95% CI: 15.0% – 20.3%" },
  { region: "African Region (Highest Period)", prevalence: 16.4, ci: "Period WHO Region" },
  { region: "Global Period Average", prevalence: 12.6, ci: "95% CI: 10.7% – 14.6%" },
  { region: "Eastern Mediterranean (Lowest)", prevalence: 10.7, ci: "10.7% Lifetime / 10.0% Period" },
];

export default function App() {
  // Navigation & Auth State
  const [view, setView] = useState("landing"); // "landing" | "auth" | "portal"
  const [authTab, setAuthTab] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [adminViewMode, setAdminViewMode] = useState("ADMIN");
  const [statusMessage, setStatusMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Landing Page Simulator & Knowledge Explorer State
  const [simConc, setSimConc] = useState(19);
  const [simMotility, setSimMotility] = useState(46);
  const [knowledgeCategory, setKnowledgeCategory] = useState("all");
  const [knowledgeSearch, setKnowledgeSearch] = useState("");
  const [selectedHpgPreset, setSelectedHpgPreset] = useState("normal");

  // Auth Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupForm, setSignupForm] = useState({
    full_name: "",
    email: "",
    password: "",
    age: 31,
    infertility_type: "primary",
    months_trying: 14,
  });

  // System Admin State
  const [adminData, setAdminData] = useState({ doctors: [], patients: [] });
  const [newDoctorForm, setNewDoctorForm] = useState({
    full_name: "",
    email: "",
    password: "",
    specialization: "Andrology & Reproductive Urology",
    license_number: "KMPDC-2026-88",
  });

  // Doctor Portal State
  const [doctorRoster, setDoctorRoster] = useState([]);
  const [selectedPatientFile, setSelectedPatientFile] = useState(null);
  const [clinicalForm, setClinicalForm] = useState(null);
  const [doctorNoteDraft, setDoctorNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Patient Portal State
  const [patientDashboard, setPatientDashboard] = useState(null);
  const [journalForm, setJournalForm] = useState({
    cycle_day: 25,
    avoided_tobacco_alcohol: true,
    heat_and_toxin_protection: true,
    balanced_nutrition_exercise: true,
    zero_exogenous_steroids: true,
    sleep_hours: 7.5,
    mood_score: 8,
    personal_reflection: "",
  });

  const notify = (text, type = "info") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  useEffect(() => {
    if (!currentUser) return;
    const activeRole = currentUser.role === "ADMIN" ? adminViewMode : currentUser.role;

    if (activeRole === "ADMIN") {
      loadAdminOverview();
    } else if (activeRole === "DOCTOR") {
      loadDoctorRoster();
    } else if (activeRole === "PATIENT") {
      loadPatientPortal();
    }
  }, [currentUser, adminViewMode]);

  const loadAdminOverview = async () => {
    try {
      setLoading(true);
      const data = await apiGetAdminOverview();
      setAdminData(data);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorRoster = async () => {
    try {
      setLoading(true);
      setSelectedPatientFile(null);
      const data = await apiGetDoctorPatients();
      setDoctorRoster(data.patients || []);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const loadPatientPortal = async () => {
    try {
      setLoading(true);
      const data = await apiGetPatientDashboard();
      setPatientDashboard(data);
      if (data.track_record && data.track_record.length > 0) {
        const lastDay = data.track_record[data.track_record.length - 1].cycle_day;
        setJournalForm((prev) => ({
          ...prev,
          cycle_day: Math.min(75, lastDay + 1),
        }));
      }
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // --- AUTH HANDLERS ---
  const handleLoginSubmit = async (e, presetEmail, presetPass) => {
    if (e) e.preventDefault();
    const emailToUse = presetEmail || loginEmail;
    const passToUse = presetPass || loginPassword;
    try {
      setLoading(true);
      const res = await apiLogin(emailToUse, passToUse);
      localStorage.setItem("trivance_token", res.access_token);
      setCurrentUser(res.user);
      setAdminViewMode(res.user.role);
      setView("portal");
      notify(`Welcome back, ${res.user.full_name}`, "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSignupSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await apiRegisterPatient(signupForm);
      localStorage.setItem("trivance_token", res.access_token);
      setCurrentUser(res.user);
      setAdminViewMode("PATIENT");
      setView("portal");
      notify("Patient account created and assigned to an on-call specialist!", "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("trivance_token");
    setCurrentUser(null);
    setSelectedPatientFile(null);
    setView("landing");
  };

  // --- ADMIN HANDLERS ---
  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiCreateDoctorByAdmin(newDoctorForm);
      setNewDoctorForm({
        full_name: "",
        email: "",
        password: "",
        specialization: "Andrology & Reproductive Urology",
        license_number: "KMPDC-2026-99",
      });
      notify("Doctor account created by System Admin.", "success");
      loadAdminOverview();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReassignPatient = async (patientId, newDoctorId) => {
    try {
      await apiAssignPatientToDoctor(newDoctorId, patientId);
      notify("Patient assignment updated in PostgreSQL.", "success");
      loadAdminOverview();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  // --- DOCTOR HANDLERS ---
  const handleOpenPatientFile = async (patientId) => {
    try {
      setLoading(true);
      const fileData = await apiGetPatientFile(patientId);
      setSelectedPatientFile(fileData);
      setDoctorNoteDraft(fileData.doctor_custom_note || "");
      setClinicalForm(
        fileData.raw_clinical_inputs || {
          volume_ml: 2.0,
          concentration_m_ml: 12.0,
          motility_pct: 36.0,
          morphology_pct: 3.0,
          viability_pct: 60.0,
          ph: 7.4,
          fsh_miu_ml: 5.5,
          lh_miu_ml: 4.8,
          testosterone_ng_dl: 420.0,
          prolactin_ng_ml: 10.0,
          palpable_varicocele: false,
          vas_deferens_present: true,
          testicular_atrophy: false,
          taking_exogenous_testosterone: false,
          recurrent_pregnancy_loss: false,
          upcoming_gonadotoxic_therapy: false,
        }
      );
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRunDoctorEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedPatientFile) return;
    try {
      setLoading(true);
      await apiEvaluateAndSavePatient(selectedPatientFile.patient.id, {
        ...clinicalForm,
        doctor_custom_note: doctorNoteDraft,
      });
      const updatedFile = await apiGetPatientFile(selectedPatientFile.patient.id);
      setSelectedPatientFile(updatedFile);
      notify("Clinical evaluation & Universal Norm comparison saved to database.", "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDoctorNoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientFile) return;
    try {
      setSavingNote(true);
      await apiSaveDoctorNote(selectedPatientFile.patient.id, doctorNoteDraft);
      const updatedFile = await apiGetPatientFile(selectedPatientFile.patient.id);
      setSelectedPatientFile(updatedFile);
      notify("Doctor's Note published directly to the Patient's Portal!", "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSavingNote(false);
    }
  };

  const handleAutoDraftPatientFriendlyNote = () => {
    if (!selectedPatientFile || !selectedPatientFile.cdss_evaluation) return;
    const ptName = selectedPatientFile.patient.full_name.split(" ")[0];
    const evalData = selectedPatientFile.cdss_evaluation;
    const tx = evalData.treatment_recommendations?.join(" ") || "";
    const draft = `Hi ${ptName} — I have reviewed your latest semen and hormone panel (${evalData.primary_nomenclature}, Vitality Index ${evalData.vitality_score}/100). Recommended next steps: ${tx} Please continue logging your daily habits in the 75-Day Spermatogenesis Journal and avoid any exogenous testosterone or heat exposure before our next clinic visit.`;
    setDoctorNoteDraft(draft);
  };

  // --- PATIENT JOURNAL HANDLER ---
  const handleSaveJournal = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiLogPatientJournal(journalForm);
      await loadPatientPortal();
      notify(`Day ${journalForm.cycle_day} logged to your 75-day track record!`, "success");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // VIEW 1: FULL-BLEED LANDING PAGE WITH COMPREHENSIVE RESEARCH COMPENDIUM
  // =========================================================================
  const renderLanding = () => {
    const isConcNormal = simConc >= 16;
    const isMotNormal = simMotility >= 42;
    let simVerdict = "Normozoospermia (Meets WHO Universal Norms)";
    if (simConc === 0) simVerdict = "Azoospermia (Requires Hormonal & Obstructive Workup)";
    else if (!isConcNormal && !isMotNormal) simVerdict = "Oligoasthenozoospermia (Combined Deficit)";
    else if (!isConcNormal) simVerdict = simConc < 5 ? "Severe Oligozoospermia (<5 M/mL)" : "Oligozoospermia (<16 M/mL)";
    else if (!isMotNormal) simVerdict = "Asthenozoospermia (Reduced Motility <42%)";

    const filteredCards = PAPER_KNOWLEDGE_CARDS.filter((card) => {
      const matchesCat = knowledgeCategory === "all" || card.category === knowledgeCategory;
      const q = knowledgeSearch.toLowerCase().trim();
      const matchesQuery =
        !q ||
        card.title.toLowerCase().includes(q) ||
        card.summary.toLowerCase().includes(q) ||
        card.clinicalPearl.toLowerCase().includes(q) ||
        card.tag.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });

    const hpgPresets = {
      normal: {
        label: "Healthy Euhormonal Axis",
        gnrh: "Pulsatile Normal",
        lhFsh: "Balanced LH & FSH",
        testis: "Active Leydig Testosterone & Sertoli Spermatogenesis (75-Day Cycle)",
        feedback: "Balanced Inhibin & Estradiol negative feedback maintains homeostasis.",
      },
      exogenous_t: {
        label: "Exogenous Testosterone / Steroid Suppression",
        gnrh: "Suppressed (-)",
        lhFsh: "Severely Suppressed LH & FSH",
        testis: "Collapsed Intratesticular T → Oligozoospermia / Azoospermia",
        feedback: "AUA Contraindication: Exogenous T tricks the pituitary into shutting down natural sperm production.",
      },
      klinefelter: {
        label: "Primary Testicular Failure (Klinefelter 47,XXY)",
        gnrh: "Elevated Drive (+)",
        lhFsh: "Markedly Elevated FSH & LH",
        testis: "Seminiferous Tubule Hyalinization & Low Testosterone",
        feedback: "Lack of Sertoli Inhibin and Leydig Testosterone removes negative feedback on the pituitary.",
      },
      kallmann: {
        label: "Secondary Hypogonadism (Kallmann Syndrome)",
        gnrh: "Absent GnRH (Anosmia)",
        lhFsh: "Low / Undetectable LH & FSH",
        testis: "Unstimulated Testes (Reversible with hCG + FSH Therapy)",
        feedback: "Pre-testicular deficit; testes are structurally capable once gonadotropins are supplied.",
      },
    };

    const currentHpg = hpgPresets[selectedHpgPreset];

    return (
      <div className="w-full animate-editorial">
        {/* 1. HERO SECTION + INSTANT WHO SIMULATOR */}
        <section className="relative w-full border-b border-ivory-200 px-6 py-14 md:px-12 xl:px-20 lg:py-20">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-ivory-300 bg-ivory-100 px-4 py-1.5 text-xs uppercase tracking-widest text-botanical-800">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Tri-Vance Reproductive Intelligence · AUA/ASRM 2024 & WHO 6th Ed.</span>
              </div>

              <h1 className="font-serif text-5xl font-normal leading-[1.04] tracking-tight text-espresso-900 sm:text-7xl xl:text-8xl">
                Clarity for clinicians. <br />
                <span className="italic text-botanical-800">Continuity for men.</span>
              </h1>

              <p className="max-w-2xl text-lg font-light leading-relaxed text-espresso-600">
                Approximately <strong className="font-medium text-espresso-900">15% of couples</strong> struggle with infertility, with a male factor present in <strong className="font-medium text-espresso-900">50% of cases</strong> and serving as the sole etiology in <strong className="font-medium text-espresso-900">20%</strong>. Explore our clinical research compendium below or enter the role-based clinical & patient portals.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    setAuthTab("login");
                    setView("auth");
                  }}
                  className="inline-flex items-center gap-3 rounded-full bg-botanical-800 px-8 py-4 text-sm font-medium text-ivory-50 shadow-md transition hover:bg-espresso-900"
                >
                  <span>Doctor & Patient Login</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <a
                  href="#compendium"
                  className="inline-flex items-center gap-2 rounded-full border border-espresso-900 bg-transparent px-7 py-4 text-sm font-medium text-espresso-900 transition hover:bg-espresso-900 hover:text-ivory-50"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Explore Clinical Paper Knowledge</span>
                </a>
              </div>

              <div className="grid grid-cols-2 gap-8 border-t border-ivory-200 pt-8 sm:grid-cols-4">
                <div>
                  <p className="font-serif text-4xl font-semibold text-espresso-900">1 in 6</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-espresso-600">Global Lifetime Rate (17.5%)</p>
                </div>
                <div>
                  <p className="font-serif text-4xl font-semibold text-botanical-800">50%</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-espresso-600">Male Factor Contribution</p>
                </div>
                <div>
                  <p className="font-serif text-4xl font-semibold text-espresso-900">75 Days</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-espresso-600">Spermatogenesis Cycle</p>
                </div>
                <div>
                  <p className="font-serif text-4xl font-semibold text-terracotta-600">16.4%</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-espresso-600">WHO Africa Period Rate</p>
                </div>
              </div>
            </div>

            {/* Right Column: Instant WHO 6th Ed. Simulator */}
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-[2rem] border border-ivory-200 bg-white shadow-xl">
                <div className="relative h-60 w-full overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=85"
                    alt="Andrology laboratory microscopy"
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/80 via-espresso-900/20 to-transparent" />
                  <div className="absolute bottom-5 left-6 right-6 text-ivory-50">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ivory-200">
                      Interactive WHO 6th Ed. Sandbox
                    </span>
                    <h3 className="font-serif text-2xl font-normal">
                      Instant Semen Nomenclature Check
                    </h3>
                  </div>
                </div>

                <div className="p-8 space-y-5">
                  <div>
                    <div className="flex justify-between text-xs font-medium text-espresso-800">
                      <span>Sperm Concentration (Universal Norm ≥ 16 M/mL)</span>
                      <span className="font-mono font-semibold text-botanical-800">{simConc} M/mL</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={simConc}
                      onChange={(e) => setSimConc(Number(e.target.value))}
                      className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-ivory-200"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium text-espresso-800">
                      <span>Total Sperm Motility (Universal Norm ≥ 42%)</span>
                      <span className="font-mono font-semibold text-botanical-800">{simMotility}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={simMotility}
                      onChange={(e) => setSimMotility(Number(e.target.value))}
                      className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-ivory-200"
                    />
                  </div>

                  <div className="rounded-2xl border border-ivory-200 bg-ivory-50 p-5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-espresso-400">
                      Live Nomenclature Result
                    </span>
                    <p className="mt-1 font-serif text-2xl font-semibold text-espresso-900">
                      {simVerdict}
                    </p>
                    <p className="mt-1 text-xs text-espresso-600">
                      {simConc > 0 && simConc < 5
                        ? "AUA Trigger: Concentration <5 M/mL in primary infertility warrants Karyotype genetic testing."
                        : simConc === 0
                        ? "AUA Trigger: Evaluate FSH, Testosterone, ejaculate volume, and pH to distinguish obstructive vs. non-obstructive azoospermia."
                        : "Meets baseline concentration criteria; evaluate morphology (≥4%) and partner reproductive factors concurrently."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. INTERACTIVE HPG-AXIS & ENDOCRINE SIMULATOR SECTION */}
        <section className="w-full border-b border-ivory-200 bg-ivory-100/60 px-6 py-16 md:px-12 xl:px-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="font-mono text-xs uppercase tracking-widest text-botanical-800">
                Interactive Physiology · Figure 1 from Paper
              </span>
              <h2 className="font-serif text-4xl font-normal text-espresso-900">
                The Hypothalamic–Pituitary–Gonadal (HPG) Axis
              </h2>
              <p className="text-sm leading-relaxed text-espresso-600">
                Spermatogenesis is regulated by intratesticular testosterone and dihydrotestosterone (via 5α-reductase), governed by pituitary signaling. Click any clinical state below to see how hormonal derangement impacts fertility:
              </p>

              <div className="space-y-2 pt-2">
                {Object.entries(hpgPresets).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedHpgPreset(key)}
                    className={`w-full rounded-2xl border px-5 py-3.5 text-left text-xs font-semibold transition ${
                      selectedHpgPreset === key
                        ? "border-botanical-800 bg-botanical-800 text-ivory-50 shadow-sm"
                        : "border-ivory-300 bg-white text-espresso-800 hover:bg-ivory-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-[2rem] border border-ivory-200 bg-white p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-ivory-100 pb-4">
                  <span className="font-serif text-2xl font-medium text-espresso-900">
                    {currentHpg.label}
                  </span>
                  <span className="rounded-full bg-botanical-100 px-3 py-1 font-mono text-[11px] font-semibold text-botanical-800">
                    HPG Signaling Pathway
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-ivory-200 bg-ivory-50 p-5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-espresso-400">
                      1. Hypothalamus
                    </span>
                    <p className="mt-2 font-serif text-xl font-semibold text-espresso-900">
                      {currentHpg.gnrh}
                    </p>
                    <p className="mt-1 text-[11px] text-espresso-600">
                      Secretes GnRH to stimulate the anterior pituitary gland.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-ivory-200 bg-ivory-50 p-5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-espresso-400">
                      2. Anterior Pituitary
                    </span>
                    <p className="mt-2 font-serif text-xl font-semibold text-botanical-800">
                      {currentHpg.lhFsh}
                    </p>
                    <p className="mt-1 text-[11px] text-espresso-600">
                      LH targets Leydig cells; FSH targets Sertoli cells.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-ivory-200 bg-ivory-50 p-5">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-espresso-400">
                      3. Testes (Seminiferous Tubules)
                    </span>
                    <p className="mt-2 font-serif text-xl font-semibold text-terracotta-600">
                      {currentHpg.testis}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-botanical-900 p-5 text-xs leading-relaxed text-ivory-100">
                  <strong className="text-white">Endocrine Feedback Note:</strong> {currentHpg.feedback}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SEARCHABLE & FILTERABLE RESEARCH COMPENDIUM (ALL KNOWLEDGE FROM THE PAPER) */}
        <section id="compendium" className="w-full border-b border-ivory-200 px-6 py-16 md:px-12 xl:px-20">
          <div className="flex flex-col justify-between gap-6 border-b border-ivory-200 pb-8 lg:flex-row lg:items-end">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-botanical-800">
                Tri-Vance Research Compendium
              </span>
              <h2 className="mt-2 font-serif text-4xl font-normal text-espresso-900 sm:text-5xl">
                Evidence-Based Male Fertility <span className="italic">Knowledge Hub</span>
              </h2>
              <p className="mt-2 max-w-2xl text-xs text-espresso-600">
                Synthesized directly from the 2020/2024 American Urological Association (AUA) / American Society for Reproductive Medicine (ASRM) Guidelines and WHO 6th Edition Laboratory Manual.
              </p>
            </div>

            {/* Instant Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-espresso-400" />
              <input
                type="text"
                placeholder="Search Klinefelter, Micro-TESE, TRUS, FSH, ICSI..."
                value={knowledgeSearch}
                onChange={(e) => setKnowledgeSearch(e.target.value)}
                className="w-full rounded-full border border-ivory-300 bg-white pl-11 pr-4 py-3 text-xs text-espresso-900 shadow-sm focus:border-botanical-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { id: "all", label: "All Clinical Topics (15)" },
              { id: "physiology", label: "Physiology & HPG Axis" },
              { id: "genetics", label: "Causes, Nomenclature & Syndromes" },
              { id: "diagnostics", label: "AUA/ASRM 2024 Diagnostics & Imaging" },
              { id: "treatment", label: "Medical, Surgery (Micro-TESE) & ART" },
              { id: "epidemiology", label: "Comorbidities, Cancer Risk & Prevention" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setKnowledgeCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  knowledgeCategory === cat.id
                    ? "bg-botanical-800 text-ivory-50 shadow-sm"
                    : "border border-ivory-300 bg-white text-espresso-600 hover:bg-ivory-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Knowledge Cards Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCards.map((card, index) => (
              <div
                key={index}
                className="flex flex-col justify-between rounded-3xl border border-ivory-200 bg-white p-7 shadow-sm transition hover:border-botanical-800/40 hover:shadow-md"
              >
                <div>
                  <span className="inline-block rounded-full bg-ivory-100 px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-botanical-800">
                    {card.tag}
                  </span>
                  <h3 className="mt-3 font-serif text-2xl font-semibold text-espresso-900">
                    {card.title}
                  </h3>
                  <p className="mt-2.5 text-xs leading-relaxed text-espresso-600">
                    {card.summary}
                  </p>
                </div>

                <div className="mt-5 rounded-2xl border border-ivory-200 bg-ivory-50 p-4">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-terracotta-600">
                    AUA/ASRM Clinical Pearl
                  </span>
                  <p className="mt-1 text-[11px] leading-relaxed text-espresso-800">
                    {card.clinicalPearl}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. WHO GLOBAL PREVALENCE ATLAS & PSYCHOLOGICAL/SYSTEMIC HEALTH */}
        <section className="w-full px-6 py-16 md:px-12 xl:px-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 rounded-3xl border border-ivory-200 bg-white p-8 shadow-sm">
              <span className="font-mono text-xs uppercase tracking-widest text-botanical-800">
                World Health Organization Epidemiology (1990–2021 / 2022 Estimates)
              </span>
              <h3 className="mt-1 font-serif text-3xl font-normal text-espresso-900">
                Global & Regional Infertility Prevalence (%)
              </h3>
              <p className="mt-1 text-xs text-espresso-600">
                Western Pacific holds the highest lifetime prevalence (23.2%), while the WHO African Region holds the highest period prevalence (16.4%).
              </p>

              <div className="mt-6 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={WHO_REGIONAL_DATA} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D3" />
                    <XAxis type="number" domain={[0, 26]} unit="%" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="region" type="category" width={190} tick={{ fontSize: 11, fill: "#191715" }} />
                    <Tooltip
                      formatter={(val) => [`${val}%`, "Prevalence Rate"]}
                      contentStyle={{ borderRadius: "14px", backgroundColor: "#FAF7F2", border: "1px solid #EAE2D3" }}
                    />
                    <Bar dataKey="prevalence" name="WHO Prevalence (%)" fill="#1E3A2F" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-ivory-200 bg-botanical-900 p-8 text-ivory-50 space-y-4">
                <span className="font-mono text-xs uppercase tracking-widest text-ivory-200">
                  Beyond Conception · Holistic Impact
                </span>
                <h3 className="font-serif text-3xl font-normal">
                  Psychological, Social & Oncological Implications
                </h3>
                <p className="text-xs leading-relaxed text-ivory-200">
                  Male infertility carries profound psychological distress—depression, anxiety, reduced self-esteem, marital conflict, and social stigma—alongside increased financial burden.
                </p>
                <div className="grid grid-cols-1 gap-3 border-t border-ivory-50/15 pt-4 text-xs">
                  <div className="rounded-2xl bg-ivory-50/10 p-4">
                    <strong className="text-white">Testicular Malignancy & Mortality Link:</strong> Abnormal semen parameters are associated with higher risks of testicular cancer and systemic morbidity, making comprehensive physical evaluation vital.
                  </div>
                  <div className="rounded-2xl bg-ivory-50/10 p-4">
                    <strong className="text-white">Paternal Age ≥ 40 Years:</strong> Linked to elevated sperm DNA fragmentation, de novo genetic mutations, and offspring congenital conditions.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  };
  // =========================================================================
  // VIEW 2: LOGIN & PATIENT SIGN-UP PAGE (ALL DUMMY PATIENTS + DOCTORS + ADMIN)
  // =========================================================================
  const renderAuthPage = () => (
    <div className="w-full animate-editorial px-6 py-12 md:px-12 xl:px-20">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Complete Judge Demo Directory */}
        <div className="lg:col-span-6 space-y-6">
          <div className="overflow-hidden rounded-[2rem] border border-ivory-200 bg-botanical-900 text-ivory-50 shadow-xl">
            <div className="p-8 space-y-6">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-ivory-200">
                  Interactive Hackathon  Sandbox
                </span>
                <h2 className="mt-1 font-serif text-3xl font-normal sm:text-4xl">
                  1-Click Demo Accounts
                </h2>
                <p className="mt-2 text-xs text-ivory-200/90 leading-relaxed">
                  Click any patient or clinician below to log in immediately, or type the credentials manually on the right to test role-based routing and doctor-to-patient assignments.
                </p>
              </div>

              {/* 1. ALL DUMMY PATIENT ACCOUNTS */}
              <div className="space-y-2.5 border-t border-ivory-50/15 pt-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-terracotta-500">
                    1. Dummy Patient Accounts (Password: patient123)
                  </span>
                  <span className="font-mono text-[10px] text-ivory-200">75-Day Journal & Doctor Notes</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleLoginSubmit(null, "michael@patient.med", "patient123")}
                    className="flex items-center justify-between rounded-2xl border border-ivory-50/15 bg-ivory-50/10 px-4 py-3 text-left text-xs transition hover:bg-ivory-50/20"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        Michael Ochieng <span className="font-mono text-[11px] font-normal text-ivory-200">(michael@patient.med)</span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-ivory-200">
                        Assigned to <strong>Dr. Kaswii Ruth</strong> · Case: Clinical Varicocele & OAT Syndrome
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-ivory-200" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoginSubmit(null, "david@patient.med", "patient123")}
                    className="flex items-center justify-between rounded-2xl border border-ivory-50/15 bg-ivory-50/10 px-4 py-3 text-left text-xs transition hover:bg-ivory-50/20"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        David Kamau <span className="font-mono text-[11px] font-normal text-ivory-200">(david@patient.med)</span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-ivory-200">
                        Assigned to <strong>Dr. Kaswii Ruth</strong> · Case: Klinefelter Non-Obstructive Azoospermia
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-ivory-200" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoginSubmit(null, "james@patient.med", "patient123")}
                    className="flex items-center justify-between rounded-2xl border border-ivory-50/15 bg-ivory-50/10 px-4 py-3 text-left text-xs transition hover:bg-ivory-50/20"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        James Mwangi <span className="font-mono text-[11px] font-normal text-ivory-200">(james@patient.med)</span>
                      </p>
                      <p className="mt-0.5 text-[11px] text-ivory-200">
                        Assigned to <strong>Dr. Chepkemoi Abigail</strong> · Case: Ejaculatory Duct Obstruction (EDO)
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-ivory-200" />
                  </button>
                </div>
              </div>

              {/* 2. CLINICIAN / DOCTOR ACCOUNTS */}
              <div className="space-y-2.5 border-t border-ivory-50/15 pt-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ivory-200">
                    2. Clinician Portals (Password: doctor123)
                  </span>
                  <span className="font-mono text-[10px] text-ivory-200">WHO Norm Graphs & CDSS</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => handleLoginSubmit(null, "kaswii@trivance.med", "doctor123")}
                    className="flex items-center justify-between rounded-2xl border border-ivory-50/15 bg-ivory-50/10 px-4 py-3 text-left text-xs transition hover:bg-ivory-50/20"
                  >
                    <div>
                      <p className="font-semibold text-white">Dr. Kaswii Ruth</p>
                      <p className="font-mono text-[10px] text-ivory-200">kaswii@trivance.med</p>
                      <p className="mt-0.5 text-[10px] text-ivory-200">Roster: Michael & David</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoginSubmit(null, "abigail@trivance.med", "doctor123")}
                    className="flex items-center justify-between rounded-2xl border border-ivory-50/15 bg-ivory-50/10 px-4 py-3 text-left text-xs transition hover:bg-ivory-50/20"
                  >
                    <div>
                      <p className="font-semibold text-white">Dr. Chepkemoi Abigail</p>
                      <p className="font-mono text-[10px] text-ivory-200">abigail@trivance.med</p>
                      <p className="mt-0.5 text-[10px] text-ivory-200">Roster: James Mwangi</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0" />
                  </button>
                </div>
              </div>

              {/* 3. NEUTRAL HOSPITAL SYSTEM GOVERNANCE (ADMIN) */}
              <div className="space-y-2 border-t border-ivory-50/15 pt-5">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ivory-200">
                  3. Hospital Governance & RBAC Provisioning (Password: admin123)
                </span>
                <button
                  type="button"
                  onClick={() => handleLoginSubmit(null, "admin@trivance.med", "admin123")}
                  className="flex w-full items-center justify-between rounded-2xl bg-terracotta-600/90 px-4 py-3 text-left text-xs transition hover:bg-terracotta-600"
                >
                  <div>
                    <p className="font-semibold text-white">
                      Hospital System Administrator <span className="font-mono text-[11px] font-normal text-ivory-100">(admin@trivance.med)</span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-ivory-100">
                      Demonstrates Doctor account creation, patient-to-doctor assignment matrix & cross-portal inspection
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Standard Login & Patient Sign-Up Forms */}
        <div className="lg:col-span-6">
          <div className="rounded-[2rem] border border-ivory-200 bg-white p-8 shadow-lg sm:p-12">
            <div className="flex gap-2 rounded-full bg-ivory-100 p-1.5 mb-8">
              <button
                type="button"
                onClick={() => setAuthTab("login")}
                className={`flex-1 rounded-full py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                  authTab === "login"
                    ? "bg-botanical-800 text-ivory-50 shadow-sm"
                    : "text-espresso-600 hover:text-espresso-900"
                }`}
              >
                Role-Based Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthTab("signup")}
                className={`flex-1 rounded-full py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                  authTab === "signup"
                    ? "bg-botanical-800 text-ivory-50 shadow-sm"
                    : "text-espresso-600 hover:text-espresso-900"
                }`}
              >
                Patient Create Account
              </button>
            </div>

            {authTab === "login" ? (
              <form onSubmit={(e) => handleLoginSubmit(e)} className="space-y-5">
                <div>
                  <h3 className="font-serif text-3xl font-medium text-espresso-900">
                    Sign In to Tri-Vance
                  </h3>
                  <p className="mt-1 text-xs text-espresso-600">
                    Routes you to the Patient, Doctor, or Hospital Admin workspace based on your account role.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-espresso-600">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="michael@patient.med or kaswii@trivance.med"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-ivory-300 bg-ivory-50 px-4 py-3.5 text-sm focus:border-botanical-800 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-espresso-600">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-ivory-300 bg-ivory-50 px-4 py-3.5 text-sm focus:border-botanical-800 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-botanical-800 py-4 text-sm font-semibold text-ivory-50 transition hover:bg-espresso-900"
                >
                  {loading ? "Authenticating..." : "Sign In to Workspace"}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePatientSignupSubmit} className="space-y-4">
                <div>
                  <h3 className="font-serif text-3xl font-medium text-espresso-900">
                    Create Patient Companion Account
                  </h3>
                  <p className="mt-1 text-xs text-espresso-600">
                    New patients are automatically assigned to an on-call reproductive specialist.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-espresso-800">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samuel Njoroge"
                      value={signupForm.full_name}
                      onChange={(e) => setSignupForm({ ...signupForm, full_name: e.target.value })}
                      className="mt-1.5 w-full rounded-2xl border border-ivory-300 bg-ivory-50 px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-espresso-800">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="samuel@patient.med"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      className="mt-1.5 w-full rounded-2xl border border-ivory-300 bg-ivory-50 px-4 py-3 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-espresso-800">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Min 4 chars"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      className="mt-1.5 w-full rounded-2xl border border-ivory-300 bg-ivory-50 px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-espresso-800">Age (Years)</label>
                    <input
                      type="number"
                      min="18"
                      max="80"
                      value={signupForm.age}
                      onChange={(e) => setSignupForm({ ...signupForm, age: Number(e.target.value) })}
                      className="mt-1.5 w-full rounded-2xl border border-ivory-300 bg-ivory-50 px-4 py-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-espresso-800">History Type</label>
                    <select
                      value={signupForm.infertility_type}
                      onChange={(e) => setSignupForm({ ...signupForm, infertility_type: e.target.value })}
                      className="mt-1.5 w-full rounded-2xl border border-ivory-300 bg-ivory-50 px-4 py-3 text-sm"
                    >
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-botanical-800 py-4 text-sm font-semibold text-ivory-50 transition hover:bg-espresso-900"
                >
                  {loading ? "Creating Account..." : "Register & Start 75-Day Journal"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  

  // =========================================================================
  // VIEW 3A: SYSTEM ADMIN PORTAL
  // =========================================================================
  const renderAdminPortal = () => (
    <div className="w-full animate-editorial px-6 py-10 md:px-12 xl:px-20 space-y-12">
      <div className="border-b border-ivory-200 pb-6">
        <span className="font-mono text-xs uppercase tracking-widest text-terracotta-600">
          System Administrator Control Center
        </span>
        <h2 className="mt-1 font-serif text-4xl font-normal text-espresso-900">
          Doctor Account Provisioning & Patient Assignment Matrix
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <form
            onSubmit={handleCreateDoctor}
            className="rounded-3xl border border-ivory-200 bg-white p-8 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2.5 border-b border-ivory-100 pb-4">
              <Stethoscope className="h-5 w-5 text-botanical-800" />
              <h3 className="font-serif text-2xl font-medium">Provision New Doctor Account</h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-espresso-800">Doctor Full Name</label>
              <input
                type="text"
                required
                placeholder="Dr. Brian Kiprop"
                value={newDoctorForm.full_name}
                onChange={(e) => setNewDoctorForm({ ...newDoctorForm, full_name: e.target.value })}
                className="mt-1 w-full rounded-xl border border-ivory-300 bg-ivory-50 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-espresso-800">Clinical Email</label>
                <input
                  type="email"
                  required
                  placeholder="kiprop@trivance.med"
                  value={newDoctorForm.email}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-ivory-300 bg-ivory-50 px-3.5 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-espresso-800">Temporary Password</label>
                <input
                  type="password"
                  required
                  placeholder="doctor123"
                  value={newDoctorForm.password}
                  onChange={(e) => setNewDoctorForm({ ...newDoctorForm, password: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-ivory-300 bg-ivory-50 px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-botanical-800 py-3.5 text-xs font-semibold uppercase tracking-wider text-ivory-50 hover:bg-espresso-900"
            >
              Create Verified Doctor in PostgreSQL
            </button>
          </form>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-ivory-200 bg-white p-8 shadow-sm">
            <h3 className="font-serif text-2xl font-medium">Patient-to-Doctor Assignment Matrix</h3>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-ivory-200 text-xs uppercase tracking-wider text-espresso-400">
                  <tr>
                    <th className="pb-3">Patient</th>
                    <th className="pb-3">Assigned Doctor</th>
                    <th className="pb-3 text-right">Reassign Specialist</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-100">
                  {adminData.patients.map((pt) => (
                    <tr key={pt.id}>
                      <td className="py-4">
                        <p className="font-semibold text-espresso-900">{pt.full_name}</p>
                        <p className="text-xs text-espresso-400">{pt.email}</p>
                      </td>
                      <td className="py-4">
                        <span className="rounded-full bg-botanical-100 px-3 py-1 text-xs font-medium text-botanical-800">
                          {pt.assigned_doctor_name}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <select
                          value={pt.assigned_doctor_id || ""}
                          onChange={(e) => handleReassignPatient(pt.id, e.target.value)}
                          className="rounded-xl border border-ivory-300 bg-ivory-50 px-3 py-1.5 text-xs font-medium text-espresso-900"
                        >
                          <option value="" disabled>Select Doctor</option>
                          {adminData.doctors.map((d) => (
                            <option key={d.id} value={d.id}>{d.full_name}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // VIEW 3B: DOCTOR PORTAL (ROSTER + UNIVERSAL NORM GRAPHS + DOCTOR'S NOTE)
  // =========================================================================
  const renderDoctorPortal = () => {
    if (!selectedPatientFile) {
      return (
        <div className="w-full animate-editorial px-6 py-10 md:px-12 xl:px-20 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ivory-200 pb-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-botanical-800">
                Clinician Decision-Support Roster
              </span>
              <h2 className="mt-1 font-serif text-4xl font-normal text-espresso-900">
                My Assigned Patients ({doctorRoster.length})
              </h2>
            </div>
            <button
              onClick={loadDoctorRoster}
              className="inline-flex items-center gap-2 rounded-full border border-ivory-300 bg-white px-5 py-2.5 text-xs font-medium hover:bg-ivory-100"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Roster
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-ivory-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ivory-200 bg-ivory-50 text-xs uppercase tracking-widest text-espresso-400">
                <tr>
                  <th className="p-6">Patient ID</th>
                  <th className="p-6">Patient Name</th>
                  <th className="p-6">Profile</th>
                  <th className="p-6">75-Day Journal</th>
                  <th className="p-6">AUA/WHO Classification</th>
                  <th className="p-6">Doctor's Note</th>
                  <th className="p-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-100">
                {doctorRoster.map((pt) => (
                  <tr key={pt.patient_id} className="transition hover:bg-ivory-50/70">
                    <td className="p-6 font-mono text-xs font-semibold text-botanical-800">
                      #PT-{1000 + pt.patient_id}
                    </td>
                    <td className="p-6">
                      <p className="font-semibold text-espresso-900">{pt.full_name}</p>
                      <p className="text-xs text-espresso-400">{pt.email}</p>
                    </td>
                    <td className="p-6 text-xs text-espresso-600">
                      {pt.age} yrs · <span className="capitalize">{pt.infertility_type}</span>
                    </td>
                    <td className="p-6">
                      <span className="rounded-full bg-ivory-100 px-3 py-1 font-mono text-xs text-espresso-800">
                        {pt.journal_days_logged} / 75 days
                      </span>
                    </td>
                    <td className="p-6">
                      <span className="rounded-full bg-botanical-100 px-3 py-1 text-xs font-medium text-botanical-800">
                        {pt.latest_nomenclature}
                      </span>
                    </td>
                    <td className="p-6">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                          pt.has_doctor_note
                            ? "bg-botanical-100 text-botanical-800"
                            : "bg-terracotta-100 text-terracotta-600"
                        }`}
                      >
                        {pt.has_doctor_note ? "Note Published" : "Needs Note"}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <button
                        onClick={() => handleOpenPatientFile(pt.patient_id)}
                        className="inline-flex items-center gap-2 rounded-full bg-espresso-900 px-5 py-2.5 text-xs font-medium text-ivory-50 transition hover:bg-botanical-800"
                      >
                        <span>Open File & Write Note</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    const evalData = selectedPatientFile.cdss_evaluation;
    const normChartData = evalData ? evalData.universal_norm_comparison : [];

    return (
      <div className="w-full animate-editorial px-6 py-10 md:px-12 xl:px-20 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory-200 pb-6">
          <div>
            <button
              onClick={() => setSelectedPatientFile(null)}
              className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-botanical-800 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Assigned Patient Table
            </button>
            <h2 className="font-serif text-4xl font-normal text-espresso-900">
              Clinical File: <span className="font-semibold">{selectedPatientFile.patient.full_name}</span>
            </h2>
          </div>

          {evalData && (
            <div className="rounded-2xl bg-botanical-900 px-6 py-4 text-ivory-50">
              <span className="block font-mono text-[10px] uppercase tracking-widest text-ivory-200">
                Fertility Vitality Index
              </span>
              <span className="font-serif text-4xl font-semibold">
                {evalData.vitality_score}
                <span className="text-lg font-normal text-ivory-200">/100</span>
              </span>
            </div>
          )}
        </div>

        {/* ===============================================================
            NEW FEATURE: PERSONAL DOCTOR'S NOTE STUDIO (SENT TO PATIENT)
           =============================================================== */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Automated System CDSS Summary */}
          {evalData && (
            <div className="lg:col-span-6 rounded-[2rem] border border-botanical-800/20 bg-botanical-900 p-8 text-ivory-50 shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full bg-ivory-50/10 px-4 py-1 font-mono text-[11px] uppercase tracking-widest text-ivory-200">
                  System CDSS Technical Summary
                </span>
                <span className="font-mono text-xs text-terracotta-500">
                  {evalData.etiology_category}
                </span>
              </div>
              <h3 className="font-serif text-3xl font-normal">{evalData.primary_nomenclature}</h3>
              <p className="text-xs leading-relaxed text-ivory-100/95 bg-ivory-50/5 p-5 rounded-2xl border border-ivory-50/10">
                {evalData.clinical_support_note}
              </p>

              {evalData.red_flags && evalData.red_flags.length > 0 && (
                <div className="rounded-2xl bg-red-950/90 border border-red-400 p-4 text-xs text-red-100 space-y-1">
                  {evalData.red_flags.map((rf, i) => (
                    <p key={i} className="font-semibold">⚠️ {rf}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Right: Doctor's Custom Note Editor for the Patient */}
          <form
            onSubmit={handleSaveDoctorNoteSubmit}
            className="lg:col-span-6 rounded-[2rem] border-2 border-terracotta-500/40 bg-white p-8 shadow-lg space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-terracotta-600">
                <MessageSquareQuote className="h-5 w-5" />
                <span className="font-mono text-xs font-semibold uppercase tracking-widest">
                  Personal Doctor’s Note (Visible to Patient)
                </span>
              </div>
              <button
                type="button"
                onClick={handleAutoDraftPatientFriendlyNote}
                className="rounded-full border border-ivory-300 bg-ivory-50 px-3.5 py-1 text-[11px] font-semibold text-espresso-800 hover:bg-ivory-200"
              >
                ✨ Auto-Draft Patient-Friendly Note
              </button>
            </div>

            <p className="text-xs text-espresso-600">
              Write clear, reassuring clinical guidance for <strong>{selectedPatientFile.patient.full_name}</strong>. When you click save, this note is stored in PostgreSQL and displayed at the top of their Patient Companion Portal.
            </p>

            <textarea
              rows={5}
              required
              placeholder="Write your personalized clinical note and next steps for the patient..."
              value={doctorNoteDraft}
              onChange={(e) => setDoctorNoteDraft(e.target.value)}
              className="w-full rounded-2xl border border-ivory-300 bg-ivory-50 p-4 text-sm leading-relaxed text-espresso-900 focus:border-botanical-800 focus:outline-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <span className="font-mono text-[11px] text-espresso-400">
                {selectedPatientFile.doctor_note_updated_at
                  ? `Last saved: ${selectedPatientFile.doctor_note_updated_at}`
                  : "Not yet published"}
              </span>
              <button
                type="submit"
                disabled={savingNote}
                className="inline-flex items-center gap-2 rounded-full bg-terracotta-600 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition hover:bg-espresso-900"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{savingNote ? "Publishing..." : "Save & Send Note to Patient Portal"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* GRAPHS: PATIENT VS UNIVERSAL WHO NORMS */}
        {evalData && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-3xl border border-ivory-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <span className="font-mono text-xs uppercase tracking-widest text-botanical-800">
                  Universal Benchmark Graph 01
                </span>
                <h3 className="mt-1 font-serif text-2xl font-medium text-espresso-900">
                  Patient Biomarkers vs. WHO Universal Norm (100% Baseline)
                </h3>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={normChartData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D3" />
                    <XAxis dataKey="metric" tick={{ fill: "#2C2825", fontSize: 12 }} />
                    <YAxis unit="%" domain={[0, 160]} tick={{ fill: "#5C554E", fontSize: 12 }} />
                    <Tooltip
                      formatter={(val, name) => [`${val}% of Universal Norm`, name]}
                      contentStyle={{ borderRadius: "16px", border: "1px solid #EAE2D3", backgroundColor: "#FAF7F2" }}
                    />
                    <Legend />
                    <ReferenceLine
                      y={100}
                      stroke="#C86D51"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      label={{ value: "WHO Universal Norm (100%)", fill: "#C86D51", fontSize: 11, position: "top" }}
                    />
                    <Bar dataKey="patient_normalized_pct" name="Patient Score (% of WHO Norm)" fill="#1E3A2F" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-3xl border border-ivory-200 bg-white p-8 shadow-sm">
              <div className="mb-6">
                <span className="font-mono text-xs uppercase tracking-widest text-terracotta-600">
                  Multi-Axis Fingerprint
                </span>
                <h3 className="mt-1 font-serif text-2xl font-medium text-espresso-900">
                  Reproductive Polygon Overlay
                </h3>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={normChartData}>
                    <PolarGrid stroke="#DCD0BC" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "#2C2825", fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fontSize: 10 }} />
                    <Radar
                      name="Universal WHO Norm (100%)"
                      dataKey="universal_norm_pct"
                      stroke="#C86D51"
                      fill="#C86D51"
                      fillOpacity={0.2}
                    />
                    <Radar
                      name="Patient Profile"
                      dataKey="patient_normalized_pct"
                      stroke="#1E3A2F"
                      fill="#1E3A2F"
                      fillOpacity={0.5}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* UPDATE LABS FORM & BREAKDOWN CARDS */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {clinicalForm && (
            <form
              onSubmit={handleRunDoctorEvaluation}
              className="lg:col-span-5 rounded-3xl border border-ivory-200 bg-white p-8 shadow-sm space-y-5"
            >
              <h3 className="font-serif text-2xl font-medium text-espresso-900 border-b border-ivory-100 pb-3">
                Update Patient Lab Parameters
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: "volume_ml", label: "Volume (mL) [Norm ≥1.4]" },
                  { key: "concentration_m_ml", label: "Count (M/mL) [Norm ≥16]" },
                  { key: "motility_pct", label: "Motility (%) [Norm ≥42]" },
                  { key: "morphology_pct", label: "Morphology (%) [Norm ≥4]" },
                  { key: "viability_pct", label: "Viability (%) [Norm ≥54]" },
                  { key: "ph", label: "Semen pH [Norm ≥7.2]" },
                  { key: "fsh_miu_ml", label: "FSH (mIU/mL)" },
                  { key: "lh_miu_ml", label: "LH (mIU/mL)" },
                  { key: "testosterone_ng_dl", label: "Testosterone (ng/dL)" },
                  { key: "prolactin_ng_ml", label: "Prolactin (ng/mL)" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-[11px] font-semibold text-espresso-600">{f.label}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={clinicalForm[f.key]}
                      onChange={(e) =>
                        setClinicalForm({ ...clinicalForm, [f.key]: parseFloat(e.target.value) || 0 })
                      }
                      className="mt-1 w-full rounded-xl border border-ivory-300 bg-ivory-50 px-3 py-2 font-mono text-xs font-semibold"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2">
                {[
                  { key: "palpable_varicocele", label: "Clinically Palpable Varicocele" },
                  { key: "vas_deferens_present", label: "Bilateral Vas Deferens Present" },
                  { key: "testicular_atrophy", label: "Testicular Atrophy Present" },
                  { key: "taking_exogenous_testosterone", label: "Taking Exogenous Testosterone / Steroids" },
                  { key: "recurrent_pregnancy_loss", label: "Recurrent Pregnancy Loss History" },
                  { key: "upcoming_gonadotoxic_therapy", label: "Upcoming Chemo / Radiotherapy (Oncofertility)" },
                ].map((chk) => (
                  <label key={chk.key} className="flex items-center justify-between text-xs text-espresso-800">
                    <span>{chk.label}</span>
                    <input
                      type="checkbox"
                      checked={clinicalForm[chk.key]}
                      onChange={() => setClinicalForm({ ...clinicalForm, [chk.key]: !clinicalForm[chk.key] })}
                      className="h-4 w-4 accent-botanical-800"
                    />
                  </label>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-botanical-800 py-3.5 text-xs font-semibold uppercase tracking-wider text-ivory-50 hover:bg-espresso-900"
              >
                {loading ? "Saving..." : "Re-Run Universal Norm Comparison & Save"}
              </button>
            </form>
          )}

          <div className="lg:col-span-7 space-y-6">
            {evalData && (
              <div className="rounded-3xl border border-ivory-200 bg-white p-8 shadow-sm">
                <h3 className="font-serif text-2xl font-medium text-espresso-900">
                  Parameter-by-Parameter Universal Norm Breakdown
                </h3>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {normChartData.map((item, idx) => (
                    <div key={idx} className="rounded-2xl border border-ivory-200 bg-ivory-50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-espresso-900">{item.metric}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            item.patient_normalized_pct >= 100
                              ? "bg-botanical-100 text-botanical-800"
                              : "bg-terracotta-100 text-terracotta-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="font-serif text-2xl font-semibold">
                          {item.patient_value} {item.unit}
                        </span>
                        <span className="font-mono text-xs text-espresso-400">
                          Universal Norm: ≥ {item.universal_norm_target} {item.unit}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] text-espresso-600">{item.clinical_interpretation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // =========================================================================
  // VIEW 3C: PATIENT PORTAL (DOCTOR'S PERSONAL NOTE + 75-DAY JOURNAL)
  // =========================================================================
  const renderPatientPortal = () => {
    const trackData = patientDashboard?.track_record || [];
    const summary = patientDashboard?.latest_clinical_summary || {};

    return (
      <div className="w-full animate-editorial px-6 py-10 md:px-12 xl:px-20 space-y-12">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ivory-200 pb-6">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-botanical-800">
              75-Day Spermatogenesis Companion
            </span>
            <h2 className="mt-1 font-serif text-4xl font-normal text-espresso-900">
              Hello, {patientDashboard?.patient_name || currentUser?.full_name}
            </h2>
            <p className="mt-1 text-xs text-espresso-600">
              Assigned Reproductive Specialist:{" "}
              <strong className="text-botanical-800">{patientDashboard?.assigned_doctor}</strong>
            </p>
          </div>

          <div className="flex gap-4">
            <div className="rounded-2xl border border-ivory-200 bg-white px-5 py-3 text-center">
              <span className="block font-mono text-[10px] uppercase text-espresso-400">Days Logged</span>
              <span className="font-serif text-3xl font-semibold text-botanical-800">
                {patientDashboard?.days_completed || 0} / 75
              </span>
            </div>
            <div className="rounded-2xl border border-ivory-200 bg-white px-5 py-3 text-center">
              <span className="block font-mono text-[10px] uppercase text-espresso-400">Habit Consistency</span>
              <span className="font-serif text-3xl font-semibold text-espresso-900">
                {patientDashboard?.average_habit_score || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* ===============================================================
            HIGHLIGHTED DOCTOR'S CUSTOM NOTE FOR THE PATIENT
           =============================================================== */}
        <div className="rounded-[2rem] border-2 border-botanical-800/30 bg-botanical-900 p-8 text-ivory-50 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory-50/15 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta-600 text-white">
                <MessageSquareQuote className="h-5 w-5" />
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-ivory-200">
                  Personal Doctor’s Note From Your Specialist
                </span>
                <h3 className="font-serif text-2xl font-normal text-white">
                  {patientDashboard?.assigned_doctor}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {summary.vitality_score && (
                <span className="rounded-full bg-ivory-50/10 px-4 py-1.5 font-mono text-xs text-ivory-100">
                  Vitality Score: {summary.vitality_score}/100
                </span>
              )}
              <span className="font-mono text-xs text-ivory-200">
                {summary.doctor_note_updated_at}
              </span>
            </div>
          </div>

          <p className="mt-5 font-serif text-2xl italic leading-relaxed text-ivory-50">
            “{summary.doctor_custom_note}”
          </p>

          <div className="mt-6 rounded-2xl bg-ivory-50/10 p-4 text-xs text-ivory-200">
            <strong className="text-white">Clinical Classification:</strong> {summary.status_title}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* LEFT: SIMPLE DAILY JOURNAL FORM */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleSaveJournal}
              className="rounded-3xl border border-ivory-200 bg-white p-8 shadow-sm space-y-6"
            >
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-terracotta-600">
                  Daily Habit Check-In
                </span>
                <h3 className="mt-1 font-serif text-3xl font-normal text-espresso-900">
                  Log Cycle Day {journalForm.cycle_day}
                </h3>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-espresso-800">
                  <span>Select Cycle Day (1 – 75)</span>
                  <span className="font-mono text-botanical-800">Day {journalForm.cycle_day}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="75"
                  value={journalForm.cycle_day}
                  onChange={(e) => setJournalForm({ ...journalForm, cycle_day: Number(e.target.value) })}
                  className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-ivory-200"
                />
              </div>

              <div className="space-y-3">
                {[
                  {
                    key: "avoided_tobacco_alcohol",
                    title: "Tobacco & Alcohol Free Today",
                    desc: "Protects sperm DNA integrity from oxidative stress",
                  },
                  {
                    key: "heat_and_toxin_protection",
                    title: "Scrotal Cooling & Toxin Protection",
                    desc: "Avoided excess heat, tight wear, and pesticide/chemical exposure",
                  },
                  {
                    key: "balanced_nutrition_exercise",
                    title: "Whole Nutrition & Physical Activity",
                    desc: "Supports healthy testosterone-to-estradiol balance",
                  },
                  {
                    key: "zero_exogenous_steroids",
                    title: "Zero Exogenous Testosterone / Steroids",
                    desc: "Keeps natural pituitary LH & FSH signaling active",
                  },
                ].map((habit) => (
                  <label
                    key={habit.key}
                    className={`flex cursor-pointer items-start justify-between rounded-2xl border p-4 transition ${
                      journalForm[habit.key]
                        ? "border-botanical-800 bg-botanical-100/40"
                        : "border-ivory-200 bg-ivory-50"
                    }`}
                  >
                    <div className="pr-3">
                      <p className="text-xs font-semibold text-espresso-900">{habit.title}</p>
                      <p className="mt-0.5 text-[11px] text-espresso-600">{habit.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={journalForm[habit.key]}
                      onChange={() =>
                        setJournalForm({ ...journalForm, [habit.key]: !journalForm[habit.key] })
                      }
                      className="mt-1 h-4 w-4 accent-botanical-800"
                    />
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-espresso-800">
                    Sleep Hours ({journalForm.sleep_hours}h)
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="12"
                    step="0.5"
                    value={journalForm.sleep_hours}
                    onChange={(e) =>
                      setJournalForm({ ...journalForm, sleep_hours: parseFloat(e.target.value) })
                    }
                    className="mt-2 w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-espresso-800">
                    Mood & Wellbeing ({journalForm.mood_score}/10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={journalForm.mood_score}
                    onChange={(e) =>
                      setJournalForm({ ...journalForm, mood_score: Number(e.target.value) })
                    }
                    className="mt-2 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-espresso-800">
                  Daily Reflection Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Completed morning run, feeling optimistic..."
                  value={journalForm.personal_reflection}
                  onChange={(e) =>
                    setJournalForm({ ...journalForm, personal_reflection: e.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-ivory-300 bg-ivory-50 px-3.5 py-2.5 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-botanical-800 py-4 text-xs font-semibold uppercase tracking-wider text-ivory-50 transition hover:bg-espresso-900"
              >
                {loading ? "Saving Entry..." : "Save Today's Journal to Database"}
              </button>
            </form>
          </div>

          {/* RIGHT: PATIENT TRACK RECORD GRAPH */}
          <div className="lg:col-span-7 space-y-8">
            <div className="rounded-3xl border border-ivory-200 bg-white p-8 shadow-sm">
              <span className="font-mono text-xs uppercase tracking-widest text-botanical-800">
                Longitudinal Database Record
              </span>
              <h3 className="mt-1 font-serif text-2xl font-medium text-espresso-900">
                Your 75-Day Vitality & Mood Track Record
              </h3>

              <div className="mt-6 h-72 w-full">
                {trackData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trackData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EAE2D3" />
                      <XAxis dataKey="cycle_day" tickFormatter={(d) => `Day ${d}`} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="daily_vitality_score"
                        name="Daily Habit Vitality (%)"
                        stroke="#1E3A2F"
                        strokeWidth={2.5}
                        fill="#E3ECE8"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl bg-ivory-50 text-xs text-espresso-400">
                    Log your first day on the left to start your track record graph!
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-ivory-200 bg-white p-8 shadow-sm">
              <h4 className="font-serif text-xl font-medium text-espresso-900">
                Recent Journal Entries
              </h4>
              <div className="mt-4 space-y-3">
                {trackData.slice().reverse().map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-2xl border border-ivory-200 bg-ivory-50 px-5 py-3.5 text-xs"
                  >
                    <div>
                      <span className="font-mono font-semibold text-botanical-800">
                        Cycle Day {entry.cycle_day}
                      </span>
                      <span className="ml-3 text-espresso-600">
                        Sleep: {entry.sleep_hours}h · Mood: {entry.mood_score}/10
                      </span>
                      {entry.personal_reflection && (
                        <p className="mt-1 italic text-espresso-600">“{entry.personal_reflection}”</p>
                      )}
                    </div>
                    <span className="rounded-full bg-botanical-800 px-3 py-1 font-mono text-[11px] font-semibold text-ivory-50">
                      {entry.daily_vitality_score}% Score
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const activePortalRole = currentUser?.role === "ADMIN" ? adminViewMode : currentUser?.role;

  return (
    <div className="min-h-screen w-full bg-ivory-50 text-espresso-900 font-sans overflow-x-hidden">
      {statusMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-2xl px-6 py-4 text-xs font-semibold shadow-xl transition ${
            statusMessage.type === "error"
              ? "bg-red-900 text-white"
              : "bg-botanical-900 text-ivory-50"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Full-Width Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-ivory-200 bg-ivory-50/95 px-6 py-4 backdrop-blur-md md:px-12 xl:px-20">
        <div className="flex w-full flex-wrap items-center justify-between gap-4">
          <div
            onClick={() => setView(currentUser ? "portal" : "landing")}
            className="flex cursor-pointer items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-botanical-800 text-ivory-50">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="font-serif text-2xl font-semibold tracking-tight text-espresso-900">
                Tri-Vance <span className="italic font-normal text-botanical-800">AndroCare</span>
              </span>
              <p className="text-[10px] uppercase tracking-widest text-espresso-400">
                Male Fertility Clinical & Patient Platform
              </p>
            </div>
          </div>

          {currentUser?.role === "ADMIN" && view === "portal" && (
            <div className="flex items-center gap-1 rounded-full border border-ivory-300 bg-ivory-100 p-1">
              {[
                { id: "ADMIN", label: "Admin Control" },
                { id: "DOCTOR", label: "Inspect Doctor Portal" },
                { id: "PATIENT", label: "Inspect Patient Portal" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setAdminViewMode(tab.id)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    adminViewMode === tab.id
                      ? "bg-terracotta-600 text-white"
                      : "text-espresso-600 hover:text-espresso-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <button
                  onClick={() => setView(view === "landing" ? "portal" : "landing")}
                  className="rounded-full border border-ivory-300 bg-white px-4 py-2 text-xs font-semibold text-espresso-800 hover:bg-ivory-100"
                >
                  {view === "landing" ? "Back to Portal" : "View Research Landing Page"}
                </button>
                <span className="hidden rounded-full bg-ivory-200 px-3.5 py-1.5 font-mono text-xs font-medium text-espresso-800 sm:inline-block">
                  {currentUser.full_name} ({currentUser.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-full border border-ivory-300 bg-white px-4 py-2 text-xs font-semibold text-espresso-900 hover:bg-ivory-100"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => setView(view === "auth" ? "landing" : "auth")}
                className="inline-flex items-center gap-2 rounded-full bg-espresso-900 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-ivory-50 hover:bg-botanical-800"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>{view === "auth" ? "Back to Home" : "Sign In / Register"}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="w-full">
        {view === "landing" && renderLanding()}
        {view === "auth" && renderAuthPage()}
        {view === "portal" && activePortalRole === "ADMIN" && renderAdminPortal()}
        {view === "portal" && activePortalRole === "DOCTOR" && renderDoctorPortal()}
        {view === "portal" && activePortalRole === "PATIENT" && renderPatientPortal()}
      </main>

      <footer className="mt-20 w-full border-t border-ivory-200 bg-ivory-100 px-6 py-10 text-xs text-espresso-600 md:px-12 xl:px-20">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="font-serif text-lg font-semibold text-espresso-900">
              Tri-Vance AndroCare · Male Reproductive Intelligence
            </p>
            <p>Team Tri-Vance: Kaswii Ruth, Chepkemoi Abigail, Wandimi Anthony</p>
          </div>
          <p className="font-mono text-[11px] text-espresso-400">
            AUA/ASRM Guideline (2020; Amended 2024) · WHO 6th Ed. Laboratory Manual
          </p>
        </div>
      </footer>
    </div>
  );
}
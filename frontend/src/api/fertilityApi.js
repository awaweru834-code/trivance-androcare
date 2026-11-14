const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "https://trivance-androcare.onrender.com/api/v1";
const CLEAN_BASE = RAW_BASE.replace(/\/+$/, "");
const API_BASE = CLEAN_BASE.endsWith("/api/v1") ? CLEAN_BASE : `${CLEAN_BASE}/api/v1`;

function getAuthHeaders() {
  const token = localStorage.getItem("trivance_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// --- 1. AUTHENTICATION & RBAC ---
export async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid login credentials");
  }
  return res.json();
}

export async function apiRegisterPatient(payload) {
  const res = await fetch(`${API_BASE}/auth/register-patient`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Could not register patient account");
  }
  return res.json();
}

// --- 2. SYSTEM ADMIN ENDPOINTS ---
export async function apiGetAdminOverview() {
  const res = await fetch(`${API_BASE}/admin/overview`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load admin overview");
  return res.json();
}

export async function apiCreateDoctorByAdmin(payload) {
  const res = await fetch(`${API_BASE}/admin/create-doctor`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create doctor account");
  }
  return res.json();
}

export async function apiAssignPatientToDoctor(doctor_id, patient_id) {
  const res = await fetch(`${API_BASE}/admin/assign-patient`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ doctor_id: Number(doctor_id), patient_id: Number(patient_id) }),
  });
  if (!res.ok) throw new Error("Failed to assign patient");
  return res.json();
}

// --- 3. DOCTOR PORTAL ENDPOINTS ---
export async function apiGetDoctorPatients() {
  const res = await fetch(`${API_BASE}/doctor/my-patients`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch assigned patients");
  return res.json();
}

export async function apiGetPatientFile(patientId) {
  const res = await fetch(`${API_BASE}/doctor/patients/${patientId}/file`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to open patient clinical file");
  }
  return res.json();
}

export async function apiEvaluateAndSavePatient(patientId, clinicalPayload) {
  const res = await fetch(`${API_BASE}/doctor/patients/${patientId}/evaluate`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(clinicalPayload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Evaluation failed");
  }
  return res.json();
}

export async function apiSaveDoctorNote(patientId, doctorCustomNote) {
  const res = await fetch(`${API_BASE}/doctor/patients/${patientId}/note`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ doctor_custom_note: doctorCustomNote }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to save Doctor's Note");
  }
  return res.json();
}

// --- 4. PATIENT PORTAL ENDPOINTS ---
export async function apiGetPatientDashboard() {
  const res = await fetch(`${API_BASE}/patient/dashboard`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load patient dashboard");
  return res.json();
}

export async function apiLogPatientJournal(journalPayload) {
  const res = await fetch(`${API_BASE}/patient/journal`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(journalPayload),
  });
  if (!res.ok) throw new Error("Failed to save journal entry");
  return res.json();
}
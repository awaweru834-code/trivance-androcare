Tri-Vance AndroCare 

Male Reproductive Intelligence: Clinical Decision-Support & 75-Day Patient Companion Platform

Built for the Future Health Digital Innovation Challenge

 Live Deployment URLs

Live Frontend Web App (Vercel): https://frontend-psi-steel-61.vercel.app

Live Backend API & Swagger Docs (Render): https://trivance-androcare.onrender.com/docs

Project Overview

Infertility affects 1 in 6 couples globally, with a male factor contributing to 50% of cases. Despite this, reproductive healthcare overwhelmingly focuses on female evaluation.

Tri-Vance AndroCare bridges this gap by translating the 2020/2024 AUA/ASRM Male Infertility Guidelines and WHO 6th Edition Laboratory Manual into an automated, interactive web platform. It operates on a decoupled architecture enforcing strict Role-Based Access Control (RBAC), ensuring privacy and clinical safety via a "Human-in-the-Loop" workflow.

 Key Features

Interactive Research Landing Page: Features a live WHO Semen Nomenclature Sandbox, an Interactive HPG-Axis Endocrine Simulator, and a searchable Clinical Research Compendium.

Clinician CDSS Portal: Automatically classifies raw semen and HPG endocrine parameters, visualizes patient data against WHO Universal Norms using Recharts (Radar/Bar graphs), and flags AUA/ASRM triggers for genetic testing and imaging.

"Human-in-the-Loop" Doctor's Note Studio: AI does not prescribe directly to patients. Doctors review the automated CDSS summary and draft personalized, timestamped guidance sent directly to the patient's dashboard.

75-Day Patient Companion: Since spermatogenesis takes ~75 days, the patient portal includes a daily lifestyle journal (scrotal heat protection, tobacco cessation, etc.) and a visual vitality trendline to keep men engaged between clinic visits.

Hospital System Admin Governance: Strict RBAC matrix to provision verified doctors and securely map patient assignments.

 1-Click Demo Judge Credentials

You can use the 1-click login buttons on the platform, or enter these manually:

System Admin: admin@trivance.med / admin123

Clinician (Dr. Kaswii): kaswii@trivance.med / doctor123

Clinician (Dr. Abigail): abigail@trivance.med / doctor123

Patient (Michael Ochieng): michael@patient.med / patient123

 Tech Stack

Frontend: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons. (Deployed on Vercel)

Backend: Python 3.12, FastAPI, SQLAlchemy, Pydantic, PyJWT. (Deployed on Render)

Database: PostgreSQL (Hosted on Neon)

 VS Code Local Setup & Sync Commands

If you make changes to this README directly on GitHub, you need to pull those updates down to your local VS Code environment before making new commits.

Open your VS Code PowerShell terminal in the main project folder (trivance-androcare) and run:

# 1. Pull the latest changes from GitHub to VS Code
git pull origin main


To run the project locally:

Terminal 1 (Backend):

cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000


Terminal 2 (Frontend):

cd frontend
npm install
npm run dev

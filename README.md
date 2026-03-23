# DataPulse – AI Powered Booth Intelligence System

Convert voter list data into intelligent analytics to help booth officers understand voter demographics and send targeted government scheme recommendations.

## Project Structure

```
datapulse-ai-democracy/
├── frontend/       # React + Vite + TailwindCSS + Chart.js
├── backend/        # Node.js + Express
├── ai-service/     # Python FastAPI + Scikit-learn
├── data/           # Sample datasets
│   └── sample_voters.csv
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TailwindCSS, Chart.js |
| Backend | Node.js, Express |
| AI Service | Python FastAPI, Scikit-learn |
| Data | JSON (prototype) / MongoDB |

## Features

- **Landing Page** – AI Booth Management overview
- **Login** – Role-based (Admin / Booth Officer), OTP flow
- **Admin Dashboard** – KPIs, Booth performance, Age distribution, Notifications, Map placeholder
- **Booth Intelligence** – Voter clusters, Engagement heatmap, AI insights
- **Knowledge Graph** – Interactive graph (Voters, Booths, Schemes)
- **Voter Segmentation** – Filters, cluster cards, export
- **Governance Updates** – Campaign compose, WhatsApp/SMS, performance
- **Citizen Engagement** – Open rates, feedback, issue tags
- **Analytics & Insights** – Trends, AI predictions
- **Citizen Mobile** – Personalized updates, eligibility alerts, feedback
- **Data Upload & Analytics** – CSV upload, AI clustering, scheme recommendations
- **Dark mode**, **Smart search**

## Quick Start

### 1. Backend

```bash
cd backend
npm install
node server.js
```

Backend runs at **http://localhost:5001**

### 2. AI Service

```bash
cd ai-service
pip install -r requirements.txt
uvicorn api:app --reload
```

AI service runs at **http://127.0.0.1:8000**

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

## CSV Format

Upload a CSV with columns:

| Column | Description |
|--------|-------------|
| Name | Voter name |
| Age | Age in years |
| Gender | Male/Female |
| BoothID | Booth identifier |
| Area | Rural/Urban |
| Occupation | Farmer, Student, Retired, etc. |

Sample data: `data/sample_voters.csv`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/upload | Upload CSV file |
| GET | /api/analytics | Get analytics (charts data) |
| GET | /api/voters | Get raw voter list |

## AI Clusters & Schemes

| Cluster | Example Schemes |
|---------|-----------------|
| Youth Voters | Skill India, Startup India |
| Farmers | Crop Insurance, PM-KISAN |
| Senior Citizens | Ayushman Bharat, Pension |
| Women Voters | Beti Bachao Beti Padhao, Ujjwala |

## Run Order

1. Start **Backend** first
2. Start **AI Service** (optional; analytics still work with fallback clustering)
3. Start **Frontend**

Open **http://localhost:5173** and click **Load Sample Data** on the Admin Dashboard, or upload `data/sample_voters.csv`.

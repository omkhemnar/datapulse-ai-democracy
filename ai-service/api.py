from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import LabelEncoder

app = FastAPI(title="DataPulse AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ClusterRequest(BaseModel):
    voters: List[dict]


# Scheme definitions with eligibility rules
SCHEMES = {
    "Ladli Behna Yojana": {
        "eligibility": "Women, Age 21-60",
        "description": "Monthly financial assistance for women",
    },
    "Beti Bachao Beti Padhao": {
        "eligibility": "Women & Girls",
        "description": "Girl child welfare and education",
    },
    "Ujjwala Yojana": {
        "eligibility": "Women (BPL)",
        "description": "Free LPG connection",
    },
    "Skill India (18+)": {
        "eligibility": "Age 18-35",
        "description": "Free skill development courses",
    },
    "Startup India": {
        "eligibility": "Age 18-40",
        "description": "Entrepreneurship support",
    },
    "Youth Education Scholarship": {
        "eligibility": "Age 18-25",
        "description": "Higher education scholarships",
    },
    "Child Welfare Schemes": {
        "eligibility": "Under 18",
        "description": "Education and child development",
    },
    "PM-KISAN": {
        "eligibility": "Farmers",
        "description": "Direct income support for farmers",
    },
    "Crop Insurance (Fasal Bima)": {
        "eligibility": "Farmers",
        "description": "Pradhan Mantri Fasal Bima Yojana",
    },
    "Ayushman Bharat": {
        "eligibility": "Age 60+ / Senior Citizens",
        "description": "Health insurance scheme",
    },
    "Senior Citizen Pension": {
        "eligibility": "Age 60+",
        "description": "National Pension Scheme",
    },
}


def classify_voter(voter: dict) -> dict:
    """Classify a voter into scheme-eligible groups based on age, gender, occupation."""
    age = int(voter.get("Age") or 0)
    gender = (voter.get("Gender") or "").strip().lower()
    occupation = (voter.get("Occupation") or "").lower()

    is_female = gender in ("female", "f")
    is_farmer = "farmer" in occupation or "agricultur" in occupation

    groups = []
    eligible_schemes = []

    # Age-based groups
    if age < 18:
        groups.append("Youth (Under 18)")
        eligible_schemes.append("Child Welfare Schemes")
    elif 18 <= age <= 25:
        groups.append("Youth (18-25)")
        eligible_schemes.extend([
            "Skill India (18+)",
            "Youth Education Scholarship",
            "Startup India",
        ])
    elif 26 <= age <= 35:
        groups.append("Youth (26-35)")
        eligible_schemes.extend([
            "Skill India (18+)",
            "Startup India",
        ])
    elif 36 <= age <= 59:
        groups.append("Working Age (36-59)")
    else:
        groups.append("Senior Citizens (60+)")
        eligible_schemes.extend([
            "Ayushman Bharat",
            "Senior Citizen Pension",
        ])

    # Gender-based
    if is_female:
        groups.append("Women")
        eligible_schemes.extend(["Beti Bachao Beti Padhao", "Ujjwala Yojana"])
        if 21 <= age <= 60:
            eligible_schemes.append("Ladli Behna Yojana")

    # Occupation-based
    if is_farmer:
        groups.append("Farmers")
        eligible_schemes.extend(["PM-KISAN", "Crop Insurance (Fasal Bima)"])

    # Deduplicate schemes
    eligible_schemes = list(dict.fromkeys(eligible_schemes))

    return {
        "groups": groups,
        "eligible_schemes": eligible_schemes,
        "primary_group": groups[0] if groups else "General",
    }


@app.post("/api/cluster")
def cluster_voters(req: ClusterRequest):
    voters = req.voters
    if not voters:
        return {
            "clusters": [],
            "recommendations": [],
            "voter_groups": [],
            "scheme_groups": [],
        }

    # Classify each voter
    voter_groups = []
    group_counts = {}
    scheme_to_voters = {}

    for v in voters:
        classification = classify_voter(v)
        voter_groups.append({
            "id": v.get("id"),
            "Name": v.get("Name"),
            "Age": v.get("Age"),
            "Gender": v.get("Gender"),
            "Occupation": v.get("Occupation"),
            "BoothID": v.get("BoothID"),
            "groups": classification["groups"],
            "primary_group": classification["primary_group"],
            "eligible_schemes": classification["eligible_schemes"],
        })

        for g in classification["groups"]:
            group_counts[g] = group_counts.get(g, 0) + 1
        for s in classification["eligible_schemes"]:
            if s not in scheme_to_voters:
                scheme_to_voters[s] = []
            scheme_to_voters[s].append(v.get("Name"))

    # Build scheme groups for display
    scheme_groups = []
    for scheme_name, count in sorted(
        ((s, len(names)) for s, names in scheme_to_voters.items()),
        key=lambda x: -x[1],
    ):
        info = SCHEMES.get(scheme_name, {})
        scheme_groups.append({
            "scheme": scheme_name,
            "count": count,
            "eligibility": info.get("eligibility", ""),
            "description": info.get("description", ""),
        })

    # Cluster distribution (primary groups)
    clusters = [{"cluster_name": k, "count": v} for k, v in group_counts.items()]

    # Legacy recommendations format
    recommendations = []
    for sg in scheme_groups:
        recommendations.append({
            "cluster": sg["eligibility"],
            "scheme": f"{sg['scheme']} - {sg['description']}",
        })

    return {
        "clusters": clusters,
        "recommendations": recommendations,
        "voter_groups": voter_groups,
        "scheme_groups": scheme_groups,
        "group_summary": [{"name": k, "count": v} for k, v in group_counts.items()],
    }


@app.get("/health")
def health():
    return {"status": "ok"}

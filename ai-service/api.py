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

def build_cluster_profiles(df, n_clusters):
    cluster_profiles = {}
    for i in range(n_clusters):
        c_df = df[df['Cluster_ID'] == i]
        if c_df.empty:
            cluster_profiles[i] = "General Citizens"
            continue
            
        avg_age = c_df['Age'].mean()
        
        mode_occ = c_df['Occupation'].mode()
        top_occ = mode_occ[0] if not mode_occ.empty and str(mode_occ[0]).strip() else "workers"
        top_occ_lower = str(top_occ).lower()
        
        mode_gen = c_df['Gender'].mode()
        top_gen = mode_gen[0] if not mode_gen.empty and str(mode_gen[0]).strip() else "citizens"
        top_gen_lower = str(top_gen).lower()

        age_tag = "young" if avg_age < 30 else "senior" if avg_age > 55 else "working-age"
        gen_tag = "women" if top_gen_lower in ["female", "f"] else "citizens" if top_gen_lower in ["male", "m"] else "people"
        
        if "farm" in top_occ_lower or "agri" in top_occ_lower:
            occ_tag = "farmers"
        elif "student" in top_occ_lower or "study" in top_occ_lower:
            occ_tag = "students"
        else:
            occ_tag = top_occ_lower.split()[0] if top_occ_lower else "workers"

        cluster_name = f"Cluster {i+1} - {age_tag.capitalize()} {gen_tag.capitalize()} {occ_tag.capitalize()}"
        cluster_profiles[i] = cluster_name
        
    return cluster_profiles


@app.post("/api/cluster")
def cluster_voters(req: ClusterRequest):
    voters = req.voters
    if not voters:
        return {
            "clusters": [],
            "recommendations": [],
            "voter_groups": [],
            "scheme_groups": [],
            "group_summary": []
        }

    df = pd.DataFrame(voters)
    df['Age'] = pd.to_numeric(df['Age'], errors='coerce').fillna(35)
    
    df['Gender_Code'] = df['Gender'].str.lower().map({'male': 0, 'female': 1, 'm': 0, 'f': 1}).fillna(0)
    
    le = LabelEncoder()
    df['Occ_Code'] = le.fit_transform(df['Occupation'].astype(str).str.lower().fillna('general'))

    X = df[['Age', 'Gender_Code', 'Occ_Code']].values
    n_clusters = min(4, len(df))
    
    if n_clusters > 0:
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        df['Cluster_ID'] = kmeans.fit_predict(X)
    else:
        df['Cluster_ID'] = 0

    cluster_profiles = build_cluster_profiles(df, n_clusters)
        
    voter_groups = []
    group_counts = {}
    
    for idx, row in df.iterrows():
        c_id = row['Cluster_ID']
        c_name = cluster_profiles.get(c_id, "General Cluster")
        
        group_counts[c_name] = group_counts.get(c_name, 0) + 1
        
        voter_groups.append({
            "id": row.get("id"),
            "Name": row.get("Name"),
            "Age": row.get("Age"),
            "Gender": row.get("Gender"),
            "Occupation": row.get("Occupation"),
            "BoothID": row.get("BoothID"),
            "Email": row.get("Email", f"voter_{idx}@example.com"),
            "VoterID": row.get("VoterID", ""),
            "groups": [c_name],
            "primary_group": c_name,
            "eligible_schemes": []  # Assigned dynamically by NLP algorithm in Node.js
        })

    clusters = [{"cluster_name": k, "count": v} for k, v in group_counts.items()]

    return {
        "clusters": clusters,
        "recommendations": [], 
        "voter_groups": voter_groups,
        "scheme_groups": [], 
        "group_summary": [{"name": k, "count": v} for k, v in group_counts.items()],
    }

@app.get("/health")
def health():
    return {"status": "ok"}

import json
import pickle
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, calinski_harabasz_score, davies_bouldin_score

# 40 Non-Redundant Training Features Including Time-Series Aggregations
CLUSTER_COLUMNS = [
    "current_age", "gender_numeric", "customer_since_years", "yearly_income",
    "per_capita_income", "total_debt", "debt_to_income_ratio", "credit_score",
    "total_transaction_count", "total_historical_spend", "avg_transaction_amount",
    "max_transaction_amount", "spend_volatility_std",
    "total_products", "product_penetration", "has_credit_card", "has_home_loan",
    "has_personal_loan", "has_mutual_funds", "has_insurance", "savings_balance",
    "current_balance", "investment_balance", "loan_outstanding", "net_worth_estimate",
    "average_monthly_spend", "shopping_ratio", "travel_ratio", "food_ratio",
    "healthcare_ratio", "cash_dependency", "mobile_login_count", "internet_banking_login",
    "upi_transactions", "atm_transactions", "branch_visits", "digital_physical_ratio",
    "salary_credit_frequency", "last_login_days", "financial_health",
    "investment_readiness", "premium_potential", "dormancy_score"
]

def find_optimal_k(scaled_data, candidate_ks=[3, 4, 5, 6, 7], default_k=4):
    """
    Evaluates candidate K values using Silhouette Score and returns the optimal K.
    """
    scores = {}
    for k in candidate_ks:
        km = KMeans(n_clusters=k, random_state=42, n_init=15)
        labels = km.fit_predict(scaled_data)
        sil = silhouette_score(scaled_data, labels)
        scores[k] = round(float(sil), 4)
    
    best_k = max(scores, key=scores.get)
    return best_k, scores

def compute_cluster_explainability(features_df, labels, selected_cols):
    """
    Generates rich feature-driver Z-scores and explainability narratives per cluster.
    """
    df_with_cluster = features_df.assign(cluster=labels)
    pop_mean = features_df[selected_cols].mean()
    pop_std = features_df[selected_cols].std().replace(0, 1)
    
    cluster_means = df_with_cluster.groupby("cluster")[selected_cols].mean()
    
    explainability = {}
    for cluster_id in cluster_means.index:
        c_mean = cluster_means.loc[cluster_id]
        z_scores = ((c_mean - pop_mean) / pop_std).sort_values(ascending=False)
        
        top_positive = z_scores.head(3).to_dict()
        top_negative = z_scores.tail(2).to_dict()
        
        # Build human-readable narrative
        pos_drivers = ", ".join([f"{col.replace('_', ' ').title()} (+{val:.2f} std)" for col, val in top_positive.items()])
        neg_drivers = ", ".join([f"{col.replace('_', ' ').title()} ({val:.2f} std)" for col, val in top_negative.items()])
        
        narrative = (
            f"Cluster {cluster_id} is primarily defined by high {pos_drivers}. "
            f"Compared to the population average, it exhibits lower {neg_drivers}."
        )
        
        explainability[int(cluster_id)] = {
            "top_positive_drivers": {k: round(float(v), 2) for k, v in top_positive.items()},
            "top_negative_drivers": {k: round(float(v), 2) for k, v in top_negative.items()},
            "explanation_narrative": narrative
        }
        
    return explainability

def train_segments(features, model_path, scaler_path, personas_path, clusters=None):
    """
    Full Clustering Pipeline:
    1. Feature selection & StandardScaler normalization.
    2. Dynamic Optimal K auto-selection (evaluates candidate K values).
    3. Multi-metric evaluation (Silhouette, Calinski-Harabasz, Davies-Bouldin, Inertia).
    4. Rich persona generation & Z-score explainability.
    5. Artifact & metadata persistence.
    """
    # 1. Feature Selection
    selected_cols = [c for c in CLUSTER_COLUMNS if c in features.columns]
    x = features[selected_cols].fillna(0)
    
    # 2. Scaling
    scaler = StandardScaler()
    scaled = scaler.fit_transform(x)
    
    # 3. Dynamic Optimal K Selection
    k_candidate_scores = {}
    if clusters is None or clusters == "auto":
        optimal_k, k_candidate_scores = find_optimal_k(scaled)
        k_fitted = optimal_k
    else:
        k_fitted = int(clusters)
        _, k_candidate_scores = find_optimal_k(scaled)
    
    # 4. Fit Model
    model = KMeans(n_clusters=k_fitted, random_state=42, n_init=20)
    labels = model.fit_predict(scaled)
    distances = model.transform(scaled).min(axis=1)
    confidence = (1 / (1 + distances)).round(4)
    
    # 5. Multi-Metric Evaluation & Explained Variance (R2 Equivalent for Clustering)
    sil_score = float(silhouette_score(scaled, labels))
    ch_score = float(calinski_harabasz_score(scaled, labels))
    db_score = float(davies_bouldin_score(scaled, labels))
    inertia = float(model.inertia_)
    total_variance = float(np.sum((scaled - scaled.mean(axis=0)) ** 2))
    r2_clustering = float((1 - (inertia / total_variance)) * 100) if total_variance > 0 else 0.0
    
    # 6. Save Model & Scaler Artifacts
    with model_path.open("wb") as handle:
        pickle.dump(model, handle)
    with scaler_path.open("wb") as handle:
        pickle.dump(scaler, handle)
        
    segments = features[["customer_id"]].copy()
    segments["cluster"] = labels
    segments["distance"] = distances.round(4)
    segments["confidence"] = confidence
    
    # 7. Rich Persona Generation & Naming
    cluster_means = features.assign(cluster=labels).groupby("cluster")[selected_cols].mean()
    
    prem_pot = cluster_means["premium_potential"] if "premium_potential" in cluster_means else cluster_means["yearly_income"]
    dormancy = cluster_means["dormancy_score"] if "dormancy_score" in cluster_means else cluster_means["last_login_days"]
    income = cluster_means["yearly_income"]
    credit = cluster_means["credit_score"]
    
    prem_rank = prem_pot.rank(method="dense", ascending=False).astype(int)
    
    names = {}
    strategies = {}
    for cid in cluster_means.index:
        if prem_rank[cid] == 1:
            names[cid] = "Premium Investors"
            strategies[cid] = "Private Banking, Wealth Advisory & Exclusive Premium Cards"
        elif dormancy[cid] > 55:
            names[cid] = "Dormant Recovery"
            strategies[cid] = "Digital Re-activation Campaign & Retention Incentives"
        elif income[cid] >= income.median():
            names[cid] = "Emerging Affluent"
            strategies[cid] = "Investment Upsell & Pre-approved Credit Products"
        elif credit[cid] < credit.median():
            names[cid] = "Credit Borrowers"
            strategies[cid] = "Debt Consolidation, Refinancing & Credit Builder Offers"
        else:
            names[cid] = "Everyday Banking"
            strategies[cid] = "Mobile App Engagement & Low-Cost Savings Products"
            
    segments["segment_label"] = segments["cluster"].map(names)
    
    # 8. Rich Cluster Explainability & Z-Scores
    explainability = compute_cluster_explainability(features, labels, selected_cols)
    
    # 9. Construct Personas Dictionary
    personas = {}
    for cid in cluster_means.index:
        personas[str(cid)] = {
            "name": names[cid],
            "strategy": strategies[cid],
            "statistics": {
                "yearly_income": round(float(cluster_means.loc[cid, "yearly_income"]), 2),
                "net_worth_estimate": round(float(cluster_means.loc[cid, "net_worth_estimate"]), 2),
                "credit_score": round(float(cluster_means.loc[cid, "credit_score"]), 2),
                "premium_potential": round(float(cluster_means.loc[cid, "premium_potential"]), 2),
                "dormancy_score": round(float(cluster_means.loc[cid, "dormancy_score"]), 2),
                "investment_readiness": round(float(cluster_means.loc[cid, "investment_readiness"]), 2),
                "total_products": round(float(cluster_means.loc[cid, "total_products"]), 2)
            },
            "drivers": explainability[cid]
        }
        
    personas_path.write_text(json.dumps(personas, indent=2), encoding="utf-8")
    
    # 10. Save Detailed Model Metadata
    metadata_path = personas_path.parent / "metadata.json"
    metadata = {
        "training_summary": {
            "features_trained_count": len(selected_cols),
            "customer_sample_count": len(features),
            "selected_k": k_fitted,
            "auto_k_selected": (clusters is None or clusters == "auto")
        },
        "evaluation_metrics": {
            "silhouette_score": round(sil_score, 4),
            "calinski_harabasz_index": round(ch_score, 2),
            "davies_bouldin_index": round(db_score, 4),
            "wcss_inertia": round(inertia, 2),
            "r2_explained_variance_ratio_pct": round(r2_clustering, 2)
        },
        "candidate_k_silhouette_scores": k_candidate_scores,
        "selected_features": selected_cols
    }
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    
    # 11. Formatted Console Logging
    print("\n" + "=" * 65)
    print("BANK360 AI: OPTIMAL K-MEANS CLUSTERING & EVALUATION REPORT")
    print("=" * 65)
    print(f"Features Selected:           {len(selected_cols)} Non-Redundant Features")
    print(f"Total Customer Population:   {len(features):,} Records")
    print(f"Fitted Clusters (K):         {k_fitted} (Auto-selected best Silhouette K)")
    print(f"Inertia (Within-Cluster WCSS): {inertia:,.2f}")
    print(f"Explained Variance (R2 Eq):   {r2_clustering:.2f}% (Total variance explained by K centroids)")
    print(f"Silhouette Score (Cohesion):   {sil_score:.4f}  (Higher = better separation)")
    print(f"Calinski-Harabasz Index:      {ch_score:,.2f} (Higher = better variance ratio)")
    print(f"Davies-Bouldin Index:         {db_score:.4f}  (Lower = better cluster distinction)")
    print("-" * 65)
    print("CANDIDATE K SILHOUETTE SCORES EVALUATED:")
    for k, score in k_candidate_scores.items():
        star = " * [Selected]" if k == k_fitted else ""
        print(f"  K = {k}: Silhouette Score = {score:.4f}{star}")
    print("-" * 65)
    print("CLUSTER SEGMENT DISTRIBUTION & EXPLAINABILITY DRIVERS:")
    for cid, count in pd.Series(labels).value_counts().items():
        persona_name = names[cid]
        pct = (count / len(features)) * 100
        drivers = explainability[cid]["top_positive_drivers"]
        top_driver_str = ", ".join([f"{k} (+{v:.2f} std)" for k, v in drivers.items()])
        print(f"  Cluster {cid} [{persona_name}]: {count:,} customers ({pct:.1f}%)")
        print(f"    -> Strategy: {strategies[cid]}")
        print(f"    -> Top Drivers: {top_driver_str}")
    print("=" * 65 + "\n")
    
    return segments, personas

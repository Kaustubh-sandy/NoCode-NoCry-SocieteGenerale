import json
import pickle
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

CLUSTER_COLUMNS = ["yearly_income", "net_worth_estimate", "credit_score", "total_products", "activity_score", "investment_readiness", "premium_potential", "dormancy_score"]

def train_segments(features, model_path, scaler_path, personas_path, clusters=4):
    x = features[CLUSTER_COLUMNS].fillna(0)
    scaler = StandardScaler(); scaled = scaler.fit_transform(x)
    model = KMeans(n_clusters=clusters, random_state=42, n_init=20)
    labels = model.fit_predict(scaled)
    distances = model.transform(scaled).min(axis=1)
    confidence = (1 / (1 + distances)).round(4)
    with model_path.open("wb") as handle:
        pickle.dump(model, handle)
    with scaler_path.open("wb") as handle:
        pickle.dump(scaler, handle)
    segments = features[["customer_id"]].copy(); segments["cluster"] = labels; segments["distance"] = distances.round(4); segments["confidence"] = confidence
    stats = features.assign(cluster=labels).groupby("cluster")[CLUSTER_COLUMNS].mean().round(2)
    rank = stats["premium_potential"].rank(method="dense", ascending=False).astype(int)
    names = {int(k): ("Premium Investors" if rank[k] == 1 else "Dormant Recovery" if stats.loc[k, "dormancy_score"] > 55 else "Emerging Affluent" if stats.loc[k, "yearly_income"] >= stats["yearly_income"].median() else "Everyday Banking") for k in stats.index}
    segments["segment_label"] = segments["cluster"].map(names)
    personas = {str(k): {"name": names[int(k)], "statistics": stats.loc[k].to_dict(), "strategy": "Wealth advisory" if rank[k] == 1 else "Digital activation" if stats.loc[k, "dormancy_score"] > 55 else "Cross-sell relevant products"} for k in stats.index}
    personas_path.write_text(json.dumps(personas, indent=2), encoding="utf-8")
    return segments, personas

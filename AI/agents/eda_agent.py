def summarize(frame, column):
    if column not in frame: raise ValueError(f"Unknown column: {column}")
    return frame[column].describe().round(2).to_dict()

def compare(frame, metric, group="segment_label"):
    return frame.groupby(group)[metric].agg(["count", "mean", "median", "std"]).round(2).to_dict(orient="index")

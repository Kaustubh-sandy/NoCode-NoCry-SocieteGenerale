import json
from datetime import datetime, timezone
from pathlib import Path

def write_json_report(payload, output_path):
    """
    Production-grade JSON & HTML Report Writer.
    Appends ISO timestamps, creates parent directories, and persists structured reports.
    """
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    
    if isinstance(payload, dict):
        report_data = {
            "report_metadata": {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "status": "FINAL",
                "system": "Bank360 AI Engine"
            },
            "data": payload
        }
    else:
        report_data = payload

    path.write_text(json.dumps(report_data, indent=2, default=str), encoding="utf-8")
    return str(path)

def generate_html_summary(payload, output_path):
    """
    Generates an executive HTML summary report for manager presentation/download.
    """
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    
    intent = payload.get("plan", {}).get("intent", "Executive Overview")
    count = payload.get("count", 0)
    results = payload.get("results", [])
    
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>Bank360 AI - Executive Summary Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; background: #0b0f19; color: #f3f4f6; padding: 20px; }}
        h1 {{ color: #e11d48; border-bottom: 2px solid #334155; padding-bottom: 10px; }}
        .kpi {{ display: inline-block; background: #1e293b; padding: 15px; border-radius: 8px; margin-right: 15px; border: 1px solid #334155; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
        th, td {{ border: 1px solid #334155; padding: 10px; text-align: left; font-size: 13px; }}
        th {{ background: #1e293b; color: #f43f5e; }}
        tr:nth-child(even) {{ background: #0f172a; }}
    </style>
</head>
<body>
    <h1>BANK360 AI EXECUTIVE REPORT</h1>
    <p>Generated At: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
    <div className="kpi">
        <strong>Report Intent:</strong> {intent.upper()}
    </div>
    <div className="kpi">
        <strong>Matching Profiles:</strong> {count:,}
    </div>
    
    <h2>Top Results Summary</h2>
    <table>
        <thead>
            <tr>
                <th>Customer ID</th>
                <th>City</th>
                <th>Age</th>
                <th>Yearly Income</th>
                <th>Net Worth</th>
                <th>Credit Score</th>
                <th>Segment Persona</th>
            </tr>
        </thead>
        <tbody>
"""
    for item in results[:10]:
        html_content += f"""
            <tr>
                <td>{item.get('customer_id')}</td>
                <td>{item.get('city')}</td>
                <td>{item.get('current_age', item.get('age'))}</td>
                <td>₹{item.get('yearly_income', 0):,}</td>
                <td>₹{item.get('net_worth_estimate', 0):,.0f}</td>
                <td>{item.get('credit_score')}</td>
                <td>{item.get('segment_label')}</td>
            </tr>
"""
    html_content += """
        </tbody>
    </table>
</body>
</html>
"""
    path.write_text(html_content, encoding="utf-8")
    return str(path)

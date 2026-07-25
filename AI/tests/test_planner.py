from services.planner import plan_query

def test_premium_bangalore_plan():
    plan = plan_query("Find premium customers in Bangalore")
    assert plan["intent"] == "segment_query"
    assert plan["entities"]["city"] == "Bangalore"
    assert plan["entities"]["segment"] == "Premium"

def test_distribution_plan():
    assert plan_query("Show income distribution")["tools"] == ["eda", "visualization"]

def test_premium_prospecting_does_not_filter_existing_segment():
    assert plan_query("Which customers can become premium?")["entities"]["segment"] is None

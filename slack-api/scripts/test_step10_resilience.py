import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from app.models import Booking, Dependency, EdgeStatus, GraphResponse, GraphEdge
from app.graph import compute_trip_resilience

def run_step10_test():
    print("====================================================")
    print("STEP 10 VERIFICATION: Canonical Resilience & Scan")
    print("====================================================")
    
    # Constructed test case:
    # 1 safe edge, 1 tight edge, 1 violated edge
    # Penalty: tight (15) + violated (35) = 50
    # Expected Score: 100 - 50 = 50 (Caution)
    edges = [
        GraphEdge(
            id="e1",
            from_node="b1",
            to_node="b2",
            min_buffer_minutes=30,
            actual_gap_minutes=90.0,
            slack_minutes=60.0,
            status="safe"
        ),
        GraphEdge(
            id="e2",
            from_node="b2",
            to_node="b3",
            min_buffer_minutes=45,
            actual_gap_minutes=60.0,
            slack_minutes=15.0,
            status="tight"
        ),
        GraphEdge(
            id="e3",
            from_node="b3",
            to_node="b4",
            min_buffer_minutes=60,
            actual_gap_minutes=30.0,
            slack_minutes=-30.0,
            status="violated"
        ),
    ]
    
    g = GraphResponse(
        trip_id="trip-10",
        trip_name="Step 10 Trip",
        nodes=[],
        edges=edges,
    )
    
    res = compute_trip_resilience("trip-10", g, [])
    print(f"Computed Resilience: Score={res.score}, Grade={res.grade}")
    print(f"Counts: total={res.total_edges}, safe={res.safe_edges}, tight={res.tight_edges}, violated={res.violated_edges}")
    print(f"Thin connections caught proactively: {len(res.thin_connections)}")
    
    assert res.score == 50, f"Expected 50, got {res.score}"
    assert res.grade == "Caution", f"Expected Caution, got {res.grade}"
    assert len(res.thin_connections) == 2, f"Expected 2 thin connections, got {len(res.thin_connections)}"
    print("SUCCESS: Canonical resilience formula calculation matches exact mathematical expectation!")

if __name__ == "__main__":
    run_step10_test()

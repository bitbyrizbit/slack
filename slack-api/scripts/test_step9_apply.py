import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from app.models import Booking, Dependency, EdgeStatus, Disruption, DisruptionCreate
from app.graph import build_trip_graph, compute_trip_resilience
from app.database import (
    db_create_trip, db_create_booking, db_create_dependency,
    db_get_booking, db_list_bookings, db_list_dependencies,
    db_create_disruption, db_list_active_disruptions,
    db_get_recovery_candidate, db_apply_recovery, db_get_trip
)
from app.recovery import generate_raw_recovery_candidates, enrich_with_groq_or_fallback
from app.db.disruptions import db_save_recovery_candidates

def run_step9_test():
    print("========================================")
    print("STEP 9 VERIFICATION: Real Recovery Apply")
    print("========================================")
    trip_id = uuid4()
    now = datetime.now(timezone.utc)
    
    # 1. Create a trip with Flight -> Hotel
    from app.models import TripCreate, BookingCreate
    trip = db_create_trip(TripCreate(name="Step 9 Verification Trip"))
    
    # Flight: 10:00 -> 12:00
    b1 = db_create_booking(trip.id, BookingCreate(
        type="flight",
        title="Flight ZRH-LHR",
        start_time=now,
        end_time=now + timedelta(hours=2),
        cost=350.0
    ))
    
    # Hotel Check-in: 13:00 -> 14:00 (Gap = 60m, Min buffer = 45m, Slack = +15m -> tight)
    b2 = db_create_booking(trip.id, BookingCreate(
        type="hotel",
        title="The Savoy Hotel",
        start_time=now + timedelta(hours=3),
        end_time=now + timedelta(hours=4),
        cost=450.0,
        cancellation_policy="Free cancellation up to 24h before"
    ))
    
    # Dependency: b1 -> b2 with min_buffer 45m
    from app.models import DependencyCreate
    dep = db_create_dependency(trip.id, DependencyCreate(
        from_booking_id=b1.id,
        to_booking_id=b2.id,
        min_buffer_minutes=45
    ))
    
    # Check baseline graph & resilience
    bookings = db_list_bookings(trip.id)
    deps = db_list_dependencies(trip.id)
    g_base = build_trip_graph(str(trip.id), trip.name, bookings, deps)
    res_base = compute_trip_resilience(str(trip.id), g_base, bookings)
    print(f"Baseline: Edge slack={g_base.edges[0].slack_minutes}m, status={g_base.edges[0].status}, Resilience={res_base.score} ({res_base.grade})")
    
    # 2. Trigger Disruption: 60m delay on Flight LX
    disr = db_create_disruption(trip.id, DisruptionCreate(
        booking_id=b1.id,
        disruption_type="delay",
        delay_minutes=60,
        description="Air traffic hold"
    ))
    
    # Effective timing after delay:
    from app.ripple import compute_effective_bookings
    eff_bookings = compute_effective_bookings(bookings, [disr])
    g_disr = build_trip_graph(str(trip.id), trip.name, eff_bookings, deps)
    res_disr = compute_trip_resilience(str(trip.id), g_disr, eff_bookings)
    print(f"Disrupted: Edge slack={g_disr.edges[0].slack_minutes}m, status={g_disr.edges[0].status}, Resilience={res_disr.score} ({res_disr.grade})")
    assert g_disr.edges[0].status == "violated", "Edge should be violated after 60m delay"
    assert res_disr.score < res_base.score, "Resilience score should drop after disruption"
    
    # 3. Generate recovery candidates & apply top candidate
    raw_candidates = generate_raw_recovery_candidates(
        trip_id=trip.id,
        disruption=disr,
        disrupted_booking=b1,
        broken_booking=b2,
        all_bookings=bookings,
        dependencies=deps
    )
    enriched = enrich_with_groq_or_fallback(raw_candidates)
    saved = db_save_recovery_candidates(enriched)
    top_candidate = saved[0]
    print(f"Top Candidate: Type={top_candidate.candidate_type}, Title='{top_candidate.title}', Score={top_candidate.score}")
    
    # Apply recovery
    applied_cand, new_state = db_apply_recovery(top_candidate.id)
    
    # 4. Verify post-apply state in DB
    updated_b2 = db_get_booking(b2.id)
    active_disrs = db_list_active_disruptions(trip.id)
    assert len(active_disrs) == 0, "Active disruptions count must be 0 after apply"
    
    bookings_post = db_list_bookings(trip.id)
    deps_post = db_list_dependencies(trip.id)
    g_post = build_trip_graph(str(trip.id), trip.name, bookings_post, deps_post)
    res_post = compute_trip_resilience(str(trip.id), g_post, bookings_post)
    
    print(f"Post-Recovery Applied:")
    print(f"  Target Booking updated in DB: start_time={updated_b2.start_time if updated_b2 else 'DROPPED'}")
    print(f"  Active disruptions remaining: {len(active_disrs)}")
    if g_post.edges:
        print(f"  Recovered Edge slack: {g_post.edges[0].slack_minutes}m, status={g_post.edges[0].status}")
    print(f"  Recovered Resilience Score: {res_post.score} ({res_post.grade})")
    
    assert res_post.score > res_disr.score, f"Resilience score must increase! (got {res_post.score} vs {res_disr.score})"
    print("SUCCESS: Real recovery application confirmed across database, graph, and resilience score!")

if __name__ == "__main__":
    run_step9_test()

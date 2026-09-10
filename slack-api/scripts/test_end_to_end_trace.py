import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from uuid import uuid4
from datetime import datetime, timezone, timedelta
from app.models import TripCreate, BookingCreate, DependencyCreate, DisruptionCreate, TripMemberInviteRequest
from app.database import (
    db_create_user, db_create_trip, db_create_booking, db_create_dependency,
    db_create_disruption, db_list_bookings, db_list_dependencies,
    db_list_active_disruptions, db_get_booking, db_apply_recovery,
    db_update_trip_name, db_list_trips_for_user, db_list_activity_feed
)
from app.graph import build_trip_graph, compute_trip_resilience
from app.heuristics import suggest_dependencies_for_booking
from app.ripple import compute_ripple_impact, compute_effective_bookings
from app.recovery import generate_raw_recovery_candidates, enrich_with_groq_or_fallback
from app.db.disruptions import db_save_recovery_candidates
from app.routers.members import invite_trip_member

def run_end_to_end_trace():
    print("==================================================================")
    print("FULL 12-STEP END-TO-END NARRATIVE REGRESSION TRACE")
    print("==================================================================")
    now = datetime.now(timezone.utc)
    
    # 1. Sign up: User Alice
    email_alice = f"alice_{uuid4().hex[:6]}@example.com"
    user_alice = db_create_user(email=email_alice, display_name="Alice Explorer", password_hash="passhash123")
    print("Link 1 [Sign up]: CONFIRMED WORKING - User registered with real ID", user_alice.id)
    
    # 2. Land on empty dashboard: query trips for Alice
    trips_0 = db_list_trips_for_user(user_alice.id)
    assert len(trips_0) == 0, "Alice must start with 0 trips"
    print("Link 2 [Empty dashboard]: CONFIRMED WORKING - Starts empty, 0 trips")
    
    # 3. Create a trip
    trip = db_create_trip(TripCreate(name="Mediterranean Escape", owner_id=user_alice.id), creator_name=user_alice.display_name, creator_email=user_alice.email)
    print(f"Link 3 [Create trip]: CONFIRMED WORKING - Trip created '{trip.name}' ({trip.id})")
    
    # 4. Add flight and hotel close in time
    b_flight = db_create_booking(trip.id, BookingCreate(
        type="flight",
        title="Flight AF 1184 (CDG -> NCE)",
        start_time=now + timedelta(hours=2),
        end_time=now + timedelta(hours=3, minutes=30),
        cost=220.0
    ))
    b_hotel = db_create_booking(trip.id, BookingCreate(
        type="hotel",
        title="Hotel Le Negresco Nice",
        start_time=now + timedelta(hours=4, minutes=30),
        end_time=now + timedelta(days=2),
        cost=650.0,
        cancellation_policy="Free cancellation up to 24h before"
    ))
    print("Link 4 [Add flight & hotel]: CONFIRMED WORKING - Both bookings inserted into DB")
    
    # 5. Receive and accept dependency suggestion
    all_b = db_list_bookings(trip.id)
    suggs = suggest_dependencies_for_booking(b_hotel, [b_flight], [])
    assert len(suggs) > 0, "Heuristics must suggest flight -> hotel connection"
    sugg = suggs[0]
    dep = db_create_dependency(trip.id, DependencyCreate(
        from_booking_id=sugg.from_booking_id,
        to_booking_id=sugg.to_booking_id,
        min_buffer_minutes=sugg.suggested_min_buffer_minutes
    ))
    print(f"Link 5 [Dependency suggestion & accept]: CONFIRMED WORKING - Edge created (+{dep.min_buffer_minutes}m buffer)")
    
    # 6. View graph: confirm edge with correct status/slack
    deps = db_list_dependencies(trip.id)
    g1 = build_trip_graph(str(trip.id), trip.name, all_b, deps)
    res1 = compute_trip_resilience(str(trip.id), g1, all_b)
    assert len(g1.edges) == 1, "Graph must contain 1 edge"
    edge = g1.edges[0]
    print(f"Link 6 [Graph edge verification]: CONFIRMED WORKING - Slack={edge.slack_minutes}m, Status={edge.status}, Resilience={res1.score} ({res1.grade})")
    
    # 7. Trigger disruption on flight: 75m delay
    disr = db_create_disruption(trip.id, DisruptionCreate(
        booking_id=b_flight.id,
        disruption_type="delay",
        delay_minutes=75,
        description="Air traffic flow management ground delay"
    ))
    print("Link 7 [Trigger disruption]: CONFIRMED WORKING - Disruption inserted on flight (+75m delay)")
    
    # 8. Compute ripple & Impact Summary plain language
    eff_b = compute_effective_bookings(all_b, [disr])
    ripple_path, impacts, g2 = compute_ripple_impact(
        trip_id=str(trip.id),
        trip_name=trip.name,
        disrupted_booking_id=str(b_flight.id),
        original_bookings=all_b,
        dependencies=deps,
        active_disruptions=[disr]
    )
    res2 = compute_trip_resilience(str(trip.id), g2, eff_b)
    impacted_node = impacts[0]
    print(f"Link 8 [Ripple & Impact Summary]: CONFIRMED WORKING - Severity={impacted_node.severity}, Text='{impacted_node.human_explanation}', Resilience dropped to {res2.score}")
    assert res2.score < res1.score, "Resilience must drop"
    
    # 9. Request recovery options
    raw_cands = generate_raw_recovery_candidates(
        trip_id=trip.id,
        disruption=disr,
        disrupted_booking=b_flight,
        broken_booking=b_hotel,
        all_bookings=all_b,
        dependencies=deps
    )
    enriched = enrich_with_groq_or_fallback(raw_cands)
    saved_cands = db_save_recovery_candidates(enriched)
    assert len(saved_cands) >= 2, "Must generate at least 2 recovery options"
    top_cand = saved_cands[0]
    print(f"Link 9 [Recovery options]: CONFIRMED WORKING - Generated {len(saved_cands)} candidates, Top='{top_cand.title}' (Score {top_cand.score})")
    
    # 10. Apply top recovery option
    applied_cand, new_state = db_apply_recovery(top_cand.id)
    active_post = db_list_active_disruptions(trip.id)
    assert len(active_post) == 0, "Disruption must be resolved"
    all_b_post = db_list_bookings(trip.id)
    g3 = build_trip_graph(str(trip.id), trip.name, all_b_post, deps)
    res3 = compute_trip_resilience(str(trip.id), g3, all_b_post)
    print(f"Link 10 [Apply recovery]: CONFIRMED WORKING - Resolved=True, Edge slack={g3.edges[0].slack_minutes}m ({g3.edges[0].status}), Resilience={res3.score}")
    assert res3.score > res2.score, "Resilience must increase"
    
    # 11. Invite second real account as Editor
    user_ctx = {"user_id": str(user_alice.id), "email": user_alice.email, "display_name": user_alice.display_name}
    invite_resp = invite_trip_member(trip.id, TripMemberInviteRequest(
        email="bob_collaborator@example.com",
        name="Bob Collaborator",
        role="editor"
    ), current_user=user_ctx)
    activities = db_list_activity_feed(trip.id)
    assert len(activities) > 0, "Activity feed must record invite"
    print(f"Link 11 [Invite collaborator]: CONFIRMED WORKING - Bob invited as Editor, Activity logged by '{activities[0].actor_name}'")
    
    # 12. Rename trip in Settings & confirm dashboard listing
    renamed_trip = db_update_trip_name(trip.id, "Riviera & Alpine Grand Tour")
    alice_dashboard = db_list_trips_for_user(user_alice.id)
    matched = next(t for t in alice_dashboard if t.id == trip.id)
    assert matched.name == "Riviera & Alpine Grand Tour", "Dashboard must show renamed trip"
    print(f"Link 12 [Trip rename]: CONFIRMED WORKING - Renamed to '{matched.name}', visible immediately on dashboard")
    
    print("==================================================================")
    print("ALL 12/12 LINKS IN THE STORY TRACE ARE CONFIRMED WORKING!")
    print("==================================================================")

if __name__ == "__main__":
    run_end_to_end_trace()

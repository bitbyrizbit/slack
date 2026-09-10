import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from uuid import uuid4
from datetime import datetime, timezone, timedelta

from app.models import Booking, Dependency
from app.db.bookings import db_create_booking, db_dismiss_suggestion, db_list_dismissed_suggestions
from app.db.trips import db_create_trip, db_delete_trip
from app.heuristics import suggest_dependencies_for_booking

def main():
    print("=== TESTING STEP 4: SUGGESTION DISMISSAL PERSISTENCE ===")
    now = datetime.now(timezone.utc)
    
    # 1. Create a temporary test trip
    from app.models import TripCreate
    trip = db_create_trip(TripCreate(name="Test Dismiss Trip " + str(uuid4())[:8]))
    trip_id = trip.id
    print(f"Created temporary trip: {trip_id}")
    
    try:
        # 2. Create two bookings that naturally trigger a suggestion
        b1_start = now + timedelta(hours=10)
        b1_end = b1_start + timedelta(hours=2)
        b2_start = b1_end + timedelta(hours=1)
        b2_end = b2_start + timedelta(hours=3)
        
        from app.models import BookingCreate
        b1 = db_create_booking(trip_id, BookingCreate(
            type="flight",
            title="Flight A101",
            location="Zurich Airport (ZRH)",
            start_time=b1_start,
            end_time=b1_end,
            cost=200.0,
        ))
        b2 = db_create_booking(trip_id, BookingCreate(
            type="transfer",
            title="Shuttle S202",
            location="Zurich Airport (ZRH)",
            start_time=b2_start,
            end_time=b2_end,
            cost=40.0,
        ))
        print(f"Created Bookings: {b1.title} ({b1.id}) and {b2.title} ({b2.id})")
        
        # 3. Generate suggestions before dismissal
        existing_bookings = [b1, b2]
        existing_dependencies: list[Dependency] = []
        
        before_suggs = suggest_dependencies_for_booking(
            target_booking=b2,
            existing_bookings=existing_bookings,
            existing_dependencies=existing_dependencies,
        )
        print("\nBEFORE DISMISSAL SUGGESTIONS:")
        for s in before_suggs:
            print(f"  Suggested: from={s.from_booking_id} to={s.to_booking_id} buffer={s.suggested_min_buffer_minutes} reason={s.reason}")
            
        assert len(before_suggs) > 0, "Expected at least one suggestion before dismissal!"
        target_pair = (before_suggs[0].from_booking_id, before_suggs[0].to_booking_id)
        
        # 4. Call dismiss function directly
        print(f"\nDismissing suggestion pair: {target_pair[0]} -> {target_pair[1]}")
        from uuid import UUID
        res = db_dismiss_suggestion(
            trip_id=trip_id,
            from_booking_id=UUID(target_pair[0]),
            to_booking_id=UUID(target_pair[1]),
            dismissed_by=None,
        )
        assert res is True, "Expected db_dismiss_suggestion to return True"
        
        dismissed_list = db_list_dismissed_suggestions(trip_id)
        print(f"Persisted dismissed rows in DB: {dismissed_list}")
        assert target_pair in dismissed_list, "Target pair not found in DB dismissed_suggestions!"
        
        # 5. Generate suggestions after dismissal
        after_suggs = suggest_dependencies_for_booking(
            target_booking=b2,
            existing_bookings=existing_bookings,
            existing_dependencies=existing_dependencies,
        )
        print("\nAFTER DISMISSAL SUGGESTIONS:")
        for s in after_suggs:
            print(f"  Suggested: from={s.from_booking_id} to={s.to_booking_id}")
            
        assert all((s.from_booking_id, s.to_booking_id) != target_pair for s in after_suggs), \
            "Dismissed pair was still returned in suggestions!"
        print("\nCONFIRMED: Dismissed suggestion pair is completely filtered out!")
        print("STEP 4 VERIFICATION: PASS")
    finally:
        db_delete_trip(trip_id)
        print(f"Cleaned up temporary trip: {trip_id}")

if __name__ == "__main__":
    main()

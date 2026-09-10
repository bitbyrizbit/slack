import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from uuid import uuid4
from datetime import datetime, timezone, timedelta

from app.models import TripCreate, BookingCreate, DisruptionCreate
from app.db.trips import db_create_trip, db_delete_trip
from app.db.bookings import db_create_booking
from app.db.disruptions import db_list_active_disruptions
from app.routers.disruptions import trigger_disruption

def main():
    print("=== TESTING STEP 6: TRIGGER DISRUPTION IDEMPOTENCY ===")
    now = datetime.now(timezone.utc)
    
    trip = db_create_trip(TripCreate(name="Test Disruption Trip " + str(uuid4())[:8]))
    trip_id = trip.id
    print(f"Created temporary trip: {trip_id}")
    
    try:
        booking = db_create_booking(trip_id, BookingCreate(
            type="flight",
            title="Swiss Flight LX 354",
            start_time=now + timedelta(hours=2),
            end_time=now + timedelta(hours=4),
            cost=320.0,
        ))
        print(f"Created Booking: {booking.title} ({booking.id})")
        
        # User auth context matching verify_trip_mutation_permission requirements
        mock_user = {
            "user_id": str(uuid4()),
            "display_name": "Test Runner",
            "email": "tester@example.com",
            "role": "owner",
        }
        
        # Call trigger_disruption the first time
        disruption_in = DisruptionCreate(
            booking_id=booking.id,
            disruption_type="delay",
            delay_minutes=60,
            description="Thunderstorm ground stop",
        )
        
        print("\nTriggering disruption 1st time...")
        res1 = trigger_disruption(trip_id=trip_id, disruption_in=disruption_in, current_user=mock_user)
        print(f"1st result: disruption_id={res1.disruption_id}, delay={res1.delay_minutes}m")
        
        active_after_1 = db_list_active_disruptions(trip_id)
        print(f"Active disruption rows in DB after 1st call: {len(active_after_1)}")
        assert len(active_after_1) == 1, f"Expected 1 active disruption, found {len(active_after_1)}"
        
        # Call trigger_disruption a second time on the same booking
        print("\nTriggering disruption 2nd time on SAME booking...")
        res2 = trigger_disruption(trip_id=trip_id, disruption_in=disruption_in, current_user=mock_user)
        print(f"2nd result: disruption_id={res2.disruption_id}, delay={res2.delay_minutes}m")
        
        active_after_2 = db_list_active_disruptions(trip_id)
        print(f"Active disruption rows in DB after 2nd call: {len(active_after_2)}")
        assert len(active_after_2) == 1, f"DUPLICATE DISRUPTION CREATED! Expected 1 active row, found {len(active_after_2)}"
        assert res1.disruption_id == res2.disruption_id, "Expected same disruption ID to be returned"
        
        print("\nCONFIRMED: Disruption trigger is strictly idempotent! Only 1 active row exists.")
        print("STEP 6 VERIFICATION: PASS")
    finally:
        db_delete_trip(trip_id)
        print(f"Cleaned up temporary trip: {trip_id}")

if __name__ == "__main__":
    main()

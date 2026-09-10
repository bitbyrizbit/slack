import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta
from app.database import (
    db_get_user_by_email, db_create_trip, db_create_booking, db_create_dependency,
    db_add_trip_member
)

def add_mega_trip():
    users = ["owner@demo.com", "editor@demo.com", "viewer@demo.com"]
    for email in users:
        user = db_get_user_by_email(email)
        if not user: continue
        
        trip = db_create_trip(
            name="Mega 25-Event Demo Trip",
            owner_id=user.id,
            start_date="2026-11-01",
            end_date="2026-11-15"
        )
        print(f"Created trip for {email}: {trip.id}")
        
        base_time = datetime(2026, 11, 1, 8, 0, 0)
        prev_booking_id = None
        
        for i in range(25):
            types = ["flight", "hotel", "activity", "transfer"]
            b_type = types[i % 4]
            
            start = base_time + timedelta(hours=i*4)
            end = start + timedelta(hours=2)
            
            # create edge case: overlapping times
            if i == 5:
                start = base_time + timedelta(hours=4*4) + timedelta(minutes=30)
                
            booking = db_create_booking(
                trip_id=trip.id,
                type=b_type,
                title=f"Sample Event {i+1}",
                start_time=start.isoformat(),
                end_time=end.isoformat(),
                location="Demo Location",
                vendor="Demo Vendor",
                cost=100.0 + i,
                metadata_json={}
            )
            
            if prev_booking_id and i % 2 == 0:
                db_create_dependency(trip.id, prev_booking_id, booking.id, min_buffer_minutes=30)
            elif prev_booking_id and i % 3 == 0:
                # tight dependency
                db_create_dependency(trip.id, prev_booking_id, booking.id, min_buffer_minutes=120)
                
            prev_booking_id = booking.id

if __name__ == "__main__":
    add_mega_trip()
    print("Done adding 25 sample events trips.")

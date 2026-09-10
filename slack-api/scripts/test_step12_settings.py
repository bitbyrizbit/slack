import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from uuid import uuid4
from app.models import TripCreate, UserCreate
from app.database import (
    db_create_trip, db_update_trip_name, db_get_trip,
    db_list_trips_for_user, db_create_user, db_get_user_by_id,
    db_update_user_display_name
)

def run_step12_test():
    print("====================================================")
    print("STEP 12 VERIFICATION: Trip Settings & Profile")
    print("====================================================")
    
    # 1. Test User creation and display_name update
    test_email = f"user_{uuid4().hex[:6]}@example.com"
    user = db_create_user(email=test_email, display_name="Initial Name", password_hash="fakehash")
    print(f"Created user: id={user.id}, email={user.email}, display_name='{user.display_name}'")
    
    # Update display name
    updated_user = db_update_user_display_name(user.id, "Dr. Alice Smith")
    print(f"Updated user in DB: display_name='{updated_user.display_name}'")
    assert updated_user.display_name == "Dr. Alice Smith", "User display name must match updated value"
    
    # 2. Test trip creation with updated user as owner
    trip = db_create_trip(
        TripCreate(name="Original Trip Name", owner_id=user.id),
        creator_name=updated_user.display_name,
        creator_email=updated_user.email
    )
    print(f"Created trip: id={trip.id}, name='{trip.name}', owner_id={trip.owner_id}")
    
    # Check dashboard listing
    user_trips = db_list_trips_for_user(user.id)
    assert any(t.id == trip.id and t.name == "Original Trip Name" for t in user_trips)
    
    # 3. Test trip renaming in Settings
    new_name = "Grand European Summer Tour 2026"
    renamed_trip = db_update_trip_name(trip.id, new_name)
    print(f"Renamed trip in DB: name='{renamed_trip.name}'")
    assert renamed_trip.name == new_name
    
    # Verify dashboard list returns the new name immediately
    user_trips_post = db_list_trips_for_user(user.id)
    matched_trip = next(t for t in user_trips_post if t.id == trip.id)
    print(f"Dashboard query post-rename: name='{matched_trip.name}'")
    assert matched_trip.name == new_name, "Dashboard listing must reflect new name immediately"
    
    print("SUCCESS: Trip renaming and Profile display_name updating confirmed at database & query layer!")

if __name__ == "__main__":
    run_step12_test()

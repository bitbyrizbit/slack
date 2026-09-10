import sys
import time
import uuid
import httpx

sys.stdout.reconfigure(encoding='utf-8')

API_BASE = "http://localhost:8000"

def run_tests():
    print("==================================================")
    print("SPEC AUDIT & FIX VERIFICATION SUITE")
    print("==================================================")

    # 1. Test Demo Logins (Aisha, Charlie, Bob)
    print("\n--- Testing Demo Accounts Authentication ---")
    for email, role in [("owner@demo.com", "owner"), ("editor@demo.com", "editor"), ("viewer@demo.com", "viewer")]:
        res = httpx.post(f"{API_BASE}/auth/login", json={"email": email, "password": "demo1234"})
        assert res.status_code == 200, f"Failed demo login for {email}: {res.text}"
        data = res.json()
        assert "access_token" in data
        print(f"PASS: {email} ({role}) authenticated successfully. User ID: {data['user_id']}")

    # 2. Test Invalid Login
    print("\n--- Testing Invalid Credentials ---")
    bad_res = httpx.post(f"{API_BASE}/auth/login", json={"email": "owner@demo.com", "password": "wrongpassword"})
    assert bad_res.status_code == 401, f"Expected 401, got {bad_res.status_code}"
    err_detail = bad_res.json().get("detail", "")
    assert "Invalid email or password" in err_detail
    print(f"PASS: Invalid login returned 401 with specific message: '{err_detail}'")

    # 3. Test Brand-New User Registration & Zero-Trip Isolation
    print("\n--- Testing New User Registration & Zero-Trip Isolation ---")
    new_email = f"spec_user_{int(time.time())}@example.com"
    signup_res = httpx.post(f"{API_BASE}/auth/signup", json={
        "email": new_email,
        "password": "securepassword123",
        "display_name": "Fresh Test User"
    })
    assert signup_res.status_code == 201, f"Signup failed: {signup_res.text}"
    new_user_data = signup_res.json()
    new_token = new_user_data["access_token"]
    headers = {"Authorization": f"Bearer {new_token}"}
    print(f"PASS: Created new user {new_email}")

    # Check that new user has ZERO trips
    trips_res = httpx.get(f"{API_BASE}/trips", headers=headers)
    assert trips_res.status_code == 200
    new_user_trips = trips_res.json()
    assert len(new_user_trips) == 0, f"Expected 0 trips for fresh user, got {len(new_user_trips)}"
    print("PASS: Brand-new user has exactly 0 trips (empty dashboard verified).")

    # 4. Test Idempotent Demo Seeding for New User
    print("\n--- Testing Idempotent Demo Seeding ---")
    seed_res1 = httpx.post(f"{API_BASE}/demo/seed?reuse=true", headers=headers)
    assert seed_res1.status_code == 200, f"Demo seed 1 failed: {seed_res1.text}"
    trip1 = seed_res1.json()["trip"]
    print(f"PASS: First seed created trip '{trip1['name']}' (ID: {trip1['id']})")

    # Seed again with reuse=true
    seed_res2 = httpx.post(f"{API_BASE}/demo/seed?reuse=true", headers=headers)
    assert seed_res2.status_code == 200, f"Demo seed 2 failed: {seed_res2.text}"
    trip2 = seed_res2.json()["trip"]
    assert trip1["id"] == trip2["id"], f"Expected same trip ID on idempotent seed, got {trip1['id']} vs {trip2['id']}"

    # Verify total trips is still exactly 1
    trips_after_seed = httpx.get(f"{API_BASE}/trips", headers=headers).json()
    assert len(trips_after_seed) == 1, f"Expected 1 trip after idempotent seeds, got {len(trips_after_seed)}"
    print("PASS: Re-seeding was strictly idempotent (no duplicate trips created).")

    # 5. Test Custom Trip Creation
    print("\n--- Testing Custom Trip Creation ---")
    create_trip_res = httpx.post(f"{API_BASE}/trips", headers=headers, json={"name": "Paris & Rome Autumn 2026"})
    assert create_trip_res.status_code == 201
    custom_trip = create_trip_res.json()
    trip_id = custom_trip["id"]
    print(f"PASS: Custom trip created '{custom_trip['name']}' (ID: {trip_id})")

    # 6. Test Adding Bookings and Dependency Heuristic Suggestions
    print("\n--- Testing Add Booking & Heuristic Suggestions ---")
    # Booking 1: Flight arriving at Paris at 14:00
    b1_res = httpx.post(f"{API_BASE}/trips/{trip_id}/bookings", headers=headers, json={
        "type": "flight",
        "title": "Air France AF 123",
        "vendor": "Air France",
        "location": "Paris Charles de Gaulle (CDG)",
        "start_time": "2026-10-15T11:00:00Z",
        "end_time": "2026-10-15T14:00:00Z",
        "cost": 320.0,
        "metadata": {"flight_number": "AF123"}
    })
    assert b1_res.status_code == 201, f"Failed to add booking 1: {b1_res.text}"
    b1 = b1_res.json()["booking"]
    print(f"PASS: Added Flight booking '{b1['title']}' (ID: {b1['id']})")

    # Booking 2: Transfer departing at Paris at 15:15 (75m after flight arrival - perfect transfer buffer!)
    b2_res = httpx.post(f"{API_BASE}/trips/{trip_id}/bookings", headers=headers, json={
        "type": "transfer",
        "title": "Paris Airport Shuttle to Hotel",
        "vendor": "SuperShuttle",
        "location": "Paris Charles de Gaulle (CDG) to Central Hotel",
        "start_time": "2026-10-15T15:15:00Z",
        "end_time": "2026-10-15T16:15:00Z",
        "cost": 45.0,
        "metadata": {"pickup": "CDG", "dropoff": "Central Hotel"}
    })
    assert b2_res.status_code == 201, f"Failed to add booking 2: {b2_res.text}"
    b2_data = b2_res.json()
    b2 = b2_data["booking"]
    suggestions = b2_data.get("suggested_dependencies", [])
    print(f"PASS: Added Transfer booking '{b2['title']}'. Found {len(suggestions)} suggestion(s).")
    assert len(suggestions) > 0, "Expected heuristic suggestion for connected flight -> transfer!"
    sugg = suggestions[0]
    print(f"PASS: Suggestion details: from={sugg['from']} to={sugg['to']} buffer={sugg['suggested_min_buffer_minutes']}m reason='{sugg['reason']}'")

    # 7. Accept the Suggestion by Creating Dependency
    print("\n--- Testing Accepting Suggestion (Dependency Edge Creation) ---")
    dep_res = httpx.post(f"{API_BASE}/trips/{trip_id}/dependencies", headers=headers, json={
        "from_booking_id": sugg["from"],
        "to_booking_id": sugg["to"],
        "min_buffer_minutes": sugg["suggested_min_buffer_minutes"],
        "dependency_type": "temporal"
    })
    assert dep_res.status_code == 201, f"Failed to create dependency: {dep_res.text}"
    print("PASS: Created dependency edge from suggestion.")

    # 8. Verify Graph contains nodes and edge
    graph_res = httpx.get(f"{API_BASE}/trips/{trip_id}/graph", headers=headers)
    assert graph_res.status_code == 200
    graph_data = graph_res.json()
    assert len(graph_data["nodes"]) == 2, f"Expected 2 nodes, got {len(graph_data['nodes'])}"
    assert len(graph_data["edges"]) == 1, f"Expected 1 edge, got {len(graph_data['edges'])}"
    print(f"PASS: Verified graph has {len(graph_data['nodes'])} nodes and {len(graph_data['edges'])} edge with slack={graph_data['edges'][0]['slack_minutes']}m")

    # 9. Verify Resilience Score calculation for custom trip
    resilience_res = httpx.get(f"{API_BASE}/trips/{trip_id}/resilience", headers=headers)
    assert resilience_res.status_code == 200
    res_data = resilience_res.json()
    print(f"PASS: Trip Resilience Score = {res_data['score']} ({res_data['grade']})")

    print("\n==================================================")
    print("ALL SPEC AUDIT & FIX VERIFICATION TESTS PASSED (100%)")
    print("==================================================")

if __name__ == "__main__":
    run_tests()

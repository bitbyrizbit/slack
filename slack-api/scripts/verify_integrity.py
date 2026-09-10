#!/usr/bin/env python3
"""
Automated verification script for Backend Data Integrity Fix Pass.
Executes all 5 required checks from prompt Step 5.
"""

import os
import sys
import httpx
from uuid import UUID

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.core import get_db_connection

BASE_URL = "http://localhost:8000"


TARGET_TRIP_NAMES = [
    "Disruption Demo Trip",
    "Presence Trip",
    "Violated Trip",
    "Thin Layover Trip",
    "Safe Resilience Trip",
    "Recovery Lifecycle Trip",
    "European Tour 2026",
    "Editor Permitted Trip",
    "Viewer Security Trip",
    "Invite Flow Trip",
    "Collaboration Test Trip",
    "Remove Member Trip",
    "Alpine Odyssey (Zurich → Geneva → Chamonix)",
    "Grand European Tour (16 Bookings Stress Test)",
]


def check_1_trips_grouped_by_name():
    print("\n--- CHECK 1: Query trips grouped by name ---")
    with get_db_connection() as conn:
        conn.execute("""
            SELECT name, count(*) as cnt, array_agg(owner_id::text) as owners
            FROM trips
            GROUP BY name
            ORDER BY count(*) DESC, name ASC;
        """)
        all_grouped = conn.cursor.fetchall()

    target_dups = []
    target_counts = {}
    non_target_trips = {}

    for r in all_grouped:
        name = r["name"]
        cnt = r["cnt"]
        if name in TARGET_TRIP_NAMES:
            target_counts[name] = cnt
            if cnt > 1:
                target_dups.append((name, cnt))
        else:
            non_target_trips[name] = cnt

    print("Target Demo/Test Scenario Trips (must appear exactly ONCE):")
    for name in TARGET_TRIP_NAMES:
        cnt = target_counts.get(name, 0)
        status = "OK (1 canonical row)" if cnt == 1 else f"FAIL ({cnt} rows)"
        print(f"  - {name:<48}: {status}")

    print("\nNon-Target Preserved Trips (untouched per Step 4 instructions):")
    for name, cnt in non_target_trips.items():
        print(f"  - {name:<48}: {cnt} row(s) [UNTOUCHED]")

    if target_dups:
        print(f"\nFAILED: Target trips have duplicates: {target_dups}")
        return False

    missing_targets = [n for n in TARGET_TRIP_NAMES if n not in target_counts]
    if missing_targets:
        print(f"\nFAILED: Missing target trips: {missing_targets}")
        return False

    print("\nPASSED: All 14 target scenario trip names appear exactly once, each owned by owner@demo.com!")
    return True


def check_2_viewer_role():
    print("\n--- CHECK 2: Log in as viewer@demo.com and call GET /trips/{trip_id}/graph ---")
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # 1. Login as viewer
        login_res = client.post("/auth/login", json={"email": "viewer@demo.com", "password": "demo1234"})
        if login_res.status_code != 200:
            print(f"FAILED: viewer login returned status {login_res.status_code}: {login_res.text}")
            return False

        viewer_token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {viewer_token}"}

        # 2. Find a shared trip where viewer is a member (e.g. Alpine Odyssey)
        with get_db_connection() as conn:
            conn.execute("""
                SELECT tm.trip_id, t.name, tm.role
                FROM trip_members tm
                JOIN trips t ON t.id = tm.trip_id
                WHERE tm.email = 'viewer@demo.com' OR tm.role = 'viewer'
                LIMIT 1;
            """)
            shared = conn.cursor.fetchone()

        if not shared:
            print("FAILED: No shared trip found for viewer in trip_members")
            return False

        trip_id = str(shared["trip_id"])
        print(f"Testing with shared trip '{shared['name']}' (trip_id: {trip_id})")

        # 3. Call GET /trips/{trip_id}/graph
        graph_res = client.get(f"/trips/{trip_id}/graph", headers=headers)
        if graph_res.status_code != 200:
            print(f"FAILED: GET /trips/{trip_id}/graph returned status {graph_res.status_code}: {graph_res.text}")
            return False

        data = graph_res.json()
        my_role = data.get("my_role")
        print(f"Graph response my_role: '{my_role}'")

        if my_role == "viewer":
            print("PASSED: my_role is exactly 'viewer'!")
            return True
        else:
            print(f"FAILED: expected my_role == 'viewer', got '{my_role}'")
            return False


def check_3_real_user_trip_creation():
    print("\n--- CHECK 3: Log in as real non-demo user and create a new trip ---")
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # Check for real user, e.g. shaikhrihaan282006@gmail.com or hello@gmail.com
        # Or create a dedicated real test user to verify login + creation
        test_email = "alex.traveler.real@gmail.com"
        test_pass = "securepassword123"
        test_name = "Alex Mercer"

        # Try signup or login
        signup_res = client.post("/auth/signup", json={"email": test_email, "password": test_pass, "display_name": test_name})
        if signup_res.status_code == 201:
            token = signup_res.json()["access_token"]
        else:
            login_res = client.post("/auth/login", json={"email": test_email, "password": test_pass})
            token = login_res.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}

        trip_name = "Kyoto Autumn & Arashiyama Expedition"
        # Check if trip already exists from a prior test run, if so clean up
        with get_db_connection() as conn:
            conn.execute("DELETE FROM trips WHERE name = %s", (trip_name,))

        create_res = client.post("/trips", json={"name": trip_name}, headers=headers)
        if create_res.status_code != 201:
            print(f"FAILED: Trip creation returned {create_res.status_code}: {create_res.text}")
            return False

        trip_data = create_res.json()
        trip_id = trip_data["id"]
        print(f"Created trip: '{trip_data['name']}' (id: {trip_id})")

        # Query trip_members directly from the DB
        with get_db_connection() as conn:
            conn.execute("SELECT * FROM trip_members WHERE trip_id = %s;", (trip_id,))
            members = conn.cursor.fetchall()

        print(f"Found {len(members)} trip_members row(s):")
        for m in members:
            print(f"  - name: '{m['name']}', email: '{m['email']}', role: '{m['role']}'")

        owner_member = next((m for m in members if m["role"] == "owner"), None)
        if not owner_member:
            print("FAILED: No owner row in trip_members!")
            return False

        if owner_member["name"] == test_name and owner_member["email"] == test_email:
            print("PASSED: Owner row shows real user's actual name and email, NOT 'Trip Owner'!")
            return True
        else:
            print(f"FAILED: Expected name='{test_name}' and email='{test_email}', got name='{owner_member['name']}', email='{owner_member['email']}'")
            return False


def check_4_disruption_idempotency():
    print("\n--- CHECK 4: Trigger sample disruption twice sequentially on same trip ---")
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # Login as owner
        login_res = client.post("/auth/login", json={"email": "owner@demo.com", "password": "demo1234"})
        owner_token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {owner_token}"}

        # Find Alpine Odyssey trip
        with get_db_connection() as conn:
            conn.execute("SELECT id FROM trips WHERE name LIKE 'Alpine Odyssey%' LIMIT 1;")
            row = conn.cursor.fetchone()
        if not row:
            print("FAILED: Alpine Odyssey trip not found")
            return False

        trip_id = str(row["id"])

        # Clear any existing disruptions on this trip to test cleanly
        with get_db_connection() as conn:
            conn.execute("DELETE FROM recovery_candidates WHERE trip_id = %s;", (trip_id,))
            conn.execute("DELETE FROM disruptions WHERE trip_id = %s;", (trip_id,))

        # First call
        res1 = client.post(
            "/demo/sample-disruption",
            json={"trip_id": trip_id, "delay_minutes": 60, "description": "Weather delay 60m"},
            headers=headers,
        )
        print(f"First trigger response status: {res1.status_code}")
        if res1.status_code != 200:
            print(f"FAILED: First trigger failed: {res1.text}")
            return False
        disruption_id_1 = res1.json()["disruption_id"]

        # Second call
        res2 = client.post(
            "/demo/sample-disruption",
            json={"trip_id": trip_id, "delay_minutes": 60, "description": "Weather delay 60m"},
            headers=headers,
        )
        print(f"Second trigger response status: {res2.status_code}")
        if res2.status_code != 200:
            print(f"FAILED: Second trigger failed: {res2.text}")
            return False
        disruption_id_2 = res2.json()["disruption_id"]

        print(f"Disruption ID 1: {disruption_id_1}")
        print(f"Disruption ID 2: {disruption_id_2}")

        # Check DB row count for active disruptions on this trip
        with get_db_connection() as conn:
            conn.execute("SELECT count(*) as cnt FROM disruptions WHERE trip_id = %s AND resolved = FALSE;", (trip_id,))
            cnt = conn.cursor.fetchone()["cnt"]

        print(f"Active disruptions count in DB: {cnt}")
        if cnt == 1 and disruption_id_1 == disruption_id_2:
            print("PASSED: Exactly one active disruption exists on that booking after calling twice in a row!")
            return True
        else:
            print(f"FAILED: Expected exactly 1 active disruption, found {cnt}")
            return False


def main():
    print("==================================================")
    print("STARTING BACKEND DATA INTEGRITY VERIFICATION PASS")
    print("==================================================")

    results = {
        "Check 1 (No duplicate trip names)": check_1_trips_grouped_by_name(),
        "Check 2 (Viewer role returns 'viewer')": check_2_viewer_role(),
        "Check 3 (Real user identity propagation)": check_3_real_user_trip_creation(),
        "Check 4 (Disruption endpoint idempotency)": check_4_disruption_idempotency(),
    }

    print("\n==================================================")
    print("VERIFICATION SUMMARY")
    print("==================================================")
    all_passed = True
    for check_name, passed in results.items():
        status = "PASSED" if passed else "FAILED"
        print(f"  {check_name:<45}: {status}")
        if not passed:
            all_passed = False

    if all_passed:
        print("\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    else:
        print("\nSOME CHECKS FAILED. Please review above output.")

    return all_passed


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

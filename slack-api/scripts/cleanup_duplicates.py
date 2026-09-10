#!/usr/bin/env python3
"""
One-time database cleanup migration script for Backend Data Integrity Pass.
Grounded in AUDIT_REPORT.md.

Performs:
1. Prints initial row counts for: trips, bookings, dependencies, trip_members, activity_feed.
2. Identifies the 14 known demo/test scenario trip names:
   - Disruption Demo Trip
   - Presence Trip
   - Violated Trip
   - Thin Layover Trip
   - Safe Resilience Trip
   - Recovery Lifecycle Trip
   - European Tour 2026
   - Editor Permitted Trip
   - Viewer Security Trip
   - Invite Flow Trip
   - Collaboration Test Trip
   - Remove Member Trip
   - Alpine Odyssey (Zurich → Geneva → Chamonix)
   - Grand European Tour (16 Bookings Stress Test)
3. For each target name:
   - Retains exactly 1 canonical copy.
   - Ensures the canonical trip's owner_id is set to owner@demo.com.
   - Ensures owner@demo.com, editor@demo.com, and viewer@demo.com are in trip_members.
   - Deletes all other duplicate rows for that name, cascading through existing foreign keys.
4. Leaves all non-target trips (e.g. Tokyo Spring 2026, user custom trips) completely untouched.
5. Prints final row counts for the same 5 tables after cleanup.
"""

import os
import sys
from uuid import UUID

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Ensure app can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.core import get_db_connection
from app.db.trips import db_delete_trip

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


def get_table_counts():
    tables = ["trips", "bookings", "dependencies", "trip_members", "activity_feed"]
    counts = {}
    with get_db_connection() as conn:
        for t in tables:
            conn.execute(f"SELECT count(*) as cnt FROM {t};")
            counts[t] = conn.cursor.fetchone()["cnt"]
    return counts


def run_cleanup():
    print("==================================================")
    print("ONE-TIME DATABASE CLEANUP MIGRATION")
    print("==================================================")

    # 1. Print current row counts
    initial_counts = get_table_counts()
    print("\n--- INITIAL ROW COUNTS ---")
    for tbl, cnt in initial_counts.items():
        print(f"  {tbl:<15}: {cnt}")

    with get_db_connection() as conn:
        # Fetch demo user IDs
        conn.execute("SELECT id, email, display_name FROM users WHERE email IN ('owner@demo.com', 'editor@demo.com', 'viewer@demo.com');")
        demo_users = {r["email"]: r for r in conn.cursor.fetchall()}

        owner_user = demo_users.get("owner@demo.com")
        editor_user = demo_users.get("editor@demo.com")
        viewer_user = demo_users.get("viewer@demo.com")

        if not owner_user:
            raise RuntimeError("owner@demo.com user not found in database!")

        owner_id = str(owner_user["id"])
        editor_id = str(editor_user["id"]) if editor_user else None
        viewer_id = str(viewer_user["id"]) if viewer_user else None

        # Query all trips
        conn.execute("SELECT id, name, owner_id, created_at FROM trips ORDER BY created_at ASC;")
        all_trips = conn.cursor.fetchall()

    trips_by_name = {}
    untouched_trips = []

    for t in all_trips:
        name = t["name"]
        if name in TARGET_TRIP_NAMES:
            trips_by_name.setdefault(name, []).append(t)
        else:
            untouched_trips.append(t)

    print(f"\nFound {len(trips_by_name)} target scenario trip groups to clean up.")
    print(f"Found {len(untouched_trips)} non-target trips that will remain completely UNTOUCHED.")

    deleted_trips_count = 0

    for name in TARGET_TRIP_NAMES:
        group = trips_by_name.get(name, [])
        if not group:
            print(f"  [SKIP] No trips found matching '{name}'")
            continue

        # Choose canonical trip: prefer one already owned by owner_id, else the first (oldest)
        owned_by_demo = [t for t in group if str(t.get("owner_id")) == owner_id]
        if owned_by_demo:
            canonical = owned_by_demo[0]
        else:
            canonical = group[0]

        canonical_id = canonical["id"]
        duplicates = [t for t in group if t["id"] != canonical_id]

        # Update canonical trip owner to owner@demo.com
        with get_db_connection() as conn:
            conn.execute(
                "UPDATE trips SET owner_id = %s WHERE id = %s;",
                (owner_id, str(canonical_id)),
            )

            # Ensure owner@demo.com is in trip_members as owner
            conn.execute(
                """
                INSERT INTO trip_members (id, trip_id, user_id, email, name, role)
                VALUES (gen_random_uuid(), %s, %s, %s, %s, 'owner')
                ON CONFLICT (trip_id, email) DO UPDATE SET
                    role = 'owner',
                    user_id = EXCLUDED.user_id,
                    name = EXCLUDED.name;
                """,
                (str(canonical_id), owner_id, owner_user["email"], owner_user["display_name"]),
            )

            # Ensure editor@demo.com is in trip_members as editor
            if editor_user:
                conn.execute(
                    """
                    INSERT INTO trip_members (id, trip_id, user_id, email, name, role)
                    VALUES (gen_random_uuid(), %s, %s, %s, %s, 'editor')
                    ON CONFLICT (trip_id, email) DO UPDATE SET
                        role = 'editor',
                        user_id = EXCLUDED.user_id,
                        name = EXCLUDED.name;
                    """,
                    (str(canonical_id), editor_id, editor_user["email"], editor_user["display_name"]),
                )

            # Ensure viewer@demo.com is in trip_members as viewer
            if viewer_user:
                conn.execute(
                    """
                    INSERT INTO trip_members (id, trip_id, user_id, email, name, role)
                    VALUES (gen_random_uuid(), %s, %s, %s, %s, 'viewer')
                    ON CONFLICT (trip_id, email) DO UPDATE SET
                        role = 'viewer',
                        user_id = EXCLUDED.user_id,
                        name = EXCLUDED.name;
                    """,
                    (str(canonical_id), viewer_id, viewer_user["email"], viewer_user["display_name"]),
                )

        # Delete duplicates using db_delete_trip which cascades to all tables
        for dup in duplicates:
            db_delete_trip(dup["id"])
            deleted_trips_count += 1

        print(f"  [OK] '{name}': kept canonical ({canonical_id}), removed {len(duplicates)} duplicate(s).")

    print(f"\nTotal duplicate trips deleted: {deleted_trips_count}")

    # 5. Print final row counts
    final_counts = get_table_counts()
    print("\n--- FINAL ROW COUNTS ---")
    for tbl, cnt in final_counts.items():
        diff = cnt - initial_counts[tbl]
        diff_str = f"({diff:+d})" if diff != 0 else "(no change)"
        print(f"  {tbl:<15}: {cnt:<6} {diff_str}")

    print("\n==================================================")
    print("MIGRATION COMPLETED SUCCESSFULLY")
    print("==================================================")

    return initial_counts, final_counts


if __name__ == "__main__":
    run_cleanup()

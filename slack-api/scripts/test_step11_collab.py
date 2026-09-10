import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from uuid import uuid4
from fastapi import HTTPException
from app.models import TripCreate, TripMemberInviteRequest
from app.database import (
    db_create_trip, db_create_user, db_add_trip_member,
    db_get_user_role_for_trip, db_list_trip_members
)
from app.routers.members import invite_trip_member
from app.routers.trips import verify_trip_mutation_permission

def run_step11_test():
    print("====================================================")
    print("STEP 11 VERIFICATION: Collaboration, Invite & RBAC")
    print("====================================================")
    
    # 1. Create trip with Owner
    owner_id = uuid4()
    owner_email = f"owner_{uuid4().hex[:6]}@example.com"
    trip = db_create_trip(TripCreate(name="Collab Trip", owner_id=owner_id))
    
    owner_user_ctx = {
        "user_id": str(owner_id),
        "email": owner_email,
        "display_name": "Trip Owner Alice"
    }
    
    # 2. Owner invites a test collaborator as Editor
    invite_in = TripMemberInviteRequest(
        email=f"editor_{uuid4().hex[:6]}@example.com",
        name="Charlie Editor",
        role="editor"
    )
    
    resp = invite_trip_member(trip.id, invite_in, current_user=owner_user_ctx)
    print(f"Invite generated:")
    print(f"  Collaborator: {resp.member.name} ({resp.member.email})")
    print(f"  Role: {resp.member.role}")
    print(f"  Invite Token: {resp.invite_token}")
    
    members = db_list_trip_members(trip.id)
    assert any(m.email == invite_in.email and m.role == "editor" for m in members), "Member row should exist with editor role"
    
    # 3. Add Viewer and verify Viewer is blocked from mutating/inviting
    viewer_id = uuid4()
    viewer_email = f"viewer_{uuid4().hex[:6]}@example.com"
    db_add_trip_member(
        trip_id=trip.id,
        email=viewer_email,
        name="Bob Viewer",
        role="viewer",
        user_id=viewer_id
    )
    
    viewer_user_ctx = {
        "user_id": str(viewer_id),
        "email": viewer_email,
        "display_name": "Bob Viewer"
    }
    
    # Viewer tries to call verify_trip_mutation_permission
    viewer_blocked = False
    try:
        verify_trip_mutation_permission(trip.id, viewer_user_ctx)
    except HTTPException as e:
        if e.status_code == 403:
            viewer_blocked = True
            print(f"Server-side RBAC verification: Viewer mutation attempt rejected with HTTP 403 ({e.detail})")
    
    assert viewer_blocked, "Viewer must be rejected with 403 Forbidden!"
    
    # Viewer tries to invite someone
    viewer_invite_blocked = False
    try:
        invite_trip_member(trip.id, TripMemberInviteRequest(email="hacker@test.com", name="Hacker", role="editor"), current_user=viewer_user_ctx)
    except HTTPException as e:
        if e.status_code == 403:
            viewer_invite_blocked = True
            print("Server-side RBAC verification: Viewer invite attempt rejected with HTTP 403")
    
    assert viewer_invite_blocked, "Viewer must be blocked from inviting new members!"
    print("SUCCESS: Real collaborator invite and strict server-side RBAC enforcement confirmed!")

if __name__ == "__main__":
    run_step11_test()

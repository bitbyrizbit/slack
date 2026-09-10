
import sys
import os
sys.path.insert(0, os.path.abspath('slack-api'))
from app.db.trips import db_list_trips_for_user
from uuid import UUID

try:
    trips = db_list_trips_for_user(UUID('2eca4bf6-fcc8-43e0-9f23-74b2cacfadb3'))
    print('Trips:', trips)
except Exception as e:
    import traceback
    traceback.print_exc()


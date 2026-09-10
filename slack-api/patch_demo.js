const fs = require('fs');

let file = 'app/demo.py';
let content = fs.readFileSync(file, 'utf8');

const extraEventsCode = `
    # Add 25 sample events to demo trips for all edge cases
    base_demo_time = datetime(2026, 12, 1, 8, 0, 0, tzinfo=timezone.utc)
    prev_demo_booking_id = None
    for i in range(25):
        types = ['flight', 'hotel', 'activity', 'transfer']
        b_type = types[i % 4]
        
        start = base_demo_time + timedelta(hours=i*4)
        end = start + timedelta(hours=2)
        
        # Edge case: overlapping times
        if i == 5:
            start = base_demo_time + timedelta(hours=4*4) + timedelta(minutes=30)
            
        demo_booking = db_create_booking(
            trip_id=trip_id,
            type=b_type,
            title=f'Sample Event {i+1}',
            start_time=start.isoformat(),
            end_time=end.isoformat(),
            location='Demo Location',
            vendor='Demo Vendor',
            cost=100.0 + i,
            metadata_json={}
        )
        
        if prev_demo_booking_id and i % 2 == 0:
            db_create_dependency(trip_id, prev_demo_booking_id, demo_booking.id, min_buffer_minutes=30)
        elif prev_demo_booking_id and i % 3 == 0:
            db_create_dependency(trip_id, prev_demo_booking_id, demo_booking.id, min_buffer_minutes=120)
            
        prev_demo_booking_id = demo_booking.id
`;

content = content.replace('    return {', extraEventsCode + '\n    return {');
fs.writeFileSync(file, content);

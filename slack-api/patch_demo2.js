const fs = require('fs');

let file = 'app/demo.py';
let content = fs.readFileSync(file, 'utf8');

const extraEventsCode = `
    # --- ADD 25 SAMPLE EVENTS FOR ALL EDGE CASES ---
    extra_bookings = []
    extra_dependencies = []
    base_demo_time = base_date + timedelta(days=2)
    prev_demo_booking_id = None
    for i in range(25):
        types = ['flight', 'hotel', 'activity', 'transfer']
        b_type = types[i % 4]
        
        start = base_demo_time + timedelta(hours=i*4)
        end = start + timedelta(hours=2)
        
        if i == 5:
            start = base_demo_time + timedelta(hours=4*4) + timedelta(minutes=30)
            
        demo_booking = db_create_booking(
            BookingCreate(
                trip_id=trip_id,
                type=b_type,
                title=f'Sample Event {i+1}',
                start_time=start,
                end_time=end,
                location='Demo Location',
                vendor='Demo Vendor',
                cost=100.0 + i,
            )
        )
        extra_bookings.append(demo_booking)
        
        if prev_demo_booking_id and i % 2 == 0:
            extra_dependencies.append(db_create_dependency(DependencyCreate(trip_id=trip_id, from_booking_id=prev_demo_booking_id, to_booking_id=demo_booking.id, min_buffer_minutes=30)))
        elif prev_demo_booking_id and i % 3 == 0:
            extra_dependencies.append(db_create_dependency(DependencyCreate(trip_id=trip_id, from_booking_id=prev_demo_booking_id, to_booking_id=demo_booking.id, min_buffer_minutes=120)))
            
        prev_demo_booking_id = demo_booking.id

    db_add_activity_log(
`;

content = content.replace('    db_add_activity_log(', extraEventsCode);

// Also update the return dict
content = content.replace(
    '"bookings": [b1, b2, b3, b4, b5, b6, b7],',
    '"bookings": [b1, b2, b3, b4, b5, b6, b7] + extra_bookings,'
);
content = content.replace(
    '"dependencies": [d1, d2, d3, d4, d5],',
    '"dependencies": [d1, d2, d3, d4, d5] + extra_dependencies,'
);

fs.writeFileSync(file, content);

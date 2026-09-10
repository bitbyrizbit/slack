import sys

with open('app/demo.py', 'r') as f:
    content = f.read()

# I want to find the start and end of my patch and remove it.
# The patch starts with "# Add 25 sample events to demo trips for all edge cases"
# and ends with "prev_demo_booking_id = demo_booking.id"

start_str = "    # Add 25 sample events to demo trips for all edge cases"
end_str = "        prev_demo_booking_id = demo_booking.id\n"

if start_str in content and end_str in content:
    start_idx = content.find(start_str)
    end_idx = content.find(end_str) + len(end_str)
    
    content = content[:start_idx] + content[end_idx:]

    with open('app/demo.py', 'w') as f:
        f.write(content)
    print("Patch removed successfully.")
else:
    print("Patch not found.")

const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

// Replace Button 1
content = content.replace(
  'className="px-8 py-3 rounded-full bg-[var(--foreground)] text-[var(--background)] font-medium hover:bg-[var(--accent)] hover:text-[#18181A] transition-colors"',
  'className="px-8 py-3 rounded-full bg-[var(--foreground)] text-[var(--background)] font-medium hover:bg-[var(--accent)] hover:text-[#18181A] transition-colors"'
);
content = content.replace('>Start Engine<', '>Begin Journey<');

// Replace Button 2 (transparent)
content = content.replace(
  'className="px-8 py-3 rounded-full border border-[var(--border-strong)] bg-[var(--card)] hover:border-[var(--foreground)] transition-colors"',
  'className="px-8 py-3 rounded-full border border-[var(--border-strong)] bg-transparent hover:border-[var(--accent)] text-[var(--foreground)] transition-colors"'
);
content = content.replace('>View Documentation<', '>Explore Features<');

// Text replacements
content = content.replace('Smart Travel Dependency Engine', 'Intelligent Travel Assistant');
content = content.replace('Travel itineraries modeled as Directed Acyclic Graphs with automated edge slack recalculation.', 'Your entire journey orchestrated perfectly, ensuring you never miss a moment.');
content = content.replace('Itineraries as Graphs', 'Connected Journeys');
content = content.replace("A trip isn't just a list of bookings—it's a web of dependencies. Slack models your travel as a graph, calculating the critical path and available buffer (slack) between every flight, transfer, and check-in.", 'Your trip is a continuous experience. We ensure every step connects flawlessly to the next, giving you peace of mind.');
content = content.replace('Node 1:', 'Departure:');
content = content.replace('Node 2:', 'Arrival:');
content = content.replace('Edge: 2h 15m Slack', 'Connection: 2h 15m Window');
content = content.replace('Delay Cascades Downstream', 'Anticipating Delays');
content = content.replace('A weather delay adds 60 mins to the flight, moving arrival to 10:30. The buffer disappears and inverts to <strong className="text-[#FCA5A5] font-medium">-15 mins</strong>. The shuttle is missed!', 'When weather delays your flight, we instantly foresee the impact on your connections.');
content = content.replace('Broken Edge: -15m violation', 'Alert: Missed Window');
content = content.replace('Autonomous Recovery', 'Swift Resolution');
content = content.replace('The engine evaluates rebooking options and downstream shifts, automatically holding the 11:30 shuttle to protect the hotel check-in.', 'We automatically evaluate alternatives, keeping your journey on track without the stress.');
content = content.replace('Recovery: Shift to Next Shuttle', 'Solution: Next Shuttle Booked');

content = content.replace('Connection Chains', 'Seamless Connections');
content = content.replace('Every booking is linked with transfer windows and travel buffers. The engine continuously validates each link and flags vulnerable connections.', 'We monitor every step of your travel, ensuring smooth transitions and flagging any tight schedules.');
content = content.replace('Resilience Health Scoring', 'Trip Confidence');
content = content.replace('Instant resilience rings score itinerary health from 0 to 100 based on minimum connection buffers, single points of failure, and cancellation policies.', 'Understand how reliable your plans are with our simple confidence scores, helping you travel without worry.');
content = content.replace('Role-Based Collaboration', 'Travel Together');
content = content.replace('Invite fellow travelers as Owners, Editors, or Viewers. Security rules are verified server-side with signed tokens, keeping read-only views safe.', 'Invite your friends and family to coordinate plans together safely and effortlessly.');

// Footer replacements
content = content.replace('<span>— Travel Disruption Recovery Engine</span>', '<span>- Effortless Travel</span>');
content = content.replace('<span>?" Travel Disruption Recovery Engine</span>', '<span>- Effortless Travel</span>');
content = content.replace('<span>?" Travel Disruption Recovery Engine</span>', '<span>- Effortless Travel</span>');
content = content.replace('Built with Next.js App Router, FastAPI & PostgreSQL', 'Crafted for seamless journeys');

// Strip out unreadable characters
content = content.replace(/—/g, '-');
content = content.replace(/•/g, '-');
content = content.replace(/\?"/g, '-');

fs.writeFileSync('app/page.tsx', content);

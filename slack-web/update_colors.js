const fs = require('fs');

const replacement = `const TYPE_COLORS: Record<string, { fill: string; stroke: string; label: string; text: string }> = {
  flight: { fill: '#18181A', stroke: 'none', label: 'Flight', text: '#E6D5B8' },
  hotel: { fill: '#2D3A31', stroke: 'none', label: 'Hotel', text: '#E6D5B8' },
  transfer: { fill: '#E6D5B8', stroke: 'none', label: 'Transfer', text: '#18181A' },
  activity: { fill: '#FFFFFF', stroke: 'none', label: 'Activity', text: '#18181A' },
};`;

let file = 'hooks/useD3Graph.ts';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/const TYPE_COLORS: Record[\s\S]*?\};\n/, replacement + '\n');
fs.writeFileSync(file, content);

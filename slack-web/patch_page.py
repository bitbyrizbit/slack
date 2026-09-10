import os

with open('app/page.tsx', 'r') as f:
    content = f.read()

start_str = '<div className="md:w-[45%] mt-16 md:mt-0 relative w-full">'
end_str = '</div>\n        </div>\n      </section>'

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + '<div className="md:w-[45%] mt-16 md:mt-0 relative w-full">\n            <LandingCarousel />\n          ' + content[end_idx:]
    
    if 'import LandingCarousel' not in new_content:
        new_content = new_content.replace('import Link from "next/link";', 'import Link from "next/link";\nimport LandingCarousel from "@/components/LandingCarousel";')
        
    with open('app/page.tsx', 'w') as f:
        f.write(new_content)
    print("Replaced successfully")
else:
    print("Could not find boundaries", start_idx, end_idx)

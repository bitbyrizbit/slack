"""
Fix remaining hardcoded dark colors after light theme switch.
"""
import os
import re

# Signup/login input bg that was hardcoded dark
REPLACEMENTS = [
    # Dark input fields on signup/login
    ("bg-[#1D1F21]", "bg-[var(--muted)]"),
    # Giant shadow that looks odd on light theme
    ("shadow-[0_0_80px_rgba(0,0,0,0.8)]", "shadow-xl"),
    # Carousel flight icon was bg-[var(--foreground)] text-[var(--foreground)] 
    # → now foreground is black, so it shows as black circle
    # Fix in carousel: the flight departure circle
    (
        'bg-[var(--foreground)] flex items-center justify-center text-[var(--foreground)]',
        'bg-[#E8F0E9] flex items-center justify-center text-[#2D3A31]'
    ),
    # Any remaining dark black buttons  
    ("bg-[#2D3A31] text-white", "bg-[#2D3A31] text-white"),  # keep these — they're correct dark green CTAs
    # Text color that's now dark but used as bg (bg-[var(--foreground)] that should be a light surface)
    ("bg-[var(--foreground)] text-[var(--foreground)] rounded-full mb-6", 
     "bg-[#E8F0E9] text-[#2D3A31] rounded-full mb-6"),
    ("bg-[var(--foreground)] text-[var(--foreground)] rounded-full flex-shrink-0",
     "bg-[#E8F0E9] text-[#2D3A31] rounded-full flex-shrink-0"),
    # Hero left half - ensure white background
    ('bg-[var(--background)] h-full"></div>\n          <div className="w-1/2 bg-[#E8F0E9]',
     'bg-white h-full"></div>\n          <div className="w-1/2 bg-[#E8F0E9]'),
]

def sweep_file(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    original = content
    for old, new in REPLACEMENTS:
        content = content.replace(old, new)
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  Updated: {path}")

def walk(directory, extensions=('.tsx', '.ts')):
    for root, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in ('node_modules', '.next', '.git')]
        for f in files:
            if any(f.endswith(ext) for ext in extensions):
                sweep_file(os.path.join(root, f))

walk('app')
walk('components')
print("Done.")

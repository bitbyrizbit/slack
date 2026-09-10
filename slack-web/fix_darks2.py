"""
Final sweep: fix any remaining bg-[var(--foreground)] used as backgrounds (now renders black),
and replace all dark button/input styles with light-theme equivalents.
"""
import os

REPLACEMENTS = [
    # Any bg using foreground as surface (dangerous — foreground is now #1A1A1A)
    ("bg-[var(--foreground)] text-[var(--background)]", "bg-[#2D3A31] text-white"),
    ("bg-[var(--foreground)] text-[var(--foreground)]", "bg-[#E8F0E9] text-[#2D3A31]"),
    # Dark input field
    ("bg-[#1D1F21]", "bg-[var(--muted)]"),
    ("bg-[#2A2A2D]", "bg-[var(--muted)]"),
    # Dark suggestion banners (amber was ok, but fix dark bg)
    ("bg-[#FFFBEB]/95", "bg-[#FFF8E7]/95"),
    ("text-[#92400E]", "text-[#92400E]"),  # keep amber text as-is, it's readable
    # Fix any remaining carousel foreground bg
    ("bg-[var(--foreground)] flex items-center justify-center", "bg-[#E8F0E9] flex items-center justify-center"),
    # Impact/disruption button color: sand bg with dark text
    ("bg-[var(--accent)] px-2 py-1 text-xs font-semibold text-[var(--background)]", 
     "bg-[var(--accent)] px-2 py-1 text-xs font-semibold text-[#1A1A1A]"),
    ("bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--background)]",
     "bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[#1A1A1A]"),
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
walk('hooks')
print("Done.")

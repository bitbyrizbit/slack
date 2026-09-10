"""
Sweeps the slack-web codebase and replaces hardcoded dark-theme colors
with light-theme equivalents so the site looks right on the new cream/grey/green palette.
"""
import os
import re

# Old dark colors → new light equivalents
REPLACEMENTS = [
    # Dark backgrounds that were used as surface colors
    ("#18181A", "var(--foreground)"),       # old dark bg → now used as text/icon color
    ("#222225", "var(--card)"),             # old card bg → white card
    ("#2A2A2D", "var(--muted)"),            # old muted bg → cream muted
    ("#3A3A3C", "var(--border)"),           # old border → soft border
    ("#505055", "var(--border-strong)"),    # old strong border

    # Old foreground text (sand/cream) used on dark → now needs to be dark
    ("#E6D5B8", "var(--foreground)"),       # sand text → dark text
    ("#A1998A", "var(--muted-foreground)"), # muted sand → muted text
    ("#8E887D", "var(--muted-foreground)"), # another muted

    # Dark node colors in D3 graph
    # flight node: was #18181A → use dark green
    # hotel node: was #2D3A31 → use light green surface  
    # (handled separately in useD3Graph.ts)
    
    # Carousel / landing page hardcoded darks
    ('bg-[#18181A]', 'bg-[var(--card)]'),
    ('bg-[#3A3A3C]', 'bg-[var(--muted)]'),
    ('border-[#3A3A3C]', 'border-[var(--border)]'),
    ('text-[#3A3A3C]', 'text-[var(--foreground)]'),

    # Green dark logo bg — keep as is (it's a brand element)
    # '#2D3A31' is kept in SlackLogo intentionally

    # light green surface in node colors
    # activity node white → use card
    # transfer node cream → keep
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

def walk(directory, extensions=('.tsx', '.ts', '.css')):
    for root, dirs, files in os.walk(directory):
        # Skip node_modules, .next
        dirs[:] = [d for d in dirs if d not in ('node_modules', '.next', '.git')]
        for f in files:
            if any(f.endswith(ext) for ext in extensions):
                sweep_file(os.path.join(root, f))

print("Sweeping app/...")
walk('app')
print("Sweeping components/...")
walk('components')
print("Sweeping hooks/...")
walk('hooks')
print("Done.")

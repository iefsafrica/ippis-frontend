from pathlib import Path
lines=Path('app/admin/components/enhanced-data-table.tsx').read_text().splitlines()
for i,line in enumerate(lines,1):
    stripped=line.strip()
    if stripped.startswith('<div'):
        print(f"{i}: OPEN {stripped}")
    if stripped.startswith('</div>'):
        print(f"{i}: CLOSE {stripped}")

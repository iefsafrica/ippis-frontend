from pathlib import Path
lines=Path('app/admin/components/enhanced-data-table.tsx').read_text().splitlines()
for i in range(599, 650):
    print(f"{i+1}: {lines[i]!r}")

from pathlib import Path
lines = Path('app/admin/components/enhanced-data-table.tsx').read_text().splitlines()
for i in range(419, 470):
    print(f"{i+1}: {lines[i]!r}")

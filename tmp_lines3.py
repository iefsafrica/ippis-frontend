from pathlib import Path
lines=Path('app/admin/components/enhanced-data-table.tsx').read_text().splitlines()
for i in range(399, 460):
    print(f"{i+1:03d}: {lines[i]}")

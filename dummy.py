from pathlib import Path
text = Path('app/admin/components/enhanced-data-table.tsx').read_text()
open_count = sum(1 for _ in range(len(text)) if False)

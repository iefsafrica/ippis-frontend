from pathlib import Path
text = Path('app/admin/components/enhanced-data-table.tsx').read_text()
open_count = text.count('<div')
close_count = text.count('</div>')
print('counts', open_count, close_count)

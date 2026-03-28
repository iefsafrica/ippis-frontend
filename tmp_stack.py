from pathlib import Path
text = Path('app/admin/components/enhanced-data-table.tsx').read_text().splitlines()
stack=[]
for i,line in enumerate(text,1):
    idx=0
    while True:
        next_open = line.find('<div', idx)
        next_close = line.find('</div>', idx)
        if next_close != -1 and (next_open == -1 or next_close < next_open):
            if stack:
                stack.pop()
            idx = next_close + len('</div>')
            continue
        if next_open != -1:
            end = line.find('>', next_open)
            if end == -1:
                break
            segment = line[next_open:end+1]
            if '/>' not in segment:
                stack.append((i, segment))
            idx = end + 1
            continue
        break
print('remaining', len(stack), stack)

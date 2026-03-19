from pathlib import Path
text = Path('app/register/register-form.tsx').read_text().splitlines()
for i,line in enumerate(text[:80],1):
    print(f"{i:03}: {line}")

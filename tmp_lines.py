from pathlib import Path
text = Path('app/register/register-form.tsx').read_text().splitlines()
start = 404
end = 450
for i in range(start-1,end):
    print(f"{i+1:03}: {text[i]}")

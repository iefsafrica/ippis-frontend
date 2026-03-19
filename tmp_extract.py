from pathlib import Path
text = Path('app/register/register-form.tsx').read_text()
start = text.index('useEffect(() => {')
end = start + text[start:].index('}, [initialized, registrationId]);') + len('}, [initialized, registrationId]);')
print(text[start:end])

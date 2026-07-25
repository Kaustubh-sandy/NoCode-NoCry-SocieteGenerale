# Creates a portable project-local Python environment. Use it once on each laptop.
Set-Location $PSScriptRoot

if (Get-Command python -ErrorAction SilentlyContinue) {
    & python -m venv .venv
} elseif (Get-Command py -ErrorAction SilentlyContinue) {
    & py -3 -m venv .venv
} else {
    throw "Python was not found. Install Python 3.11 or 3.12 (64-bit), select 'Add Python to PATH', then run this script again."
}

& .\.venv\Scripts\python.exe -m pip install --upgrade pip
& .\.venv\Scripts\python.exe -m pip install -r requirements.txt
Write-Host "Setup complete. Run .\start.ps1, then use python main.py train or python main.py serve."

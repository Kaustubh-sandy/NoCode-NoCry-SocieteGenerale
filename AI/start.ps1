# Run this once per PowerShell terminal opened for the AI backend.
Set-Location $PSScriptRoot
if (Test-Path .venv\Scripts\Activate.ps1) {
    & .\.venv\Scripts\Activate.ps1
} else {
    Write-Host "Virtual environment not found. Run: .\setup.ps1"
}

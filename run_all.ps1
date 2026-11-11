<#
.SYNOPSIS
    MediVision AI - Platform Launcher
    Launches AI Microservice, ASP.NET Core Backend, and React Frontend in development mode.
#>

param(
    [switch]$AIOnly,
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not $AIOnly -and -not $BackendOnly -and -not $FrontendOnly) {
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "             MEDIVISION AI ENTERPRISE PLATFORM             " -ForegroundColor White
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "1. AI Microservice:  http://localhost:8000/docs" -ForegroundColor Yellow
    Write-Host "2. C# Backend API:   http://localhost:5000/swagger" -ForegroundColor Yellow
    Write-Host "3. React SaaS Portal: http://localhost:3000" -ForegroundColor Green
    Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray

    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\ai-service'; & '.\venv\Scripts\python.exe' -m uvicorn app.main:app --port 8000 --reload"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:Path = `"`$env:Path;C:\Users\GEECON_P\.dotnet`"; Set-Location '$rootDir\backend'; dotnet run --project src/MediVision.API"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$rootDir\frontend'; npm run dev"
}
elseif ($AIOnly) {
    Set-Location "$rootDir\ai-service"
    & ".\venv\Scripts\python.exe" -m uvicorn app.main:app --port 8000 --reload
}
elseif ($BackendOnly) {
    $env:Path = "$env:Path;C:\Users\GEECON_P\.dotnet"
    Set-Location "$rootDir\backend"
    dotnet run --project src/MediVision.API
}
elseif ($FrontendOnly) {
    Set-Location "$rootDir\frontend"
    npm run dev
}


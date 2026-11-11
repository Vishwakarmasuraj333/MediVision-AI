@echo off
echo ==========================================================
echo              MEDIVISION AI ENTERPRISE PLATFORM             
echo ==========================================================
echo Starting AI Microservice (Port 8000)...
start "MediVision AI Microservice" powershell -NoExit -Command "Set-Location '%~dp0ai-service'; .\venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --reload"

echo Starting ASP.NET Core Backend (Port 5000)...
start "MediVision Backend API" powershell -NoExit -Command "$env:Path = '$env:Path;C:\Users\GEECON_P\.dotnet'; Set-Location '%~dp0backend'; dotnet run --project src/MediVision.API"

echo Starting React Frontend (Port 3000)...
start "MediVision Frontend" powershell -NoExit -Command "Set-Location '%~dp0frontend'; npm run dev"

echo All services dispatched.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000/swagger
echo AI Docs:  http://localhost:8000/docs
pause


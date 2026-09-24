@echo off
title PATRI - Localhost Launcher
color 0A

echo =====================================================================
echo           PATRI - Predictive ^& Adaptive Track Resource Intelligence
echo                    SIH 2026 Problem Statement SIH26027
echo =====================================================================
echo.
echo Starting Backend (FastAPI on http://localhost:8000)...
start "PATRI Backend (FastAPI)" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Frontend (Vite on http://localhost:5173)...
start "PATRI Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo Waiting 3 seconds for servers to initialize...
timeout /t 3 /nobreak >nul

echo Opening browser at http://localhost:5173...
start http://localhost:5173

echo.
echo =====================================================================
echo [OK] PATRI Localhost Services are now running!
echo =====================================================================
echo  - Frontend Web UI:    http://localhost:5173
echo  - Backend API Docs:   http://localhost:8000/docs
echo  - Backend Health:     http://localhost:8000/health
echo.
echo Demo Accounts (Password for all is 'admin'):
echo  - Control Officer:   control_officer / admin
echo  - System Admin:      admin / admin
echo  - Engineering:       eng_officer / admin
echo  - S&T Officer:       snt_officer / admin
echo  - Traction Officer:  trac_officer / admin
echo =====================================================================
echo.
pause

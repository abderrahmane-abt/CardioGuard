@echo off
echo.
echo  ========================================
echo    CardioGuard - Heart Disease AI
echo  ========================================
echo.
echo  Starting backend (FastAPI) on port 8000...
start "CardioGuard Backend" cmd /c "cd /d F:\Licence\ai\CardioGuard\backend && python main.py"

timeout /t 3 /nobreak > nul

echo  Starting frontend (React) on port 5173...
start "CardioGuard Frontend" cmd /c "cd /d F:\Licence\ai\CardioGuard\frontend && npm run dev"

echo.
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5173
echo.
echo  Press any key to stop both servers...
pause > nul
taskkill /fi "WINDOWTITLE eq CardioGuard Backend" > nul 2>&1
taskkill /fi "WINDOWTITLE eq CardioGuard Frontend" > nul 2>&1

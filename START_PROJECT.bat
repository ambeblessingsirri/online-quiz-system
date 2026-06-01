@echo off
title Online Quiz System - Launcher
color 0A

echo ================================================
echo   ONLINE QUIZ AND PRACTICE SYSTEM
echo   Stopping old processes...
echo ================================================

REM Kill any old node or python processes on our ports
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 /nobreak > nul

echo [1/2] Starting Flask Backend on port 5000...
start "Quiz Backend" cmd /k "cd /d "C:\Users\HAREES COMPUTERS\Desktop\online-quiz-system\backend" && python app.py"

timeout /t 6 /nobreak > nul

echo [2/2] Starting React Frontend on port 5173...
start "Quiz Frontend" cmd /k "cd /d "C:\Users\HAREES COMPUTERS\Desktop\online-quiz-system\frontend" && npm run dev"

timeout /t 8 /nobreak > nul
echo.
echo [DONE] Opening browser...
start http://localhost:5173

echo.
echo ================================================
echo   DEMO ACCOUNTS:
echo   Student:  username=student1  password=student123
echo   Teacher:  username=teacher1  password=teacher123
echo   Admin:    username=admin     password=admin123
echo ================================================
echo.
echo Close this window when done.
pause

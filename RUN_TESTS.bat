@echo off
title Quiz System - Run Tests
color 0B

echo ================================================
echo   RUNNING ALL UNIT TESTS (pytest)
echo ================================================
echo.

cd /d "C:\Users\HAREES COMPUTERS\Desktop\online-quiz-system\backend"
python -m pytest tests/ -v

echo.
echo ================================================
echo   All tests complete!
echo ================================================
pause

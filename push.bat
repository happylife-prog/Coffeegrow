@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo ===================================
echo   Coffee grow --- Auto Commit Push
echo ===================================
echo.

git status --porcelain > "%TEMP%\_gs.txt"
for %%F in ("%TEMP%\_gs.txt") do (
    if %%~zF==0 (
        echo [INFO] No changes. Nothing to do.
        pause
        exit /b 0
    )
)

git add -A
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0_autocommit.ps1"
echo.
pause
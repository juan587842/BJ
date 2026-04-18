@echo off
taskkill /F /IM node.exe 2>nul
timeout /t 3 /nobreak >nul
rmdir /s /q "%~dp0.next" 2>nul
cd /d "%~dp0"
call npm run build
pause

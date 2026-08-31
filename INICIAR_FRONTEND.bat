@echo off
title Wally Frontend (Puerto 3000)
set "PATH=C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.19.0-win-x64;%PATH%"
cd /d "C:\Wally\frontend"

echo ========================================================
echo  Liberando puerto 3000 si estaba ocupado...
echo ========================================================
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Cerrando proceso anterior en puerto 3000 PID %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo ========================================================
echo  Iniciando Wally Frontend en http://localhost:3000
echo ========================================================
call npm run dev
pause

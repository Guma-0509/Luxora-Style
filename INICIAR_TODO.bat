@echo off
title Wally Commerce Launcher
set "PATH=C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.19.0-win-x64;%PATH%"

echo ========================================================
echo  Liberando puertos 3000 y 4000 de procesos anteriores...
echo ========================================================
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Iniciando Wally Backend...
start "Wally Backend (Puerto 4000)" cmd /k "C:\Wally\INICIAR_BACKEND.bat"

timeout /t 2 /nobreak >nul

echo Iniciando Wally Frontend...
start "Wally Frontend (Puerto 3000)" cmd /k "C:\Wally\INICIAR_FRONTEND.bat"

echo.
echo ========================================================
echo  Servicios lanzados.
echo ========================================================
timeout /t 5 >nul

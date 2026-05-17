@echo off
title Iniciar SaaS ADA
cd /d "%~dp0"

echo ===================================================
echo             INICIANDO DEMO SAAS ADA
echo ===================================================
echo.

echo 1. Iniciando servidor Backend en el puerto 3001...
start "Backend - SaaS ADA" cmd /k "cd backend && node server.js"

echo.
echo 2. Iniciando servidor Frontend de React...
echo (Por favor no cierres las ventanas negras de consola)
start "Frontend - SaaS ADA" cmd /k "set BROWSER=none&& npm start"

echo.
echo ===================================================
echo Esperando a que el servidor inicie...
echo El navegador se abrira automaticamente.
echo ===================================================
timeout /t 7 /nobreak >nul
start http://localhost:3000

exit

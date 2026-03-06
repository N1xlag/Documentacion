@echo off
title Sistema de Gestion Documental - Planta
color 0A

echo =======================================================
echo    INICIANDO EL SISTEMA DOCUMENTAL (Por Nicolas M.)
echo =======================================================
echo.

:: 1. Verificamos que Node.js este instalado
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no esta instalado en esta computadora.
    echo Por favor, instala Node.js antes de continuar.
    pause
    exit
)

:: 2. Arrancar el Backend y la Base de Datos
echo [1/2] Preparando el Servidor y Base de Datos...
:: Abre una nueva terminal que instala paquetes (si faltan), sincroniza la BD y arranca el backend
start "Servidor Backend" cmd /k "cd backend && echo Instalando dependencias del servidor... && npm install && echo Sincronizando Base de Datos... && npx prisma db push && echo Iniciando Servidor... && npm start"

:: Pausa de 5 segundos para darle tiempo al backend de encender
timeout /t 5 /nobreak >nul

:: 3. Arrancar el Frontend
echo [2/2] Preparando la Interfaz de Usuario...
:: Abre otra terminal para el frontend y lo expone en la red local (--host)
start "Interfaz Frontend" cmd /k "cd frontend && echo Instalando dependencias de la interfaz... && npm install && echo Iniciando App... && npm run dev -- --host"

echo.
echo =======================================================
echo ✅ SISTEMA INICIADO CORRECTAMENTE
echo - No cierres las dos ventanas negras que se acaban de abrir.
echo - Puedes minimizar esta ventana.
echo =======================================================
pause >nul
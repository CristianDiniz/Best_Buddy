@echo off
chcp 65001 >nul
title Best Buddy - Servidor Local - Sem Docker

echo ========================================================
echo   BEST BUDDY - INICIANDO PROJETO SEM DOCKER
echo ========================================================
echo.

cd /d "%~dp0"

REM 1. Verificar se o ambiente virtual existe
if not exist "%~dp0.venv\Scripts\python.exe" (
    echo [AVISO] O ambiente virtual .venv nao foi encontrado!
    echo Executando a instalacao das dependencias primeiro...
    echo.
    call "%~dp0instalar_dependencias.bat"
    if not exist "%~dp0.venv\Scripts\python.exe" (
        echo [ERRO] Nao foi possivel encontrar o ambiente apos a instalacao.
        pause
        exit /b 1
    )
)

REM 2. Iniciar Backend Django na porta 8000 em janela separada
echo [1/2] Iniciando Backend Django em http://127.0.0.1:8000...
start "Best Buddy - Backend API" cmd /k "cd /d \"%~dp0\" && chcp 65001 >nul && title Best Buddy - Backend API && \"%~dp0.venv\Scripts\python.exe\" manage.py runserver 127.0.0.1:8000"

REM 3. Iniciar Frontend Web na porta 5500 em janela separada
echo [2/2] Iniciando Frontend Web em http://127.0.0.1:5500...
start "Best Buddy - Frontend Web" cmd /k "cd /d \"%~dp0\" && chcp 65001 >nul && title Best Buddy - Frontend Web && \"%~dp0.venv\Scripts\python.exe\" -m http.server 5500 -d \"%~dp0frontend\""

REM 4. Aguardar inicializacao e abrir o navegador
echo.
echo Abrindo o navegador em http://127.0.0.1:5500 em instantes...
timeout /t 3 /nobreak >nul 2>&1 || ping 127.0.0.1 -n 4 >nul
start http://127.0.0.1:5500

echo.
echo ========================================================
echo   SISTEMA BEST BUDDY RODANDO LOCALMENTE COM SUCESSO!
echo ========================================================
echo.
echo  - Frontend Web:  http://127.0.0.1:5500
echo  - API Django:    http://127.0.0.1:8000/api/
echo  - Painel Admin:  http://127.0.0.1:8000/admin/
echo.
echo  Credenciais de teste padrao:
echo    E-mail: usuario@bestbuddy.com
echo    Senha:  123456
echo.
echo  Duas janelas de comando foram abertas para monitorar
echo  os logs do Backend e Frontend em tempo real.
echo.
echo  Para encerrar o sistema, basta fechar as duas janelas.
echo ========================================================
echo.
pause

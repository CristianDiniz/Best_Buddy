@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Best Buddy - Orquestrador de Servicos (Modo Sem Docker)

echo =====================================================================
echo           BEST BUDDY - INICIALIZADOR DE SERVICOS LOCAIS
echo                    (Alternativa ao Docker Compose)
echo =====================================================================
echo.

:: 1. LOCALIZAR O EXECUTAVEL DO PYTHON
set "PYTHON_CMD="

:: Testa se o comando python padrao funciona e e versao >= 3.10
python -c "import sys; assert sys.version_info >= (3, 10)" >nul 2>&1
if not errorlevel 1 (
    set "PYTHON_CMD=python"
    goto python_ok
)

:: Verifica diretorios padrao de instalacao do Python 3.12 / 3.11 / 3.10
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    set "PYTHON_CMD=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    set "PATH=%LOCALAPPDATA%\Programs\Python\Python312;%LOCALAPPDATA%\Programs\Python\Python312\Scripts;!PATH!"
    goto python_ok
)
if exist "%ProgramFiles%\Python312\python.exe" (
    set "PYTHON_CMD=%ProgramFiles%\Python312\python.exe"
    set "PATH=%ProgramFiles%\Python312;%ProgramFiles%\Python312\Scripts;!PATH!"
    goto python_ok
)
if exist "%SystemDrive%\Python312\python.exe" (
    set "PYTHON_CMD=%SystemDrive%\Python312\python.exe"
    set "PATH=%SystemDrive%\Python312;%SystemDrive%\Python312\Scripts;!PATH!"
    goto python_ok
)

:: Testa Launcher py
py -3.12 -c "import sys" >nul 2>&1
if not errorlevel 1 (
    set "PYTHON_CMD=py -3.12"
    goto python_ok
)
py -c "import sys; assert sys.version_info >= (3, 10)" >nul 2>&1
if not errorlevel 1 (
    set "PYTHON_CMD=py"
    goto python_ok
)

:: -------------------------------------------------------------
:: SE NAO ENCONTROU: FORCAR A INSTALACAO AUTOMATICA DO PYTHON 3.12
:: -------------------------------------------------------------
echo =====================================================================
echo [!] Python 3.12 nao foi detectado nesta maquina.
echo [*] Iniciando instalacao automatica do Python 3.12...
echo =====================================================================
echo.

set "INSTALLED=0"

:: Metodo A: Tentar instalacao via winget
where winget >nul 2>&1
if not errorlevel 1 (
    echo [*] Tentando instalar via winget...
    winget install --id Python.Python.3.12 -e --accept-source-agreements --accept-package-agreements --scope user --override "/quiet InstallAllUsers=0 PrependPath=1 Include_test=0"
    if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" set "INSTALLED=1"
)

:: Metodo B: Se winget nao instalou, baixar instalador oficial direto do python.org via PowerShell
if "!INSTALLED!"=="0" (
    echo [*] Baixando instalador oficial do Python 3.12 de python.org...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $inst = Join-Path $env:TEMP 'python-3.12.10-amd64.exe'; Write-Host '[*] Fazendo download de python-3.12.10-amd64.exe...'; (New-Object System.Net.WebClient).DownloadFile('https://www.python.org/ftp/python/3.12.10/python-3.12.10-amd64.exe', $inst); Write-Host '[*] Executando instalacao silenciosa...'; Start-Process -FilePath $inst -ArgumentList '/quiet InstallAllUsers=0 PrependPath=1 Include_test=0' -Wait; Remove-Item $inst -Force -ErrorAction SilentlyContinue"
)

:: Reavaliar se o executavel passou a existir
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    set "PYTHON_CMD=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    set "PATH=%LOCALAPPDATA%\Programs\Python\Python312;%LOCALAPPDATA%\Programs\Python\Python312\Scripts;!PATH!"
    goto python_installed_ok
)
if exist "%ProgramFiles%\Python312\python.exe" (
    set "PYTHON_CMD=%ProgramFiles%\Python312\python.exe"
    set "PATH=%ProgramFiles%\Python312;%ProgramFiles%\Python312\Scripts;!PATH!"
    goto python_installed_ok
)

:: Ultima tentativa pelo PATH atualizado
for /f "tokens=*" %%p in ('where python 2^>nul') do (
    set "PYTHON_CMD=%%p"
    goto python_installed_ok
)

echo.
echo [ERRO] Nao foi possivel instalar o Python automaticamente nesta maquina.
echo        Por favor, baixe e instale o Python 3.12 manualmente em:
echo        https://www.python.org/downloads/
echo        (Lembre-se de marcar a opcao 'Add python.exe to PATH' no instalador)
echo.
pause
exit /b 1

:python_installed_ok
echo.
echo [+] Python 3.12 instalado e configurado com sucesso!
echo.

:python_ok
for /f "tokens=*" %%v in ('%PYTHON_CMD% --version 2^>^&1') do set "PY_VER=%%v"
echo [+] %PY_VER% localizado com sucesso.

:: 2. VERIFICAR/CRIAR AMBIENTE VIRTUAL (VENV)
if exist "%~dp0venv\Scripts\activate.bat" goto venv_exists
echo [*] [1/5] Criando ambiente virtual isolado [venv]...
"%PYTHON_CMD%" -m venv "%~dp0venv"
if errorlevel 1 (
    echo [ERRO] Falha ao criar o ambiente virtual venv.
    pause
    exit /b 1
)
echo [+] Ambiente virtual venv criado com sucesso!
goto venv_ready

:venv_exists
echo [+] [1/5] Ambiente virtual venv detectado.

:venv_ready
call "%~dp0venv\Scripts\activate.bat"

:: 3. VERIFICAR/INSTALAR DEPENDENCIAS (PIP)
python -c "import django, onnxruntime" >nul 2>&1
if not errorlevel 1 goto deps_ready
echo [*] [2/5] Instalando dependencias do requirements.txt...
pip install -r "%~dp0requirements.txt"
if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias do requirements.txt.
    pause
    exit /b 1
)
echo [+] Dependencias instaladas com sucesso!
goto deps_done

:deps_ready
echo [+] [2/5] Dependencias Django, DRF e ONNX Runtime prontas.

:deps_done

:: 4. VERIFICAR SERVICO DO BANCO DE DADOS (MYSQL / SQLITE)
echo [*] [3/5] Verificando servico do banco de dados...
sc query MySQL80 >nul 2>&1
if errorlevel 1 (
    echo [*] Servico MySQL80 nao encontrado. Usando SQLite local.
    goto db_check_done
)

sc query MySQL80 | findstr /I "RUNNING" >nul 2>&1
if not errorlevel 1 (
    echo [+] Servico MySQL80 esta ATIVO e em execucao.
    goto db_check_done
)

echo [*] Servico MySQL80 esta instalado mas parado. Tentando iniciar...
net start MySQL80 >nul 2>&1
sc query MySQL80 | findstr /I "RUNNING" >nul 2>&1
if not errorlevel 1 (
    echo [+] Servico MySQL80 iniciado com sucesso.
) else (
    echo [!] Servico MySQL80 nao pode ser iniciado automaticamente.
    echo     Usando configuracao do .env.
)

:db_check_done

:: 5. MIGRAR O BANCO DE DADOS
echo [*] [4/5] Verificando e aplicando migracoes do Django...
python manage.py makemigrations --noinput
python manage.py migrate --noinput
if errorlevel 1 (
    echo [ERRO] Falha ao executar as migracoes do banco.
    pause
    exit /b 1
)
echo [+] Migracoes aplicadas com sucesso.

:: 6. SEED DE DADOS (SE NECESSARIO)
if not exist "%~dp0seed_data.py" goto seed_done
python -c "import django, os; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings'); django.setup(); from usuarios.models import Usuario; exit(0 if Usuario.objects.exists() else 1)" >nul 2>&1
if not errorlevel 1 (
    echo [+] Banco ja contem dados cadastrados.
    goto seed_done
)

echo [*] Banco inicial detectado. Populando dados de teste via seed_data.py...
python seed_data.py

:seed_done

:: 7. LIBERAR PORTAS ANTERIORES SE ESTIVEREM OCUPADAS
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000, 5500 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" >nul 2>&1

:: 8. SUBIR OS SERVICOS EM JANELAS INDEPENDENTES
echo [*] [5/5] Inicializando os servicos...

:: Backend API na porta 8000
start "Best Buddy - Backend API (Porta 8000)" cmd /k "title Best Buddy - Backend API (Porta 8000) && cd /d "%~dp0" && call venv\Scripts\activate.bat && python manage.py runserver 127.0.0.1:8000"

:: Frontend na porta 5500 (com No-Cache headers ativados)
start "Best Buddy - Frontend (Porta 5500)" cmd /k "title Best Buddy - Frontend (Porta 5500) && cd /d "%~dp0frontend" && call ..\venv\Scripts\activate.bat && python server.py 5500"

:: 9. ABRIR O NAVEGADOR
ping 127.0.0.1 -n 4 >nul
start http://localhost:5500

cls
echo =====================================================================
echo         BEST BUDDY - SERVICOS EM EXECUCAO COM SUCESSO!
echo =====================================================================
echo.
echo   [+] Frontend (App Web):      http://localhost:5500/
echo   [+] Backend API (Django):    http://127.0.0.1:8000/api/
echo   [+] Painel Administrativo:   http://127.0.0.1:8000/admin/
echo.
echo   Credenciais padrao:
echo   - Email: usuario@bestbuddy.com
echo   - Senha: 123456
echo.
echo ---------------------------------------------------------------------
echo   * Cada servico esta rodando em sua propria janela do prompt.
echo   * Para parar todos os servicos e liberar as portas, execute:
echo        stop.bat
echo =====================================================================
echo.
pause

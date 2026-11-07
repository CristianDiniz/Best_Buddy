@echo off
chcp 65001 >nul
title Best Buddy - Instalacao de Dependencias - Sem Docker

echo ========================================================
echo   BEST BUDDY - INSTALACAO DE DEPENDENCIAS - MODO LOCAL
echo ========================================================
echo.
cd /d "%~dp0"

REM 1. Verificar instalacao do Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Python nao foi encontrado no sistema ou nao esta no PATH.
    echo Por favor, instale o Python 3.10+ com a opcao Add Python to PATH e tente novamente.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set PYTHON_VER=%%i
echo [INFO] Detectado: %PYTHON_VER%
echo.

REM 2. Criar ambiente virtual se nao existir
if not exist ".venv" (
    echo [1/4] Criando ambiente virtual Python .venv...
    python -m venv .venv
    if errorlevel 1 (
        echo [ERRO] Falha ao criar o ambiente virtual.
        pause
        exit /b 1
    )
    echo [OK] Ambiente virtual criado com sucesso!
) else (
    echo [1/4] Ambiente virtual .venv ja existe. Prosseguindo...
)
echo.

REM 3. Ativar ambiente virtual
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ERRO] Falha ao ativar o ambiente virtual .venv.
    pause
    exit /b 1
)

REM 4. Atualizar pip e instalar dependencias do requirements.txt
echo [2/4] Instalando dependencias a partir do requirements.txt...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo [AVISO] Falha ao instalar dependencias nativas.
    echo Instalando as dependencias compativeis para modo SQLite...
    python -m pip install "Django==6.0.6" "djangorestframework==3.16.0" "djangorestframework-simplejwt==5.5.0" "django-cors-headers==4.7.0" "python-dotenv>=1.0.0" "Pillow>=10.0.0" "asgiref==3.11.1" "sqlparse==0.5.5"
)
echo.
echo [OK] Dependencias instaladas com sucesso!
echo.

REM 5. Aplicar migracoes no banco SQLite local
echo [3/4] Aplicando migracoes do banco de dados no SQLite local...
python manage.py migrate
if errorlevel 1 (
    echo [ERRO] Falha ao aplicar as migracoes no banco de dados.
    pause
    exit /b 1
)
echo.
echo [OK] Migracoes aplicadas!
echo.

REM 6. Executar carga inicial de dados
echo [4/4] Inserindo dados iniciais de teste - seed...
python seed_data.py
if errorlevel 1 (
    echo [AVISO] Ocorreu uma inconsistencia no seed, continuando...
) else (
    echo.
    echo [OK] Dados de teste carregados com sucesso!
)
echo.

echo ========================================================
echo   INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================================
echo.
echo Para iniciar os servidores Backend e Frontend sem Docker:
echo   - Execute o arquivo: iniciar_sem_docker.bat
echo.
pause

@echo off
echo 🔗 ========================================
echo 🧪 TESTE QR CODES REAIS - SOFIA IA
echo 🔗 ========================================
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado! Instale Node.js primeiro.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado: 
node --version

echo.
echo 🔌 Verificando se o backend está rodando...
echo.

REM Verificar se o servidor está online
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo ❌ Backend não está rodando!
    echo.
    echo 💡 Iniciando backend automaticamente...
    echo.
    
    REM Tentar iniciar o backend
    cd backend
    start "Sofia IA Backend" cmd /k "npm start"
    cd ..
    
    echo ⏱️ Aguardando backend inicializar (15 segundos)...
    timeout /t 15 /nobreak >nul
    
    REM Verificar novamente
    curl -s http://localhost:8000/health >nul 2>&1
    if errorlevel 1 (
        echo ❌ Falha ao iniciar backend automaticamente!
        echo 💡 Execute manualmente: cd backend && npm start
        pause
        exit /b 1
    )
)

echo ✅ Backend está online!
echo.

echo 🧪 Executando testes de QR Codes...
echo.

REM Executar testes
node TESTE-QR-CODES-REAIS.js

if errorlevel 1 (
    echo.
    echo ❌ Alguns testes falharam!
    echo 📋 Verifique os detalhes acima
) else (
    echo.
    echo ✅ Todos os testes passaram!
    echo 🎉 Sistema de QR Codes funcionando perfeitamente!
)

echo.
echo 📊 Resultados salvos em: qrcode-test-results.json
echo.

REM Abrir arquivo de resultados se existir
if exist qrcode-test-results.json (
    echo 👀 Deseja abrir os resultados detalhados? (S/N)
    set /p choice="Escolha: "
    if /i "%choice%"=="S" (
        start notepad qrcode-test-results.json
    )
)

echo.
echo 🔗 ========================================
echo 🏁 TESTE CONCLUÍDO
echo 🔗 ========================================
pause

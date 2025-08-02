@echo off
echo ========================================
echo 🔧 SOFIA IA - CONFIGURAR REMOTE GITHUB
echo ========================================
echo.

echo 📍 Repositorios existentes encontrados:
echo 1. sofia-ia-backend (Publico) - Atualizado 2 dias
echo 2. sofia-ai-lux-dash (Privado) - Atualizado 3 dias  
echo 3. sofia-ia-landing-premium-80 (Privado) - Atualizado 3 dias
echo.

echo 🎯 Configurando remote para: sofia-ia-backend
echo.

cd /d "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\Sofia IA"

echo 📋 Removendo remote antigo...
git remote remove origin

echo 🔗 Adicionando remote correto...
git remote add origin https://github.com/JeanZorzetti/sofia-ia-backend.git

echo 📊 Verificando configuracao...
git remote -v

echo.
echo 🚀 Fazendo push...
git branch -M main
git push -u origin main

echo.
echo ========================================
echo ✅ CONFIGURACAO CONCLUIDA!
echo ========================================
echo.
echo 📁 Repositorio: https://github.com/JeanZorzetti/sofia-ia-backend
echo 🎯 Branch: main
echo 📊 Status: Sincronizado
echo.
echo Proximo passo: Deploy EasyPanel
echo.
pause
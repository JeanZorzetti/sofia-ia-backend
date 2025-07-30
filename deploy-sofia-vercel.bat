@echo off
echo 🚀 DEPLOY SOFIA IA - VERCEL

echo.
echo ⏳ Navegando para o projeto...
cd "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\LAIS IA\frontend\sofia-ia-landing-premium-80-main\sofia-ia-landing-premium-80-main"

echo.
echo 📦 Instalando Vercel CLI...
npm install -g vercel

echo.
echo 🔨 Gerando build de produção...
npm run build

echo.
echo 🚀 Fazendo deploy...
vercel --prod

echo.
echo ✅ Deploy concluído!
echo 🌐 Agora configure o domínio custom no dashboard do Vercel
echo 📋 URL: https://vercel.com/dashboard
echo 🎯 Adicione: sofiaia.roilabs.com.br

pause
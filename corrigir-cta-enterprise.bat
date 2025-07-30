@echo off
echo 🎯 CORRIGINDO CTA ENTERPRISE - SOFIA IA

echo.
echo ⏳ Navegando para o projeto...
cd "C:\Users\jeanz\OneDrive\Desktop\ROI Labs\Imob\LAIS IA\frontend\sofia-ia-landing-premium-80-main\sofia-ia-landing-premium-80-main"

echo.
echo 🔨 Build com CTA corrigido...
npm run build

echo.
echo 🚀 Deploy da correção...
vercel --prod

echo.
echo ✅ CTA ENTERPRISE CORRIGIDO!
echo 👑 Novo texto: "Ativar plano enterprise"
echo 🌐 Teste: https://sofia-ia.vercel.app/

pause
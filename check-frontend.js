/**
 * 🔍 VERIFICAR SE FRONTEND ESTÁ RODANDO
 */

const http = require('http');

function checkPort(port) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}`, (res) => {
            console.log(`✅ FRONTEND ATIVO na porta ${port}`);
            console.log(`🌐 Acesse: http://localhost:${port}`);
            resolve(true);
        });
        
        req.on('error', () => {
            console.log(`❌ Porta ${port} não está ativa`);
            resolve(false);
        });
        
        req.setTimeout(1000, () => {
            req.destroy();
            console.log(`⏰ Timeout na porta ${port}`);
            resolve(false);
        });
    });
}

async function checkFrontend() {
    console.log('🔍 VERIFICANDO FRONTEND...');
    console.log('==========================');
    
    const ports = [5173, 3000, 8080];
    
    for (const port of ports) {
        const active = await checkPort(port);
        if (active) {
            console.log(`\n🎯 PRÓXIMO PASSO:`);
            console.log(`Abra o navegador em http://localhost:${port}`);
            console.log(`e verifique se os dados dinâmicos estão carregando`);
            return;
        }
    }
    
    console.log('\n⚠️  FRONTEND NÃO ENCONTRADO');
    console.log('Execute: npm run dev no diretório do frontend');
}

checkFrontend();
// 🧪 TESTE N8N WEBHOOK + CLAUDE SCORING

const https = require('https');

// Simular scoring
function calculateLeadScore(message, senderName) {
    let score = 30; // Base score
    
    // Tem nome = +20
    if (senderName && senderName !== 'null') {
        score += 20;
    }
    
    // Palavras-chave importantes = +10 cada
    const keyWords = [
        'apartamento', 'casa', 'imóvel', 'comprar', 'vender',
        'orçamento', 'financiamento', 'corretor', 'visita',
        'interessado', 'preciso', 'quero', 'gostaria'
    ];
    
    const messageWords = message.toLowerCase();
    keyWords.forEach(word => {
        if (messageWords.includes(word)) {
            score += 10;
        }
    });
    
    return Math.min(score, 100);
}

// Teste 1: Mensagem com score alto
const message1 = "Oi, preciso de um apartamento de 2 quartos, orçamento até 500 mil, gostaria de visita hoje";
const score1 = calculateLeadScore(message1, "João Silva");
console.log(`\n🧪 TESTE 1:`);
console.log(`Mensagem: "${message1}"`);
console.log(`Nome: João Silva`);
console.log(`Score: ${score1}/100`);
console.log(`Auto-envio CRM: ${score1 >= 70 ? 'SIM ✅' : 'NÃO ❌'}`);

// Teste 2: Mensagem com score baixo
const message2 = "oi";
const score2 = calculateLeadScore(message2, null);
console.log(`\n🧪 TESTE 2:`);
console.log(`Mensagem: "${message2}"`);
console.log(`Nome: null`);
console.log(`Score: ${score2}/100`);
console.log(`Auto-envio CRM: ${score2 >= 70 ? 'SIM ✅' : 'NÃO ❌'}`);

// Teste 3: N8N Webhook (se score1 >= 70)
if (score1 >= 70) {
    console.log(`\n🔄 TESTE 3: Enviando para N8N...`);
    
    const leadData = {
        name: "João Silva",
        phone: "11999887766",
        email: "11999887766@whatsapp.com",
        source: 'LAIS IA WhatsApp Auto',
        qualification_score: score1,
        original_message: message1,
        created_at: new Date().toISOString(),
        notes: `Lead AUTO-qualificado via LAIS IA - Score: ${score1}/100`
    };

    const payload = JSON.stringify(leadData);
    
    const options = {
        hostname: 'n8n.roilabs.com.br',
        port: 443,
        path: '/webhook/lais-lead-qualified',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
            console.log(`📊 Status N8N: ${res.statusCode}`);
            console.log(`📤 Response: ${responseData}`);
            if (res.statusCode === 200) {
                console.log('✅ Webhook N8N funcionando!');
            } else {
                console.log('❌ Erro no webhook N8N');
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Erro de conexão N8N:', error.message);
    });

    req.write(payload);
    req.end();
} else {
    console.log(`\n⏭️ TESTE 3: Pulado (score ${score1} < 70)`);
}

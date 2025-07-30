    /**
     * Enviar mensagem via Evolution API
     */
    async sendWhatsAppMessage(phone, message, instanceName = 'Demo_Food') {
        const evolutionUrl = process.env.EVOLUTION_API_URL || 'https://evolutionapi.roilabs.com.br';
        const apiKey = process.env.EVOLUTION_API_KEY || 'SuOOmamlmXs4NV3nkxpHAy7z3rcurbIz';
        
        try {
            const payload = JSON.stringify({
                number: phone,
                textMessage: {
                    text: message
                }
            });
            
            const options = {
                hostname: 'evolutionapi.roilabs.com.br',
                port: 443,
                path: `/message/sendText/${instanceName}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': apiKey,
                    'Content-Length': Buffer.byteLength(payload)
                }
            };

            return new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let responseData = '';

                    res.on('data', (chunk) => {
                        responseData += chunk;
                    });

                    res.on('end', () => {
                        if (res.statusCode === 200 || res.statusCode === 201) {
                            logger.info('✅ WhatsApp message sent successfully', {
                                phone,
                                messagePreview: message.substring(0, 50) + '...'
                            });
                            resolve({ success: true, data: responseData });
                        } else {
                            reject(new Error(`Evolution API Error: ${res.statusCode} - ${responseData}`));
                        }
                    });
                });

                req.on('error', (error) => {
                    logger.error('❌ Error sending WhatsApp message:', error.message);
                    reject(error);
                });

                req.write(payload);
                req.end();
            });

        } catch (error) {
            logger.error('❌ WhatsApp send error:', error.message);
            throw error;
        }
    }
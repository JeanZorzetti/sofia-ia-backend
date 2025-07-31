import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEvolutionAPI } from '@/hooks/useApiLaisIA';
import { 
  QrCode, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Smartphone,
  Plus,
  Link,
  User
} from 'lucide-react';

interface ExistingInstance {
  instanceName: string;
  status: string;
  profileName?: string;
  number?: string;
  connectionStatus?: string;
}

interface WhatsAppQRCodeProps {
  onInstanceConnected?: (instance: any) => void;
  onClose: () => void;
}

export const WhatsAppQRCode: React.FC<WhatsAppQRCodeProps> = ({ 
  onInstanceConnected, 
  onClose 
}) => {
  const [step, setStep] = useState<'choose' | 'existing' | 'new' | 'qrcode' | 'connected'>('choose');
  const [existingInstances, setExistingInstances] = useState<ExistingInstance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<ExistingInstance | null>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionTimer, setConnectionTimer] = useState(0);

  const evolutionAPI = useEvolutionAPI();

  // Buscar instâncias existentes
  const fetchExistingInstances = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await evolutionAPI.get('/instance/fetchInstances');
      
      if (Array.isArray(response)) {
        const instances = response.map(item => ({
          instanceName: item.instance?.instanceName || item.instanceName,
          status: item.connectionStatus || item.status || 'unknown',
          profileName: item.instance?.profileName || item.profileName,
          number: item.instance?.number || item.number,
          connectionStatus: item.connectionStatus
        }));
        
        setExistingInstances(instances);
        
        // Se há instâncias conectadas, mostrar opções
        if (instances.length > 0) {
          setStep('choose');
        } else {
          setStep('new');
        }
      }

    } catch (err) {
      console.error('Erro ao buscar instâncias:', err);
      setError('Erro ao verificar instâncias existentes');
      setStep('new'); // Fallback para criar nova instância
    } finally {
      setLoading(false);
    }
  };

  // Usar instância existente
  const useExistingInstance = (instance: ExistingInstance) => {
    setSelectedInstance(instance);
    
    if (instance.status === 'open' || instance.connectionStatus === 'open') {
      // Já conectada
      setStep('connected');
      if (onInstanceConnected) {
        onInstanceConnected({
          instanceName: instance.instanceName,
          status: 'connected',
          phone: instance.number,
          profileName: instance.profileName
        });
      }
    } else {
      // Precisa reconectar
      reconnectInstance(instance);
    }
  };

  // Reconectar instância existente
  const reconnectInstance = async (instance: ExistingInstance) => {
    try {
      setLoading(true);
      setError(null);
      setStep('qrcode');

      console.log('Reconectando instância:', instance.instanceName);

      const response = await evolutionAPI.get(`/instance/connect/${instance.instanceName}`);
      
      if (response.base64) {
        setQrCode(response.base64);
        startStatusMonitoring(instance.instanceName);
      } else if (response.error) {
        throw new Error(response.error);
      }

    } catch (err) {
      console.error('Erro ao reconectar instância:', err);
      setError(err instanceof Error ? err.message : 'Erro ao reconectar instância');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova instância
  const createNewInstance = async () => {
    try {
      setLoading(true);
      setError(null);
      setStep('new');

      const newInstanceName = `lais_ia_${Date.now()}`;
      
      const instanceData = {
        instanceName: newInstanceName,
        token: evolutionAPI.config.evolutionApiKey,
        qrcode: true,
        number: '',
        webhook: `${evolutionAPI.config.baseUrl}/webhooks/whatsapp`,
        webhookByEvents: true
      };

      const response = await evolutionAPI.post('/instance/create', instanceData);
      
      console.log('Nova instância criada:', response);

      // Aguardar e buscar QR Code
      setTimeout(() => {
        fetchQRCodeForInstance(newInstanceName);
      }, 2000);

    } catch (err) {
      console.error('Erro ao criar nova instância:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar nova instância');
    } finally {
      setLoading(false);
    }
  };

  // Buscar QR Code para instância específica
  const fetchQRCodeForInstance = async (instanceName: string) => {
    try {
      setStep('qrcode');
      
      const response = await evolutionAPI.get(`/instance/connect/${instanceName}`);
      
      if (response.base64) {
        setQrCode(response.base64);
        startStatusMonitoring(instanceName);
      } else if (response.error) {
        throw new Error(response.error);
      }

    } catch (err) {
      console.error('Erro ao buscar QR Code:', err);
      setError(err instanceof Error ? err.message : 'Erro ao gerar QR Code');
    }
  };

  // Monitorar status da instância
  const startStatusMonitoring = (instanceName: string) => {
    let attempts = 0;
    const maxAttempts = 150; // 5 minutos

    const interval = setInterval(async () => {
      attempts++;
      setConnectionTimer(attempts * 2);

      try {
        const response = await evolutionAPI.get(`/instance/fetchInstances?instanceName=${instanceName}`);
        
        if (response && Array.isArray(response) && response.length > 0) {
          const instanceData = response[0];
          
          if (instanceData.connectionStatus === 'open') {
            clearInterval(interval);
            setStep('connected');
            
            if (onInstanceConnected) {
              onInstanceConnected({
                instanceName: instanceName,
                status: 'connected',
                phone: instanceData.instance?.number,
                profileName: instanceData.instance?.profileName
              });
            }
            return;
          }
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setError('Tempo limite para conexão excedido (5 minutos)');
        }
      } catch (err) {
        console.error('Erro ao verificar status:', err);
      }
    }, 2000);
  };

  // Renovar QR Code
  const refreshQRCode = () => {
    setConnectionTimer(0);
    setError(null);
    
    if (selectedInstance) {
      fetchQRCodeForInstance(selectedInstance.instanceName);
    }
  };

  // Inicializar
  useEffect(() => {
    fetchExistingInstances();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'close': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Conectado';
      case 'close': return 'Desconectado';
      default: return 'Status desconhecido';
    }
  };

  // Render baseado no step atual
  const renderContent = () => {
    switch (step) {
      case 'choose':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-light text-foreground">
                Instâncias WhatsApp Encontradas
              </h3>
              <p className="text-sm text-foreground-secondary">
                Escolha uma opção abaixo:
              </p>
            </div>

            <div className="space-y-3">
              {existingInstances.map((instance, index) => (
                <div 
                  key={index}
                  className="bg-background-secondary rounded-card p-4 border border-glass-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        instance.status === 'open' ? 'bg-green-500' : 'bg-gray-500'
                      }`}>
                        <Smartphone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{instance.instanceName}</p>
                        {instance.profileName && (
                          <p className="text-sm text-foreground-secondary">
                            👤 {instance.profileName}
                          </p>
                        )}
                        {instance.number && (
                          <p className="text-xs text-foreground-tertiary">
                            📱 {instance.number}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(instance.status)}>
                        {getStatusText(instance.status)}
                      </Badge>
                      <Button 
                        size="sm"
                        onClick={() => useExistingInstance(instance)}
                        className="button-luxury"
                      >
                        <Link className="h-4 w-4 mr-2" />
                        Usar Esta
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-glass-border pt-4">
              <Button 
                className="w-full"
                variant="outline"
                onClick={() => setStep('new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ou Criar Nova Instância
              </Button>
            </div>
          </div>
        );

      case 'new':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-light text-foreground">
                Criar Nova Instância WhatsApp
              </h3>
              <p className="text-sm text-foreground-secondary">
                Uma nova instância será criada e conectada
              </p>
            </div>

            <div className="flex space-x-3">
              <Button 
                className="flex-1 button-luxury"
                onClick={createNewInstance}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Criar Nova Instância
              </Button>
              <Button 
                variant="outline"
                onClick={() => setStep('choose')}
              >
                Voltar
              </Button>
            </div>
          </div>
        );

      case 'qrcode':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-light text-foreground">
                Escaneie o QR Code
              </h3>
              <p className="text-sm text-foreground-secondary">
                {selectedInstance ? `Conectando: ${selectedInstance.instanceName}` : 'Nova instância'}
              </p>
            </div>

            {qrCode && (
              <div className="aspect-square bg-white rounded-card p-4 flex items-center justify-center">
                <img 
                  src={`data:image/png;base64,${qrCode}`}
                  alt="QR Code WhatsApp"
                  className="w-full h-full object-contain rounded"
                />
              </div>
            )}

            <div className="text-center space-y-2">
              <p className="text-sm text-foreground-secondary">
                ⏱️ Tempo: {Math.floor(connectionTimer / 60)}min {(connectionTimer % 60)}s
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshQRCode}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Renovar QR Code
              </Button>
            </div>

            <div className="bg-background-secondary rounded-card p-4">
              <h4 className="text-sm font-medium text-foreground mb-3">
                📱 Como conectar:
              </h4>
              <div className="space-y-2 text-sm text-foreground-secondary">
                <p>1. Abra o WhatsApp no seu celular</p>
                <p>2. Vá em Configurações → Aparelhos conectados</p>
                <p>3. Toque em "Conectar um aparelho"</p>
                <p>4. Escaneie este código QR</p>
              </div>
            </div>
          </div>
        );

      case 'connected':
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            
            <div>
              <h3 className="text-lg font-light text-foreground mb-2">
                🎉 WhatsApp Conectado!
              </h3>
              {selectedInstance && (
                <div className="space-y-1">
                  <p className="text-foreground-secondary">
                    📱 {selectedInstance.instanceName}
                  </p>
                  {selectedInstance.profileName && (
                    <p className="text-foreground-tertiary text-sm">
                      👤 {selectedInstance.profileName}
                    </p>
                  )}
                </div>
              )}
              <p className="text-xs text-green-400 mt-3">
                ✅ Sofia IA já está funcionando automaticamente
              </p>
            </div>

            <Button className="w-full button-luxury" onClick={onClose}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar Configuração
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="glass-card w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-foreground font-light tracking-wider-sofia">
            WhatsApp - SOFIA IA
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Erro */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-card p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div>
                  <p className="text-red-400 text-sm font-medium">Erro</p>
                  <p className="text-red-300 text-xs">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading inicial */}
          {loading && step === 'choose' && (
            <div className="flex flex-col items-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />
              <p className="text-foreground-secondary">
                Verificando instâncias WhatsApp...
              </p>
            </div>
          )}

          {/* Conteúdo baseado no step */}
          {!loading || step !== 'choose' ? renderContent() : null}

          {/* Botões inferiores */}
          {step !== 'connected' && step !== 'choose' && (
            <div className="flex space-x-3 pt-4 border-t border-glass-border">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={onClose}
              >
                Cancelar
              </Button>
              {error && step !== 'new' && (
                <Button 
                  className="flex-1 button-luxury"
                  onClick={() => {
                    setError(null);
                    setStep('choose');
                    fetchExistingInstances();
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
              )}
            </div>
          )}

          {/* Info Técnica (Desenvolvimento) */}
          {import.meta.env.DEV && (
            <div className="text-center pt-4 border-t border-glass-border/50">
              <details className="text-xs text-foreground-tertiary">
                <summary className="cursor-pointer hover:text-foreground-secondary">
                  Informações Técnicas
                </summary>
                <div className="mt-2 space-y-1">
                  <p>Evolution API: {evolutionAPI.config.evolutionApiUrl}</p>
                  <p>Instâncias encontradas: {existingInstances.length}</p>
                  <p>Step atual: {step}</p>
                </div>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
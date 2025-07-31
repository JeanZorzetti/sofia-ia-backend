import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WhatsAppQRCode } from '../WhatsAppQRCode';
import { useWhatsAppData, useApiLaisIA } from '@/hooks/useApiLaisIA';
import { 
  MessageSquare, 
  QrCode, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  Smartphone,
  Users,
  Clock,
  RefreshCw,
  Trash2,
  Info
} from 'lucide-react';

interface WhatsAppInstance {
  id: string;
  name: string;
  phone?: string;
  status: 'connected' | 'disconnected' | 'connecting';
  lastActivity?: string;
  messagesCount: number;
  profileName?: string;
}

export const WhatsAppTab = () => {
  const [showQR, setShowQR] = useState(false);
  const { instances, stats, loading, error, refetch } = useWhatsAppData();
  const api = useApiLaisIA();

  // Callback quando instância é conectada
  const handleInstanceConnected = (instance: any) => {
    console.log('✅ Nova instância WhatsApp conectada:', instance);
    
    // Recarregar dados após conexão
    setTimeout(() => {
      refetch();
    }, 2000);
    
    setShowQR(false);
  };

  // Reconectar instância
  const reconnectInstance = async (instanceId: string) => {
    try {
      await api.post(`/api/whatsapp/reconnect/${instanceId}`);
      
      // Atualizar dados
      setTimeout(refetch, 3000);
      
    } catch (err) {
      console.error('Erro ao reconectar instância:', err);
    }
  };

  // Desconectar instância
  const disconnectInstance = async (instanceId: string) => {
    try {
      await api.post(`/api/whatsapp/disconnect/${instanceId}`);
      
      // Atualizar dados
      setTimeout(refetch, 2000);
      
    } catch (err) {
      console.error('Erro ao desconectar instância:', err);
    }
  };

  // Remover instância
  const removeInstance = async (instanceId: string) => {
    if (!confirm('⚠️ Tem certeza que deseja remover esta instância?\n\nEsta ação não pode ser desfeita e todas as conversas serão perdidas.')) {
      return;
    }

    try {
      await api.delete(`/api/whatsapp/delete/${instanceId}`);
      
      // Atualizar dados
      refetch();
      
    } catch (err) {
      console.error('Erro ao remover instância:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'disconnected': return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'connecting': return <RefreshCw className="h-4 w-4 text-yellow-400 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'disconnected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'connecting': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'disconnected': return 'Desconectado';
      case 'connecting': return 'Conectando...';
      default: return 'Aguardando';
    }
  };

  if (loading && (!instances || instances.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <RefreshCw className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-foreground-secondary">Carregando instâncias WhatsApp...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="text-foreground">WhatsApp SOFIA IA</h2>
          <p className="text-foreground-secondary">
            Conecte e gerencie suas instâncias do WhatsApp com IA integrada
          </p>
        </div>

        {/* Status Alert */}
        {error && (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-blue-400 text-sm font-medium">Modo Demonstração</p>
                  <p className="text-blue-300 text-xs">{error}</p>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={refetch}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Reconectar API
              </Button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex justify-between items-center">
          <Button className="button-luxury" onClick={() => setShowQR(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Instância WhatsApp
          </Button>
          
          <div className="flex items-center space-x-4 text-sm text-foreground-secondary">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>{stats.connectedInstances} Conectado{stats.connectedInstances !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span>{stats.disconnectedInstances} Desconectado{stats.disconnectedInstances !== 1 ? 's' : ''}</span>
            </div>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={refetch}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground-secondary text-sm">Mensagens Hoje</p>
                  <p className="text-2xl font-extralight text-foreground">{stats.totalMessages.toLocaleString()}</p>
                  <p className="text-xs text-green-400">+12% últimas 24h</p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground-secondary text-sm">Conversas Ativas</p>
                  <p className="text-2xl font-extralight text-foreground">{stats.activeConversations}</p>
                  <p className="text-xs text-blue-400">+5.1% últimas 24h</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground-secondary text-sm">Tempo Resposta IA</p>
                  <p className="text-2xl font-extralight text-foreground">{stats.averageResponseTime}</p>
                  <p className="text-xs text-purple-400">-15.7% últimas 24h</p>
                </div>
                <Clock className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp Instances */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-light text-foreground tracking-wider-sofia">
              Instâncias WhatsApp ({instances.length})
            </h3>
            {instances.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {instances.filter((i: any) => i.status === 'connected').length} ativa{instances.filter((i: any) => i.status === 'connected').length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {instances.map((instance: WhatsAppInstance) => (
              <Card key={instance.id} className="glass-card hover-scale">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        instance.status === 'connected' ? 'bg-green-500' : 'bg-gray-500'
                      }`}>
                        <Smartphone className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground font-light tracking-wider-sofia">
                          {instance.name}
                        </CardTitle>
                        <p className="text-foreground-secondary text-sm">
                          {instance.phone || 'Sem número registrado'}
                        </p>
                        {instance.profileName && instance.profileName !== instance.name && (
                          <p className="text-foreground-tertiary text-xs">
                            👤 {instance.profileName}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(instance.status)} border`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(instance.status)}
                        <span>{getStatusText(instance.status)}</span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-foreground-secondary">Mensagens</p>
                      <p className="text-lg font-light text-foreground">
                        {instance.messagesCount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-secondary">Última atividade</p>
                      <p className="text-lg font-light text-foreground">
                        {instance.lastActivity || 'Nunca'}
                      </p>
                    </div>
                  </div>

                  {/* Status específico da instância */}
                  {instance.status === 'connected' && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
                      <p className="text-xs text-green-400 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Sofia IA ativa - Respondendo automaticamente
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between pt-4 border-t border-glass-border">
                    <Button variant="ghost" size="sm" onClick={() => setShowQR(true)}>
                      <QrCode className="h-4 w-4 mr-2" />
                      Ver QR Code
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={instance.status === 'connected' ? 'text-orange-400 hover:text-orange-300' : 'text-green-400 hover:text-green-300'}
                        onClick={() => 
                          instance.status === 'connected' 
                            ? disconnectInstance(instance.id)
                            : reconnectInstance(instance.id)
                        }
                      >
                        {instance.status === 'connected' ? 'Pausar' : 'Ativar'}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => removeInstance(instance.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty state */}
          {instances.length === 0 && !loading && (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <Smartphone className="h-16 w-16 text-foreground-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-light text-foreground mb-2">
                  Nenhuma instância WhatsApp conectada
                </h3>
                <p className="text-foreground-secondary mb-6">
                  Conecte sua primeira instância para começar a usar a Sofia IA
                </p>
                <Button className="button-luxury" onClick={() => setShowQR(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Conectar Primeiro WhatsApp
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Connection Guide */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground font-light tracking-wider-sofia">
              Como Funciona a Sofia IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-light text-foreground">🚀 Configuração Rápida</h4>
                <ol className="space-y-2 text-foreground-secondary">
                  <li className="flex items-start space-x-2">
                    <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center mt-0.5">1</span>
                    <span>Clique em "Nova Instância WhatsApp"</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center mt-0.5">2</span>
                    <span>Escaneie o QR Code com WhatsApp do celular</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center mt-0.5">3</span>
                    <span>Sofia IA começa a funcionar automaticamente</span>
                  </li>
                </ol>
              </div>

              <div className="space-y-4">
                <h4 className="font-light text-foreground">🤖 Recursos Inteligentes</h4>
                <ul className="space-y-2 text-foreground-secondary">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Respostas automáticas com Claude 3.5</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Qualificação inteligente de leads</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Integração automática com CRM</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Analytics em tempo real</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Workflows N8N personalizáveis</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <WhatsAppQRCode 
          onInstanceConnected={handleInstanceConnected}
          onClose={() => setShowQR(false)}
        />
      )}
    </>
  );
};
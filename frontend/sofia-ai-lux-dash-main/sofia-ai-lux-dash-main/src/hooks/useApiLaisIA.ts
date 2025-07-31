import { useState, useEffect } from 'react';

// Configuração da API
const getApiConfig = () => {
  const isDev = import.meta.env.DEV;
  return {
    baseUrl: isDev 
      ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000')
      : (import.meta.env.VITE_API_BASE_URL_PROD || 'https://lais-ia-api.roilabs.com.br'),
    evolutionApiUrl: import.meta.env.VITE_EVOLUTION_API_URL || 'https://evolutionapi.roilabs.com.br',
    evolutionApiKey: import.meta.env.VITE_EVOLUTION_API_KEY || 'SuOOmamlmXs4NV3nkxpHAy7z3rcurbIz',
    
    // Instância existente (Sofia IA)
    existingInstanceName: import.meta.env.VITE_EXISTING_INSTANCE_NAME || 'Sofia IA',
    existingInstanceKey: import.meta.env.VITE_EXISTING_INSTANCE_KEY || '91A33F0F576C-40AF-AAA7-4002249E7E3C',
    
    // Nova instância (se necessário)
    newInstanceName: import.meta.env.VITE_NEW_INSTANCE_NAME || 'lais_ia_roilabs',
  };
};

// Hook para chamadas à API LAIS IA
export const useApiLaisIA = () => {
  const config = getApiConfig();

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${config.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log(`API Call: ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  };

  return {
    get: (endpoint: string) => apiCall(endpoint),
    post: (endpoint: string, data?: any) => apiCall(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
    put: (endpoint: string, data?: any) => apiCall(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
    delete: (endpoint: string) => apiCall(endpoint, { method: 'DELETE' }),
    config,
  };
};

// Hook para chamadas à Evolution API
export const useEvolutionAPI = () => {
  const config = getApiConfig();

  const evolutionCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${config.evolutionApiUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.evolutionApiKey,
        ...options.headers,
      },
      ...options,
    };

    console.log(`Evolution API Call: ${options.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`Evolution API HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Evolution API Error [${endpoint}]:`, error);
      throw error;
    }
  };

  return {
    get: (endpoint: string) => evolutionCall(endpoint),
    post: (endpoint: string, data?: any) => evolutionCall(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
    delete: (endpoint: string) => evolutionCall(endpoint, { method: 'DELETE' }),
    config,
  };
};

// Hook para dados do WhatsApp - ATUALIZADO para instâncias existentes
export const useWhatsAppData = () => {
  const [instances, setInstances] = useState([]);
  const [stats, setStats] = useState({
    totalMessages: 0,
    activeConversations: 0,
    averageResponseTime: '0s',
    connectedInstances: 0,
    disconnectedInstances: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = useApiLaisIA();
  const evolutionAPI = useEvolutionAPI();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tentar buscar dados reais da API primeiro
      try {
        const [instancesData, metricsData] = await Promise.allSettled([
          api.get('/api/whatsapp/instances'),
          api.get('/api/metrics'),
        ]);

        if (instancesData.status === 'fulfilled') {
          setInstances(instancesData.value.instances || []);
        }

        if (metricsData.status === 'fulfilled') {
          const metrics = metricsData.value;
          setStats({
            totalMessages: metrics.whatsapp?.totalMessages || 247,
            activeConversations: metrics.whatsapp?.activeConversations || 42,
            averageResponseTime: metrics.whatsapp?.averageResponseTime || '1.2s',
            connectedInstances: metrics.whatsapp?.connectedInstances || 0,
            disconnectedInstances: metrics.whatsapp?.disconnectedInstances || 0,
          });
        }
      } catch (backendError) {
        console.log('Backend API não disponível, buscando Evolution API diretamente...');
        
        // Fallback: buscar diretamente da Evolution API
        try {
          const evolutionInstances = await evolutionAPI.get('/instance/fetchInstances');
          
          if (Array.isArray(evolutionInstances)) {
            const formattedInstances = evolutionInstances.map((item, index) => ({
              id: `evolution-${index}`,
              name: item.instance?.instanceName || item.instanceName || 'Instância sem nome',
              phone: item.instance?.number || item.number,
              status: item.connectionStatus === 'open' ? 'connected' : 'disconnected',
              lastActivity: item.connectionStatus === 'open' ? 'Ativo agora' : 'Desconectado',
              messagesCount: Math.floor(Math.random() * 1000), // Mock para contagem
              profileName: item.instance?.profileName || item.profileName,
            }));
            
            setInstances(formattedInstances);
            
            // Calcular stats baseado nas instâncias Evolution
            const connected = formattedInstances.filter(i => i.status === 'connected').length;
            const disconnected = formattedInstances.filter(i => i.status === 'disconnected').length;
            
            setStats({
              totalMessages: 1804, // Baseado na imagem do Evolution Manager
              activeConversations: 42,
              averageResponseTime: '1.2s',
              connectedInstances: connected,
              disconnectedInstances: disconnected,
            });
          }
        } catch (evolutionError) {
          throw new Error('Tanto backend quanto Evolution API falharam');
        }
      }

    } catch (err) {
      console.warn('APIs não disponíveis, usando dados mock:', err);
      
      // Dados mock mais realistas baseados na Sofia IA existente
      setInstances([
        {
          id: 'sofia-ia-existing',
          name: 'Sofia IA',
          phone: '+55 62 8110-9211',
          status: 'connected',
          lastActivity: 'Ativo agora',
          messagesCount: 1804,
          profileName: 'Gabriela | ROI LABS',
        },
        {
          id: 'backup-instance',
          name: 'Backup WhatsApp',
          phone: '+55 62 9999-8888',
          status: 'disconnected',
          lastActivity: '2 horas atrás',
          messagesCount: 156,
          profileName: 'Backup ROI',
        },
      ]);

      setStats({
        totalMessages: 1804,
        activeConversations: 42,
        averageResponseTime: '1.2s',
        connectedInstances: 1,
        disconnectedInstances: 1,
      });

      setError('Modo demonstração (APIs não disponíveis)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    instances,
    stats,
    loading,
    error,
    refetch: fetchData,
  };
};

// Hook para analytics dashboard
export const useAnalyticsData = () => {
  const [data, setData] = useState({
    conversationsToday: 247,
    conversionRate: 34.2,
    qualifiedLeads: 89,
    growth: 156,
    activityData: [],
    recentConversations: [],
    leadQualification: { cold: 30, warm: 45, hot: 25 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const api = useApiLaisIA();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const analyticsData = await api.get('/api/analytics');
      setData(analyticsData);

    } catch (err) {
      console.warn('Analytics API não disponível, usando dados mock:', err);
      
      // Dados mock mais realistas baseados na Sofia IA
      setData({
        conversationsToday: 1804, // Baseado na imagem Evolution Manager
        conversionRate: 34.2,
        qualifiedLeads: 89,
        growth: 156,
        activityData: [
          { time: '00:00', conversations: 12 },
          { time: '04:00', conversations: 35 },
          { time: '08:00', conversations: 78 },
          { time: '12:00', conversations: 156 },
          { time: '16:00', conversations: 234 },
          { time: '20:00', conversations: 189 },
          { time: '24:00', conversations: 98 },
        ],
        recentConversations: [
          {
            id: 1,
            type: 'Cliente Potencial',
            message: 'Olá! Gostaria de saber sobre imóveis na região central.',
            time: '14:32',
            score: 85,
          },
          {
            id: 2,
            type: 'Lead Qualificado',
            message: 'Perfeito! Temos excelentes opções. Qual seu orçamento?',
            time: '14:33',
            score: 92,
          },
          {
            id: 3,
            type: 'Cliente Interessado',
            message: 'Posso agendar uma visita para amanhã?',
            time: '14:45',
            score: 96,
          },
        ],
        leadQualification: { cold: 25, warm: 48, hot: 27 },
      });

      setError('Modo demonstração (API backend não disponível)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Atualizar dados a cada 60 segundos
    const interval = setInterval(fetchAnalytics, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchAnalytics,
  };
};

export default useApiLaisIA;
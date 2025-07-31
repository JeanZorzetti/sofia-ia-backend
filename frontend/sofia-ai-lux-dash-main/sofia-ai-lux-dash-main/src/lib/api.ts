/**
 * 🚀 Sofia IA - Configuração do Backend
 * Conecta dashboard com backend em produção
 */

// URL do backend em produção (usando endpoint existente LAIS por compatibilidade)
export const API_CONFIG = {
  BASE_URL: 'https://lais-ia-api.roilabs.com.br',
  ENDPOINTS: {
    // Health & Status
    HEALTH: '/health',
    STATUS: '/api/status',
    
    // Dashboard & Analytics  
    DASHBOARD: '/admin/dashboard',
    ANALYTICS: '/api/analytics',
    METRICS: '/api/metrics',
    
    // Leads & Conversations
    LEADS: '/api/leads',
    CONVERSATIONS: '/api/conversations',
    SCORING: '/api/scoring',
    
    // WhatsApp & Evolution API
    WHATSAPP_STATUS: '/api/whatsapp/status',
    WHATSAPP_INSTANCES: '/api/whatsapp/instances',
    SEND_MESSAGE: '/api/whatsapp/send',
    
    // Webhooks
    WEBHOOK_WHATSAPP: '/webhooks/whatsapp',
    WEBHOOK_CLAUDE: '/webhooks/claude',
    
    // Configuration
    SETTINGS: '/api/settings',
    USERS: '/api/users',
    CAMPAIGNS: '/api/campaigns'
  },
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Timeout para requests
  TIMEOUT: 10000
};

// Helper para construir URLs completas
export const buildApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper para fetch com configuração padrão
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...options.headers
    }
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

export default API_CONFIG;

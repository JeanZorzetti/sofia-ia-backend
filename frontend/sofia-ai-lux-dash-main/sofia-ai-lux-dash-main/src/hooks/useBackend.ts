/**
 * 🔗 Sofia IA - React Hook para Backend Integration
 * Conecta dashboard com APIs do backend em produção
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_CONFIG } from '@/lib/api';

// ================================
// SYSTEM HEALTH & STATUS
// ================================

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => apiRequest(API_CONFIG.ENDPOINTS.HEALTH),
    refetchInterval: 30000, // Refresh every 30s
    staleTime: 15000
  });
};

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard', 'data'],
    queryFn: () => apiRequest(API_CONFIG.ENDPOINTS.DASHBOARD),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000
  });
};

// ================================
// LEADS & CONVERSATIONS
// ================================

export const useLeads = (params = {}) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => {
      const searchParams = new URLSearchParams(params);
      const endpoint = `${API_CONFIG.ENDPOINTS.LEADS}?${searchParams}`;
      return apiRequest(endpoint);
    },
    staleTime: 60000
  });
};

export const useConversations = (leadId?: string) => {
  return useQuery({
    queryKey: ['conversations', leadId],
    queryFn: () => {
      const endpoint = leadId 
        ? `${API_CONFIG.ENDPOINTS.CONVERSATIONS}/${leadId}`
        : API_CONFIG.ENDPOINTS.CONVERSATIONS;
      return apiRequest(endpoint);
    },
    enabled: !!leadId,
    staleTime: 30000
  });
};

// ================================
// WHATSAPP & EVOLUTION API
// ================================

export const useWhatsAppStatus = () => {
  return useQuery({
    queryKey: ['whatsapp', 'status'],
    queryFn: () => apiRequest(API_CONFIG.ENDPOINTS.WHATSAPP_STATUS),
    refetchInterval: 15000, // Check status every 15s
    staleTime: 10000
  });
};

export const useWhatsAppInstances = () => {
  return useQuery({
    queryKey: ['whatsapp', 'instances'],
    queryFn: () => apiRequest(API_CONFIG.ENDPOINTS.WHATSAPP_INSTANCES),
    staleTime: 60000
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageData: any) => 
      apiRequest(API_CONFIG.ENDPOINTS.SEND_MESSAGE, {
        method: 'POST',
        body: JSON.stringify(messageData)
      }),
    onSuccess: () => {
      // Invalidate conversations to refresh
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
};

// ================================
// ANALYTICS & METRICS
// ================================

export const useAnalytics = (timeRange = '7d') => {
  return useQuery({
    queryKey: ['analytics', timeRange],
    queryFn: () => apiRequest(`${API_CONFIG.ENDPOINTS.ANALYTICS}?range=${timeRange}`),
    staleTime: 300000 // 5 minutes
  });
};

export const useMetrics = () => {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: () => apiRequest(API_CONFIG.ENDPOINTS.METRICS),
    refetchInterval: 120000, // Every 2 minutes
    staleTime: 60000
  });
};

// ================================
// CONFIGURATION & SETTINGS
// ================================

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => apiRequest(API_CONFIG.ENDPOINTS.SETTINGS),
    staleTime: 300000 // Settings don't change often
  });
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (settings: any) => 
      apiRequest(API_CONFIG.ENDPOINTS.SETTINGS, {
        method: 'PUT',
        body: JSON.stringify(settings)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  });
};

// ================================
// CAMPAIGNS & WORKFLOWS
// ================================

export const useCampaigns = () => {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => apiRequest(API_CONFIG.ENDPOINTS.CAMPAIGNS),
    staleTime: 120000
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (campaignData: any) => 
      apiRequest(API_CONFIG.ENDPOINTS.CAMPAIGNS, {
        method: 'POST',
        body: JSON.stringify(campaignData)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    }
  });
};

// ================================
// UTILITY HOOKS
// ================================

export const useRealTimeData = () => {
  const health = useSystemHealth();
  const metrics = useMetrics();
  const whatsappStatus = useWhatsAppStatus();
  
  return {
    isSystemHealthy: health.data?.status === 'ok',
    systemStatus: health.data,
    metrics: metrics.data,
    whatsappStatus: whatsappStatus.data,
    isLoading: health.isLoading || metrics.isLoading || whatsappStatus.isLoading,
    error: health.error || metrics.error || whatsappStatus.error
  };
};

// Hook para dados da dashboard Overview
export const useOverviewData = () => {
  const dashboardData = useDashboardData();
  const analytics = useAnalytics('24h');
  const leads = useLeads({ limit: 10 });
  
  return {
    dashboard: dashboardData.data,
    analytics: analytics.data,
    recentLeads: leads.data?.leads || [],
    isLoading: dashboardData.isLoading || analytics.isLoading || leads.isLoading,
    error: dashboardData.error || analytics.error || leads.error
  };
};

export default {
  useSystemHealth,
  useDashboardData,
  useLeads,
  useConversations,
  useWhatsAppStatus,
  useWhatsAppInstances,
  useSendMessage,
  useAnalytics,
  useMetrics,
  useSettings,
  useUpdateSettings,
  useCampaigns,
  useCreateCampaign,
  useRealTimeData,
  useOverviewData
};

import React from 'react';
import { TrendingUp, MessageSquare, Target, Users, Loader2, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOverviewData, useRealTimeData } from '@/hooks/useBackend';

// Fallback data para quando API não retornar dados
const fallbackData = [
  { name: '00:00', value: 0 },
  { name: '04:00', value: 12 },
  { name: '08:00', value: 45 },
  { name: '12:00', value: 78 },
  { name: '16:00', value: 92 },
  { name: '20:00', value: 67 },
  { name: '24:00', value: 43 },
];

const fallbackMessages = [
  {
    id: 1,
    user: 'Cliente Potencial',
    message: 'Olá, gostaria de saber mais sobre os imóveis disponíveis.',
    time: '14:32',
    type: 'received',
  },
  {
    id: 2,
    user: 'Sofia IA',
    message: 'Olá! Fico feliz em ajudar. Temos várias opções incríveis disponíveis. Você está procurando algo específico? Apartamento ou casa?',
    time: '14:33',
    type: 'sent',
  },
  {
    id: 3,
    user: 'Cliente Potencial',
    message: 'Estou procurando um apartamento de 2 quartos, preferencialmente na zona sul.',
    time: '14:35',
    type: 'received',
  },
  {
    id: 4,
    user: 'Sofia IA',
    message: 'Perfeito! Tenho algumas opções excelentes na zona sul. Deixe-me mostrar os apartamentos mais adequados ao seu perfil...',
    time: '14:36',
    type: 'sent',
  },
];

export const OverviewTab = () => {
  const { 
    dashboard, 
    analytics, 
    recentLeads, 
    isLoading, 
    error 
  } = useOverviewData();
  
  const { 
    isSystemHealthy, 
    systemStatus, 
    metrics,
    whatsappStatus 
  } = useRealTimeData();

  // Preparar dados dos cards com informações reais ou fallback
  const statsCards = [
    {
      title: 'Conversas Hoje',
      value: analytics?.conversations_today || '247',
      change: analytics?.conversations_change || '+12%',
      icon: MessageSquare,
      color: 'text-green-400',
      realTime: true
    },
    {
      title: 'Taxa de Conversão',
      value: analytics?.conversion_rate || '34.2%',
      change: analytics?.conversion_change || '+5.1%',
      icon: Target,
      color: 'text-blue-400',
      realTime: true
    },
    {
      title: 'Leads Qualificados',
      value: analytics?.qualified_leads || recentLeads?.length?.toString() || '89',
      change: analytics?.leads_change || '+23%',
      icon: Users,
      color: 'text-purple-400',
      realTime: true
    },
    {
      title: 'Sistema Status',
      value: isSystemHealthy ? 'Online' : 'Offline',
      change: systemStatus?.uptime ? `${Math.round(process.uptime?.() || 0)}s` : 'N/A',
      icon: TrendingUp,
      color: isSystemHealthy ? 'text-green-400' : 'text-red-400',
      realTime: true
    },
  ];

  // Dados do gráfico - usar dados reais se disponíveis
  const chartData = analytics?.hourly_activity || fallbackData;
  
  // Mensagens recentes - usar dados reais se disponíveis
  const chatMessages = dashboard?.recent_conversations || fallbackMessages;

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in-up">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados: {error.message}. Usando dados de demonstração.
          </AlertDescription>
        </Alert>
        {/* Renderizar com dados fallback */}
        <OverviewContent 
          statsCards={statsCards}
          chartData={fallbackData}
          chatMessages={fallbackMessages}
          isLoading={false}
          systemStatus={null}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* System Status Indicator */}
      {systemStatus && (
        <Alert className={`${isSystemHealthy ? 'border-green-500' : 'border-yellow-500'}`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Sistema: {systemStatus.status} | 
            Serviços: Database ({systemStatus.services?.database}), 
            WhatsApp ({systemStatus.services?.evolutionApi}), 
            IA ({systemStatus.services?.claude})
          </AlertDescription>
        </Alert>
      )}

      <OverviewContent 
        statsCards={statsCards}
        chartData={chartData}
        chatMessages={chatMessages}
        isLoading={isLoading}
        systemStatus={systemStatus}
      />
    </div>
  );
};

const OverviewContent = ({ 
  statsCards, 
  chartData, 
  chatMessages, 
  isLoading, 
  systemStatus 
}: any) => {
  return (
    <>
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-foreground">Dashboard Sofia IA</h1>
        <p className="text-foreground-secondary text-lg">
          Sistema SDR inteligente conversando e convertendo para você
          {systemStatus && (
            <span className="block text-sm mt-2">
              Backend: https://lais-ia-api.roilabs.com.br • 
              Versão: {systemStatus.version}
            </span>
          )}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat: any) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="glass-card hover-scale">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-light text-foreground-secondary tracking-wide-sofia">
                  {stat.title}
                  {stat.realTime && isLoading && (
                    <Loader2 className="ml-2 h-3 w-3 animate-spin inline" />
                  )}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extralight text-foreground mb-1">
                  {stat.value}
                </div>
                <p className={`text-sm ${stat.color}`}>
                  {stat.change} últimas 24h
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chart and Chat Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground font-light tracking-wider-sofia">
              Atividade das Últimas 24h
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin inline" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--foreground-tertiary))', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--foreground-tertiary))', fontSize: 12 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Chat Preview */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-foreground font-light tracking-wider-sofia">
              Sofia IA em Ação
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin inline" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 h-64 overflow-y-auto custom-scrollbar">
              {chatMessages.map((message: any, index: number) => (
                <div
                  key={message.id || index}
                  className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`
                      max-w-xs px-4 py-2 rounded-card text-sm font-light
                      ${message.type === 'sent'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                      }
                    `}
                  >
                    <div className="font-medium text-xs mb-1 opacity-70">
                      {message.user}
                    </div>
                    <div>{message.message}</div>
                    <div className="text-xs opacity-50 mt-1">
                      {message.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

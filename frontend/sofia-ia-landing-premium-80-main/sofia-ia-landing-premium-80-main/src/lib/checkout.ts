/**
 * 🛒 SOFIA IA - Sistema de Checkout Kiwify
 * URLs REAIS - SISTEMA ATIVO ✅
 */

export interface CheckoutPlan {
  id: string;
  name: string;
  price: number;
  kiwifyUrl: string;
  features: string[];
  tokens: string;
  whatsapp: string;
  description: string;
}

// 🔥 URLs REAIS DO KIWIFY - SISTEMA ATIVO ✅
export const CHECKOUT_URLS = {
  starter: "https://pay.kiwify.com.br/cQr4cbk",
  professional: "https://pay.kiwify.com.br/C5X0h6M", 
  enterprise: "https://pay.kiwify.com.br/LDKqDLT",
  case_study: "https://calendar.app.google/your-calendar-link", // Configure sua agenda
  demo: "https://calendar.app.google/demo-sofia-ia" // Configure sua agenda
};

export const CHECKOUT_PLANS: CheckoutPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 67,
    kiwifyUrl: CHECKOUT_URLS.starter,
    description: "Teste com 1 corretor",
    tokens: "15.000 tokens/mês",
    whatsapp: "1 WhatsApp conectado",
    features: [
      "ROI médio: +280% em 30 dias",
      "15.000 tokens/mês",
      "1 WhatsApp conectado", 
      "Templates comprovados",
      "Setup em 5 minutos"
    ]
  },
  {
    id: "professional",
    name: "Profissional",
    price: 97,
    kiwifyUrl: CHECKOUT_URLS.professional,
    description: "Equipe de 3-8 corretores",
    tokens: "50.000 tokens/mês",
    whatsapp: "3 WhatsApps + CRM integrado",
    features: [
      "ROI médio: +450% em 60 dias",
      "50.000 tokens/mês",
      "3 WhatsApps + CRM integrado",
      "IA treinada com suas vendas", 
      "Analytics de conversão",
      "Consultoria de setup",
      "Garantia de resultado"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 297,
    kiwifyUrl: CHECKOUT_URLS.enterprise,
    description: "Grandes imobiliárias",
    tokens: "Tokens ilimitados",
    whatsapp: "WhatsApps ilimitados",
    features: [
      "ROI médio: +800% em 90 dias",
      "Multi-unidades + API dedicada",
      "IA personalizada 100%",
      "Gerente de sucesso exclusivo",
      "Implementação white-label", 
      "SLA de 99.9%"
    ]
  }
];

/**
 * 🎯 Função para processar checkout
 */
export const handleCheckout = (planId: string, source: string = 'pricing') => {
  const plan = CHECKOUT_PLANS.find(p => p.id === planId);
  
  if (!plan) {
    console.error(`Plano ${planId} não encontrado`);
    return;
  }

  // 📊 Analytics de conversão
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'begin_checkout', {
      value: plan.price,
      currency: 'BRL',
      items: [{
        item_id: plan.id,
        item_name: plan.name,
        price: plan.price,
        quantity: 1
      }]
    });
  }

  // 🔥 Tracking de origem
  const urlWithTracking = `${plan.kiwifyUrl}?utm_source=sofia-ia&utm_medium=landing&utm_campaign=${source}&utm_content=${planId}`;
  
  // 🚀 Redirect para checkout REAL
  window.open(urlWithTracking, '_blank');
};

/**
 * 📈 Função para case study  
 */
export const handleCaseStudy = () => {
  // 📊 Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'view_case_study', {
      event_category: 'engagement',
      event_label: 'r2_3m_case'
    });
  }

  window.open(CHECKOUT_URLS.case_study, '_blank');
};

/**
 * 📞 Função para agendar demo
 */
export const handleDemo = () => {
  // 📊 Analytics  
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'schedule_demo', {
      event_category: 'lead',
      event_label: 'enterprise_demo'
    });
  }

  window.open(CHECKOUT_URLS.demo, '_blank');
};

export default {
  CHECKOUT_PLANS,
  CHECKOUT_URLS,
  handleCheckout,
  handleCaseStudy,
  handleDemo
};
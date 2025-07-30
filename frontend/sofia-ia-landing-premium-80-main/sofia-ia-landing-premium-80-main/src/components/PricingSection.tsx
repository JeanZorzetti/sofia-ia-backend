import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { handleCheckout, CHECKOUT_PLANS } from '@/lib/checkout';

const PricingSection = () => {
  return (
    <section id="precos" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-ultra-light tracking-tight mb-6">
            ROI médio: 1.200% em 90 dias
          </h2>
          <p className="text-xl font-light max-w-3xl mx-auto text-slate-300">
            Preço fixo. Resultados garantidos por contrato.
          </p>
          
          <div className="flex items-center justify-center space-x-6 mt-8">
            <div className="bg-red-500/20 border border-red-500/30 rounded-full px-6 py-2">
              <span className="text-sm font-light text-red-400">🔥 Promoção termina em 6 dias</span>
            </div>
            <div className="bg-green-500/20 border border-green-500/30 rounded-full px-6 py-2">
              <span className="text-sm font-light text-green-400">✅ Garantia de 60 dias</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {CHECKOUT_PLANS.map((plan, index) => {
            const isPopular = plan.id === 'professional';
            const isEnterprise = plan.id === 'enterprise';
            const savings = plan.id === 'starter' ? '76% OFF' : 
                           plan.id === 'professional' ? 'MAIS POPULAR' : 
                           'ROI GARANTIDO';

            return (
              <div 
                key={plan.id}
                className={`relative bg-card border rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 gradient-card ${
                  isPopular 
                    ? 'border-foreground shadow-card-hover scale-105' 
                    : 'border-subtle hover:border-interactive hover:shadow-card-hover'
                }`}
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className={`px-4 py-2 rounded-full text-sm font-light tracking-wide ${
                    isPopular 
                      ? 'bg-primary text-primary-foreground' 
                      : isEnterprise
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {savings}
                  </span>
                </div>

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-light tracking-tight mb-2 text-foreground">
                    {plan.name}
                  </h3>
                  <p className="text-sm mb-4 text-slate-300">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-ultra-light text-foreground">
                      R$ {plan.price}
                    </span>
                    <span className="text-secondary font-light ml-1">
                      /mês
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="font-light text-slate-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handleCheckout(plan.id, 'pricing')}
                  className={`w-full rounded-full py-3 font-light tracking-wide transition-all duration-200 ${
                    isPopular 
                      ? 'bg-primary text-primary-foreground hover:glow-primary hover:scale-105' 
                      : 'bg-transparent border border-interactive text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-105'
                  }`}
                >
                  {plan.id === 'starter' ? '🚀 Começar agora' :
                   plan.id === 'professional' ? '💰 Triplicar vendas agora' :
                   '👑 Ativar plano enterprise'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
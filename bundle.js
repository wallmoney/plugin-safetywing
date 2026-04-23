const ESSENTIAL = {
  id: 'essential',
  name: 'Nomad Insurance Essential',
  price: '$62.72 / 4 weeks',
  coverage: 'Travel medical insurance for new and unexpected issues abroad.',
  cta: 'https://safetywing.com/signup?callbackUrl=%2Fdashboard%2Fnomad-insurance%2Fpurchase&product=nomad-insurance',
  reference: 'safetywing-essential'
};

const COMPLETE = {
  id: 'complete',
  name: 'Nomad Insurance Complete',
  price: '$177.50 / month',
  coverage: 'Broader health coverage with routine care, wellness support, and cancer treatment.',
  cta: 'https://safetywing.com/signup?callbackUrl=%2Fdashboard%2Fnomad-insurance%2Fpurchase%2Fcomplete&product=nomad-health',
  reference: 'safetywing-complete'
};

const STORAGE_KEY = 'last-checkout';
const DOCS_URL = 'https://documentation.safetywing.com/docs/background';
const ACCOUNT_URL = 'https://safetywing.com/dashboard';

function formatWhen(value) {
  if (!value) return 'Not launched yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not launched yet';
  return date.toLocaleString();
}

function planFromRequest(request) {
  const reference = request && request.reference ? String(request.reference) : '';
  return reference === COMPLETE.reference ? COMPLETE : ESSENTIAL;
}

module.exports = {
  default: {
    setup(hostApi) {
      this.hostApi = hostApi;
      this.unsubscribe = hostApi.events.onPaymentExecuted((result) => {
        const plan = planFromRequest(result.request || {});
        hostApi.storage.set(STORAGE_KEY, {
          planId: plan.id,
          planName: plan.name,
          launchedAt: result.executedAt,
          status: result.status,
          checkoutUrl: result.request && result.request.url ? result.request.url : plan.cta
        });
      });
    },

    render() {
      const hostApi = this.hostApi;
      const latest = hostApi ? hostApi.storage.get(STORAGE_KEY) : null;
      const latestPlan = latest && latest.planId === COMPLETE.id ? COMPLETE : ESSENTIAL;
      const latestStatus = latest && latest.status ? String(latest.status) : 'not_started';

      return {
        title: 'SafetyWing Insurance',
        description:
          'Buy SafetyWing nomad coverage from Wall Money, then reopen your checkout or account anytime from the dashboard.',
        nodes: [
          {
            type: 'stack',
            gap: 'lg',
            children: [
              {
                type: 'section',
                title: 'Why this plugin exists',
                description:
                  'SafetyWing offers insurance for nomads and remote workers. Their Remote Health API is designed for partners who want plans, pricing, and member workflows inside their own product.',
                children: [
                  {
                    type: 'list',
                    items: [
                      { label: 'Coverage footprint', value: '180+ countries' },
                      { label: 'Plan types', value: 'Essential and Complete' },
                      { label: 'Partner API focus', value: 'Plans, members, groups, webhooks' }
                    ]
                  }
                ]
              },
              {
                type: 'section',
                title: 'Order a plan',
                description:
                  'Choose the plan that fits your travel style. SafetyWing handles signup and payment on their side, and Wall Money remembers the last checkout you launched.',
                children: [
                  {
                    type: 'stack',
                    gap: 'md',
                    children: [
                      { type: 'stat', label: ESSENTIAL.name, value: ESSENTIAL.price, helper: ESSENTIAL.coverage },
                      { type: 'button', label: 'Get Essential cover', action: { type: 'payment', request: { label: ESSENTIAL.name, url: ESSENTIAL.cta, reference: ESSENTIAL.reference } } },
                      { type: 'stat', label: COMPLETE.name, value: COMPLETE.price, helper: COMPLETE.coverage },
                      { type: 'button', label: 'Get Complete cover', variant: 'secondary', action: { type: 'payment', request: { label: COMPLETE.name, url: COMPLETE.cta, reference: COMPLETE.reference } } }
                    ]
                  }
                ]
              },
              {
                type: 'section',
                title: 'Latest activity',
                description: 'The plugin keeps a lightweight local record of the most recent checkout you opened from Wall Money.',
                children: [
                  {
                    type: 'list',
                    items: [
                      { label: 'Latest plan', value: latest && latest.planName ? String(latest.planName) : 'None yet' },
                      { label: 'Checkout opened', value: formatWhen(latest && latest.launchedAt) },
                      { label: 'Last status', value: latestStatus.replace(/_/g, ' ') }
                    ]
                  },
                  {
                    type: 'button',
                    label: 'Resume latest checkout',
                    variant: 'ghost',
                    action: {
                      type: 'payment',
                      request: {
                        label: latest && latest.planName ? String(latest.planName) : latestPlan.name,
                        url: latest && latest.checkoutUrl ? String(latest.checkoutUrl) : latestPlan.cta,
                        reference: latestPlan.reference
                      }
                    }
                  }
                ]
              },
              {
                type: 'section',
                title: 'Links',
                description: 'Open your SafetyWing account or review the partner API background documentation.',
                children: [
                  {
                    type: 'stack',
                    gap: 'sm',
                    children: [
                      { type: 'button', label: 'Open SafetyWing account', variant: 'secondary', action: { type: 'navigate', href: ACCOUNT_URL } },
                      { type: 'button', label: 'Open API docs', variant: 'ghost', action: { type: 'navigate', href: DOCS_URL } }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };
    },

    dispose() {
      if (typeof this.unsubscribe === 'function') {
        this.unsubscribe();
      }
    }
  }
};

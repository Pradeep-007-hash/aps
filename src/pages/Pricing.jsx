import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, ChevronDown, ChevronUp, Zap, ShieldCheck, HelpCircle } from 'lucide-react';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'

  // FAQs State
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    if (openFaq === index) {
      setOpenFaq(null);
    } else {
      setOpenFaq(index);
    }
  };

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small residential blocks or single-building societies.',
      monthlyPrice: 19,
      annualPrice: 15,
      features: [
        'Up to 50 apartments/units',
        'Basic member directory',
        'Complaints management system',
        'Community announcements Board',
        'Email notifications',
        'Standard mobile-friendly portal',
      ],
      notIncluded: [
        'Visitor & delivery gate logging',
        'Visitor approvals via SMS/OTP',
        'Resident event booking & RSVPs',
        'Excel sheet data import/export',
        'Dedicated server/Support SLA',
      ],
      cta: 'Start with Starter',
      link: '/register?plan=starter',
      popular: false,
      icon: 'Building',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Professional',
      description: 'The ultimate portal for active, modern apartment societies.',
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        'Unlimited apartments/units',
        'Advanced member directory & family profiles',
        'Full complaints tracking with workflows',
        'Visitor Gate log & real-time gate pass approvals',
        'Delivery logs & notification alerts',
        'Event scheduling, calendars & booking',
        'Community Resource sharing library',
        'Excel (.xlsx) import/export for users & logs',
        'Advanced analytics & reporting dashboard',
        'Priority email & chat support',
      ],
      notIncluded: [
        'Custom domain integration',
        'Dedicated hosting infrastructure',
      ],
      cta: 'Get Professional',
      link: '/register?plan=professional',
      popular: true,
      icon: 'Zap',
      gradient: 'from-primary-600 to-indigo-600'
    },
    {
      name: 'Enterprise',
      description: 'Tailored for large gated communities, multiple towers & estates.',
      price: 'Custom',
      features: [
        'Multi-society & multi-tower management',
        'Hardware gate integration options (IoT)',
        'Unlimited security guard accounts',
        'Custom branding & white-label options',
        'Custom domain integration (e.g. portal.mycomplex.com)',
        '99.9% uptime Service Level Agreement (SLA)',
        'Dedicated Account Manager',
        '24/7/365 telephone & technical support',
        'On-demand employee & staff training',
      ],
      notIncluded: [],
      cta: 'Contact Sales',
      link: 'mailto:sales@urbannest.com?subject=Enterprise%20Inquiry',
      popular: false,
      icon: 'ShieldCheck',
      gradient: 'from-purple-600 to-indigo-600'
    }
  ];

  const faqs = [
    {
      question: 'How does the billing cycle work, and can I switch plans later?',
      answer: 'You can choose between monthly and annual billing. Annual billing offers a 20% discount. You can upgrade or downgrade your plan at any time. When upgrading, changes are applied immediately, and your billing will be prorated. Downgrades take effect at the end of the current billing cycle.'
    },
    {
      question: 'Do security guards or staff require individual paid licenses?',
      answer: 'No! Staff, security guard accounts, and administration accounts are completely unlimited and free on both the Professional and Enterprise plans. We only price based on the package suite that fits your community size and administrative requirements.'
    },
    {
      question: 'Is my community data secure with UrbanNest?',
      answer: 'Yes, absolutely. Security is our top priority. All data is stored in secure cloud environments with role-based access controls, ensuring that only authorized administrators, guards, or residents can access their respective data. Sensitive credentials and passwords are encrypted using state-of-the-art bcrypt hashing.'
    },
    {
      question: 'What is the Excel sheet import and export feature?',
      answer: 'Administrators often have extensive records in spreadsheet format. The Professional and Enterprise plans allow you to import your entire resident list via Excel (.xlsx) templates to get set up in seconds. You can also export visitor logs, delivery reports, and accounts for offline bookkeeping and analysis.'
    },
    {
      question: 'Can we use our own domain name for our community portal?',
      answer: 'Yes! Our Enterprise plan includes custom domain integration. This allows your portal to reside at a domain of your choice (e.g., portal.greenvalleyestates.com) with an automatically provisioned SSL certificate for security.'
    }
  ];

  return (
    <div className="py-20 px-8 transition-colors duration-300">
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto text-center mt-12 mb-16">
        <span className="inline-block py-1 px-3 bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 text-xs font-bold tracking-widest uppercase rounded-full mb-4 border border-primary-200 dark:border-primary-800 transition-colors">
          Simple, Transparent Pricing
        </span>
        <h1 className="font-extrabold text-4xl sm:text-6xl text-gray-900 dark:text-white leading-tight tracking-tighter mb-6">
          Plans Built for Communities of <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">All Sizes.</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
          No hidden fees, no complex contracts. Choose the plan that matches your community governance needs.
        </p>

        {/* Billing Cycle Switcher */}
        <div className="flex items-center justify-center gap-4 mt-12">
          <span className={`text-sm font-semibold transition-colors ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
            Billed Monthly
          </span>
          <button 
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className="w-16 h-8 rounded-full bg-gray-200 dark:bg-gray-800 relative flex items-center p-1 cursor-pointer transition-colors duration-300 focus:outline-none"
            aria-label="Toggle billing cycle"
          >
            <div className={`w-6 h-6 rounded-full bg-primary-600 shadow-md transform transition-transform duration-300 ${billingCycle === 'annual' ? 'translate-x-8' : 'translate-x-0'}`}></div>
          </button>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-semibold transition-colors ${billingCycle === 'annual' ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
              Billed Annually
            </span>
            <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Save 20%
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-28">
        {plans.map((plan, idx) => {
          const isAnnual = billingCycle === 'annual';
          const price = plan.price 
            ? plan.price 
            : isAnnual 
              ? plan.annualPrice 
              : plan.monthlyPrice;

          return (
            <div 
              key={idx}
              className={`relative rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between transition-all duration-300 border ${
                plan.popular 
                  ? 'bg-white dark:bg-gray-900 border-primary-500 shadow-xl shadow-primary-500/10 scale-105 z-10' 
                  : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 hover:shadow-lg'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-indigo-600 text-white text-xs font-bold tracking-widest uppercase py-1 px-4 rounded-full shadow-md">
                  Most Popular
                </span>
              )}

              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-extrabold text-2xl text-gray-900 dark:text-white">{plan.name}</h3>
                    <p className="text-gray-400 text-sm mt-1.5 font-medium leading-relaxed">{plan.description}</p>
                  </div>
                  <div className={`p-3 rounded-2xl bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300`}>
                    {plan.icon === 'Building' && <Zap className="w-6 h-6 text-cyan-500" />}
                    {plan.icon === 'Zap' && <Zap className="w-6 h-6 text-primary-500" />}
                    {plan.icon === 'ShieldCheck' && <ShieldCheck className="w-6 h-6 text-indigo-500" />}
                  </div>
                </div>

                <div className="flex items-baseline gap-1.5 mb-8">
                  {typeof price === 'number' ? (
                    <>
                      <span className="text-5xl font-black text-gray-900 dark:text-white">${price}</span>
                      <span className="text-gray-400 font-semibold text-sm">/ month</span>
                    </>
                  ) : (
                    <span className="text-5xl font-black text-gray-900 dark:text-white">{price}</span>
                  )}
                </div>

                <div className="h-px bg-gray-200 dark:bg-gray-800 mb-8"></div>

                <ul className="space-y-4">
                  {plan.features.map((feat, fidx) => (
                    <li key={fidx} className="flex items-start gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feat, fidx) => (
                    <li key={fidx} className="flex items-start gap-3 text-sm font-medium text-gray-400 dark:text-gray-600">
                      <X className="w-5 h-5 text-gray-300 dark:text-gray-700 flex-shrink-0 mt-0.5" />
                      <span className="line-through">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10">
                {plan.price === 'Custom' ? (
                  <a 
                    href={plan.link}
                    className="w-full py-4 px-6 rounded-2xl bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold text-center block transition-all hover:shadow-md"
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link 
                    to={plan.link}
                    className={`w-full py-4 px-6 rounded-2xl font-bold text-center block transition-all hover:shadow-md ${
                      plan.popular 
                        ? 'bg-gradient-to-br from-primary-600 to-indigo-600 text-white hover:shadow-primary-500/20' 
                        : 'bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                )}
                {typeof price === 'number' && isAnnual && (
                  <p className="text-center text-xs text-gray-400 mt-3 font-semibold">
                    Billed annually (${price * 12}/year)
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table Title */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="font-extrabold text-3xl text-gray-900 dark:text-white tracking-tight">Compare Plan Features</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">A granular review of capability integrations across tiers.</p>
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-7xl mx-auto overflow-x-auto mb-28 border border-gray-100 dark:border-gray-800 rounded-[2rem] bg-white dark:bg-gray-900/50 p-6 md:p-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="py-4 font-bold text-gray-900 dark:text-white">Core Modules</th>
              <th className="py-4 font-bold text-gray-900 dark:text-white text-center">Starter</th>
              <th className="py-4 font-bold text-gray-900 dark:text-white text-center">Professional</th>
              <th className="py-4 font-bold text-gray-900 dark:text-white text-center">Enterprise</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm font-medium text-gray-600 dark:text-gray-300">
            <tr>
              <td className="py-4 text-gray-900 dark:text-white">Max Units / Apartments</td>
              <td className="py-4 text-center">Up to 50</td>
              <td className="py-4 text-center text-primary-500 font-bold">Unlimited</td>
              <td className="py-4 text-center text-indigo-500 font-bold">Unlimited</td>
            </tr>
            <tr>
              <td className="py-4 text-gray-900 dark:text-white">Complaints Dashboard</td>
              <td className="py-4 text-center"><Check className="w-5 h-5 text-emerald-500 mx-auto" /></td>
              <td className="py-4 text-center"><Check className="w-5 h-5 text-emerald-500 mx-auto" /></td>
              <td className="py-4 text-center"><Check className="w-5 h-5 text-emerald-500 mx-auto" /></td>
            </tr>
            <tr>
              <td className="py-4 text-gray-900 dark:text-white">Visitor Pass Log & approvals</td>
              <td className="py-4 text-center"><X className="w-5 h-5 text-gray-300 dark:text-gray-700 mx-auto" /></td>
              <td className="py-4 text-center"><Check className="w-5 h-5 text-emerald-500 mx-auto" /></td>
              <td className="py-4 text-center"><Check className="w-5 h-5 text-emerald-500 mx-auto" /></td>
            </tr>
            <tr>
              <td className="py-4 text-gray-900 dark:text-white">Delivery reminders & logs</td>
              <td className="py-4 text-center"><X className="w-5 h-5 text-gray-300 dark:text-gray-700 mx-auto" /></td>
              <td className="py-4 text-center"><Check className="w-5 h-5 text-emerald-500 mx-auto" /></td>
              <td className="py-4 text-center"><Check className="w-5 h-5 text-emerald-500 mx-auto" /></td>
            </tr>
            <tr>
              <td className="py-4 text-gray-900 dark:text-white">Event booking scheduler</td>
              <td className="py-4 text-center"><X className="w-5 h-5 text-gray-300 dark:text-gray-700 mx-auto" /></td>
              <td className="py-4 text-center"><Check className="w-5 h-5 text-emerald-500 mx-auto" /></td>
              <td className="py-4 text-center"><Check className="w-5 h-5 text-emerald-500 mx-auto" /></td>
            </tr>
            <tr>
              <td className="py-4 text-gray-900 dark:text-white">Excel Import/Export</td>
              <td className="py-4 text-center"><X className="w-5 h-5 text-gray-300 dark:text-gray-700 mx-auto" /></td>
              <td className="py-4 text-center"><Check className="w-5 h-5 text-emerald-500 mx-auto" /></td>
              <td className="py-4 text-center"><Check className="w-5 h-5 text-emerald-500 mx-auto" /></td>
            </tr>
            <tr>
              <td className="py-4 text-gray-900 dark:text-white">Custom Domain Integration</td>
              <td className="py-4 text-center"><X className="w-5 h-5 text-gray-300 dark:text-gray-700 mx-auto" /></td>
              <td className="py-4 text-center"><X className="w-5 h-5 text-gray-300 dark:text-gray-700 mx-auto" /></td>
              <td className="py-4 text-center"><Check className="w-5 h-5 text-emerald-500 mx-auto" /></td>
            </tr>
            <tr>
              <td className="py-4 text-gray-900 dark:text-white">Dedicated Support SLA</td>
              <td className="py-4 text-center">Email Only</td>
              <td className="py-4 text-center">Priority Email/Chat</td>
              <td className="py-4 text-center text-primary-500 font-bold">24/7 Phone & Account Mgr</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Frequently Asked Questions Section */}
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <HelpCircle className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h2 className="font-extrabold text-3xl sm:text-4xl text-gray-900 dark:text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Clear answers to common questions about licenses, security, and setup.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden bg-white dark:bg-gray-900/40 transition-all"
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex justify-between items-center gap-4 font-bold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors focus:outline-none"
                >
                  <span className="text-lg">{faq.question}</span>
                  {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {isOpen && (
                  <div className="p-6 pt-0 text-gray-500 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-50 dark:border-gray-800/30">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

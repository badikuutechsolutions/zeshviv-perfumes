interface ViabilityPageProps {
  onNavigate: (page: string) => void;
}

export default function ViabilityPage({ onNavigate }: ViabilityPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-amber-950 to-gray-900 text-white py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-amber-300 mb-3">
            <button onClick={() => onNavigate('home')} className="hover:text-white">Home</button>
            <span>/</span>
            <span>Business Viability Report</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">📊 Business Viability Report</h1>
          <p className="text-gray-300 text-base max-w-2xl">
            Is selling perfumes online and delivering them in Mombasa a viable business? Here's a comprehensive, honest analysis.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 text-sm font-bold px-4 py-2 rounded-full">
            ✅ VERDICT: HIGHLY VIABLE — With the right execution
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Executive Summary */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
            🎯 Executive Summary
          </h2>
          <div className="prose text-gray-600 text-sm leading-relaxed space-y-3">
            <p>
              Selling perfumes online and delivering them to customers in Mombasa is a <strong className="text-gray-900">genuinely viable business model</strong> in 2025.
              The combination of a growing middle class, high smartphone penetration, strong cultural appreciation for fragrances (especially oud/Arabic scents on the Coast),
              and the dominance of M-Pesa for digital payments creates a near-perfect environment for this kind of retail operation.
            </p>
            <p>
              Think of it like a hyperlocal version of Kilimall — but specialising entirely in fragrances, with same-day delivery and WhatsApp-based customer support.
              Mombasa's culture, especially in areas like Mombasa CBD, Nyali, Old Town, and Likoni, has a <strong className="text-gray-900">very strong affinity for perfumes</strong>,
              particularly non-alcoholic (halal) ouds, bakhoor, and Khaleeji-inspired scents.
            </p>
          </div>
        </section>

        {/* Market Stats */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
            📈 Market Data — Kenya & Coast Region
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { value: 'KES 45B+', label: 'Kenya Fragrance Market 2024', icon: '💰', bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700' },
              { value: '4.2%', label: 'Annual Market Growth Rate', icon: '📈', bg: 'bg-green-50 border-green-100', text: 'text-green-700' },
              { value: '91%', label: 'Mobile E-commerce Transactions', icon: '📱', bg: 'bg-blue-50 border-blue-100', text: 'text-blue-700' },
              { value: '85%', label: 'Prefer M-Pesa for Online Shopping', icon: '✅', bg: 'bg-purple-50 border-purple-100', text: 'text-purple-700' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border rounded-xl p-4 text-center`}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className={`text-xl font-black ${s.text}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <h4 className="font-bold text-gray-800 mb-2 text-sm">🌍 Kenya E-commerce Forecast</h4>
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li>• Kenya's e-commerce market: <strong>$2.6 Billion (2024)</strong></li>
                <li>• Expected to grow to <strong>$3.8 Billion by 2028</strong></li>
                <li>• CAGR of <strong>12.56%</strong> from 2024–2028</li>
                <li>• Beauty & Personal Care is one of the fastest growing segments</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <h4 className="font-bold text-gray-800 mb-2 text-sm">🏖️ Mombasa Specific Factors</h4>
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li>• Strong Swahili & Arab cultural tradition of using perfumes daily</li>
                <li>• Oud and non-alcoholic perfumes are in very high demand</li>
                <li>• Growing middle class in Nyali, Bamburi, Diani areas</li>
                <li>• Tourism generates demand from visitors seeking authentic scents</li>
              </ul>
            </div>
          </div>
        </section>

        {/* SWOT */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-black text-gray-900 mb-5">⚖️ SWOT Analysis</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: '💪 Strengths',
                wrapClass: 'bg-green-50 border-green-100',
                titleClass: 'text-green-800',
                items: [
                  'Low startup capital vs. physical store (no rent)',
                  'Mombasa\'s deep cultural love for fragrances',
                  'M-Pesa makes payments friction-free',
                  'WhatsApp as a low-cost marketing channel',
                  'No physical boundaries — can serve entire Coast',
                  'Easy to test products and pricing',
                ]
              },
              {
                title: '⚠️ Weaknesses',
                wrapClass: 'bg-orange-50 border-orange-100',
                titleClass: 'text-orange-800',
                items: [
                  'Customers can\'t smell before buying (key challenge)',
                  'Building trust online takes time',
                  'Counterfeit products destroy reputation fast',
                  'Delivery logistics can be inconsistent',
                  'Returns are complicated with scent products',
                  'High competition from physical shops in CBD',
                ]
              },
              {
                title: '🚀 Opportunities',
                wrapClass: 'bg-blue-50 border-blue-100',
                titleClass: 'text-blue-800',
                items: [
                  'First-mover advantage in Mombasa online perfume space',
                  'Instagram/TikTok can drive massive organic reach',
                  'Gifting season demand (weddings, Eid, Christmas)',
                  'WhatsApp Business for personalised sales',
                  'Subscription boxes for loyal customers',
                  'Expand to Malindi, Kilifi, Diani as delivery grows',
                ]
              },
              {
                title: '🛑 Threats',
                wrapClass: 'bg-red-50 border-red-100',
                titleClass: 'text-red-800',
                items: [
                  'Jumia/Kilimall could enter perfume niche',
                  'Counterfeit imports undercutting prices',
                  'Customer trust in online perfume buying still low',
                  'Delivery reliability issues in some areas',
                  'Scent preferences are very personal & subjective',
                  'Economic downturns hit luxury goods first',
                ]
              }
            ].map(section => (
              <div key={section.title} className={`${section.wrapClass} border rounded-xl p-4`}>
                <h3 className={`font-black ${section.titleClass} mb-3 text-sm`}>{section.title}</h3>
                <ul className="space-y-1.5">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                      <span className="mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Financial Projections */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-black text-gray-900 mb-5">💹 Financial Projections (Conservative)</h2>
          <div className="grid md:grid-cols-3 gap-4 mb-5">
            {[
              {
                label: 'Startup Costs',
                items: [
                  ['Website + Domain', 'KES 5,000–15,000'],
                  ['Initial Inventory (20 products)', 'KES 50,000–80,000'],
                  ['Packaging & Branding', 'KES 5,000'],
                  ['Marketing (month 1)', 'KES 10,000'],
                  ['Total', 'KES 70,000–110,000'],
                ],
                icon: '🏁',
                wrapClass: 'bg-red-50 border-red-100'
              },
              {
                label: 'Monthly Costs',
                items: [
                  ['Rider/Delivery fees', 'KES 8,000–15,000'],
                  ['Social media ads', 'KES 5,000–10,000'],
                  ['Restock inventory', 'KES 30,000–60,000'],
                  ['Packaging/ops', 'KES 3,000'],
                  ['Total ops', 'KES 46,000–88,000'],
                ],
                icon: '📅',
                wrapClass: 'bg-orange-50 border-orange-100'
              },
              {
                label: 'Revenue Potential',
                items: [
                  ['Month 1–3 (5-10 orders/day)', 'KES 45,000–120,000'],
                  ['Month 4–6 (15-25 orders/day)', 'KES 135,000–300,000'],
                  ['Year 1 avg margin (35-45%)', '~KES 45,000–135,000/mo'],
                  ['Break-even point', 'Month 2–4'],
                  ['Year 1 net profit est.', 'KES 200,000–600,000'],
                ],
                icon: '💰',
                wrapClass: 'bg-green-50 border-green-100'
              }
            ].map(col => (
              <div key={col.label} className={`${col.wrapClass} border rounded-xl p-4`}>
                <div className="text-xl mb-2">{col.icon}</div>
                <h3 className="font-black text-gray-800 text-sm mb-3">{col.label}</h3>
                <table className="w-full text-xs">
                  <tbody>
                    {col.items.map(([k, v], i) => (
                      <tr key={i} className={i === col.items.length - 1 ? 'border-t font-bold' : ''}>
                        <td className="py-1 text-gray-600 pr-2">{k}</td>
                        <td className="py-1 text-right text-gray-800 font-semibold">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h4 className="font-bold text-amber-800 text-sm mb-2">📊 Key Assumption</h4>
            <p className="text-xs text-amber-700">
              Average order value: KES 2,000–3,000. Gross margin on perfumes: 35–50% (buying at KES 800–1,200, selling at KES 1,500–3,500).
              These projections assume proper sourcing from reliable Mombasa/Nairobi suppliers and 3–4 months to build a loyal customer base through WhatsApp marketing and Instagram.
            </p>
          </div>
        </section>

        {/* Key Challenges & Solutions */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-black text-gray-900 mb-5">🧩 Key Challenges & How to Solve Them</h2>
          <div className="space-y-4">
            {[
              {
                challenge: '😤 "I can\'t smell it before buying"',
                icon: '👃',
                solution: 'Offer detailed scent descriptions (top/heart/base notes), comparison to known brands (e.g., "Similar to Dior Sauvage"), and video reviews. Start with a sample kit (KES 200–500) so customers can test 5 scents before committing.',
                severity: 'HIGH',
              },
              {
                challenge: '🤔 "How do I trust this seller?"',
                icon: '🛡️',
                solution: 'Focus on building social proof from day 1. Collect WhatsApp testimonials with photos. Get featured in Mombasa Facebook groups. Offer a 7-day exchange policy (not refund — exchange for another scent). Show your face — people buy from people.',
                severity: 'HIGH',
              },
              {
                challenge: '🛵 Delivery reliability',
                icon: '🗺️',
                solution: 'Partner with G4S, Sendy, or a dedicated local Mombasa boda/tuk-tuk network. Start with CBD delivery only, then expand. Clear delivery time windows (e.g., 9am-1pm or 2pm-6pm slots) reduce anxiety.',
                severity: 'MEDIUM',
              },
              {
                challenge: '📦 Counterfeit concerns',
                icon: '✅',
                solution: 'Source ONLY from verified distributors. Show your sourcing story (e.g., "Imported from Dubai via supplier we\'ve vetted for 2 years"). Certificates of authenticity where possible. Avoid mixing grey-market and genuine products.',
                severity: 'MEDIUM',
              },
              {
                challenge: '📱 Marketing with a small budget',
                icon: '📢',
                solution: 'Instagram Reels and TikTok are free and HIGHLY effective for fragrance content ("what my perfume smells like", "top 5 ouds under KES 2000"). WhatsApp Broadcast Lists with 200+ contacts can generate 5-10 orders per blast. Leverage Mombasa Facebook groups.',
                severity: 'LOW',
              },
            ].map(item => (
              <div key={item.challenge} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-3xl flex-shrink-0">{item.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-800 text-sm">{item.challenge}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.severity === 'HIGH' ? 'bg-red-100 text-red-600' :
                      item.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-600' :
                      'bg-green-100 text-green-600'
                    }`}>{item.severity} RISK</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">💡 <strong>Solution:</strong> {item.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Competitor Landscape */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-black text-gray-900 mb-5">🏁 Competitive Landscape — Mombasa</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-3 font-bold text-gray-700">Competitor Type</th>
                  <th className="text-left p-3 font-bold text-gray-700">Examples</th>
                  <th className="text-left p-3 font-bold text-gray-700">Weakness You Exploit</th>
                  <th className="text-left p-3 font-bold text-gray-700">Threat Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  {
                    type: 'Physical perfume shops',
                    examples: 'Mombasa CBD shops, Nakumatt/Carrefour counters',
                    weakness: 'No delivery, fixed hours, limited stock, no online presence',
                    threat: 'MEDIUM',
                  },
                  {
                    type: 'WhatsApp-only sellers',
                    examples: 'Informal Instagram/WA vendors',
                    weakness: 'No professional website, hard to browse, looks untrustworthy',
                    threat: 'MEDIUM',
                  },
                  {
                    type: 'Jumia / Kilimall',
                    examples: 'Jumia Kenya fragrance section',
                    weakness: 'Generic, no curation, slow delivery, no local personality',
                    threat: 'HIGH',
                  },
                  {
                    type: 'Dubai imports (grey market)',
                    examples: 'Cheaply priced bulk imports',
                    weakness: 'No trust, fake products common, no after-sale support',
                    threat: 'LOW',
                  },
                ].map(row => (
                  <tr key={row.type} className="hover:bg-gray-50">
                    <td className="p-3 font-semibold text-gray-800">{row.type}</td>
                    <td className="p-3 text-gray-600">{row.examples}</td>
                    <td className="p-3 text-green-700">{row.weakness}</td>
                    <td className="p-3">
                      <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                        row.threat === 'HIGH' ? 'bg-red-100 text-red-600' :
                        row.threat === 'MEDIUM' ? 'bg-orange-100 text-orange-600' :
                        'bg-green-100 text-green-600'
                      }`}>{row.threat}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Go-to-Market Strategy */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xl font-black text-gray-900 mb-5">🗓️ Recommended 90-Day Launch Plan</h2>
          <div className="space-y-4">
            {[
              {
                phase: 'Month 1: Foundation',
                borderClass: 'border-amber-200',
                headerClass: 'bg-amber-500',
                bodyClass: 'bg-amber-50',
                icon: '🏗️',
                tasks: [
                  'Source 15–20 products from verified Nairobi/Mombasa suppliers (min. 5 oud, 5 women, 5 men)',
                  'Launch your website (this one!) with quality photos/descriptions',
                  'Set up M-Pesa Paybill or Till Number',
                  'Create Instagram, TikTok, and WhatsApp Business accounts',
                  'Build a WhatsApp broadcast list of 100–200 contacts from your network',
                  'Test delivery with 3–5 early "test" orders among friends/family',
                ],
              },
              {
                phase: 'Month 2: Traction',
                borderClass: 'border-blue-200',
                headerClass: 'bg-blue-500',
                bodyClass: 'bg-blue-50',
                icon: '🚀',
                tasks: [
                  'Post 3–4 Reels/TikTok videos weekly (scent reveals, comparisons, unboxings)',
                  'Run KES 2,000–3,000 Instagram/Facebook targeted ad to Mombasa audience',
                  'Join and participate in Mombasa Facebook groups (no spamming — add value)',
                  'Introduce a "Sample Kit" for KES 300 (5 test vials) to reduce buyer hesitation',
                  'Collect 10+ genuine customer testimonials with permission to share',
                  'Aim for 5–8 orders per day by end of Month 2',
                ],
              },
              {
                phase: 'Month 3: Scale',
                borderClass: 'border-green-200',
                headerClass: 'bg-green-500',
                bodyClass: 'bg-green-50',
                icon: '📈',
                tasks: [
                  'Launch a loyalty/referral program (e.g., "Refer a friend, get 10% off")',
                  'Introduce gift wrapping & personalized notes for weddings/Eid/occasions',
                  'Expand delivery to Nyali, Likoni, Mtwapa',
                  'Partner with a local influencer (micro: 5K–30K followers) for sponsored posts',
                  'Analyze which products sell most — double down on those',
                  'Target 15–25 orders per day and start planning staffing',
                ],
              },
            ].map(phase => (
              <div key={phase.phase} className={`border ${phase.borderClass} rounded-xl overflow-hidden`}>
                <div className={`${phase.headerClass} text-white px-4 py-3 flex items-center gap-2`}>
                  <span className="text-lg">{phase.icon}</span>
                  <span className="font-black text-sm">{phase.phase}</span>
                </div>
                <div className={`${phase.bodyClass} p-4`}>
                  <ul className="space-y-1.5">
                    {phase.tasks.map((task, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5 font-bold flex-shrink-0">✓</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final verdict */}
        <section className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-black mb-4">🏆 Final Verdict</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold mb-3 text-amber-100">Why This Will Work in Mombasa 🌴</h3>
              <ul className="space-y-2 text-sm">
                {[
                  'Coastal Kenyans have a culturally embedded love for fragrances',
                  'Online delivery is now normalised post-COVID',
                  'M-Pesa removes the #1 barrier to online shopping',
                  'No dominant local online perfume retailer yet — you\'ll be first',
                  'Low startup cost compared to a physical shop',
                  'WhatsApp & Instagram are essentially free distribution channels',
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-200">✅</span>
                    <span className="text-white/90">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-3 text-amber-100">Critical Success Factors ⚠️</h3>
              <ul className="space-y-2 text-sm">
                {[
                  'Product authenticity is non-negotiable — one scandal kills the brand',
                  'Consistent, fast delivery within promised time windows',
                  'Strong visual social media presence (smell can\'t be shown, but lifestyle can)',
                  'Personal touch: respond to WhatsApp messages within 30 min',
                  'Specialize in Mombasa-relevant scents (oud, bakhoor, non-alcoholic)',
                  'Build a community, not just customers — loyalty drives repeat orders',
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-200">⚡</span>
                    <span className="text-white/90">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-white/20 rounded-xl p-4 border border-white/30">
            <p className="text-sm font-semibold text-center">
              💎 <em>Bottom line: This is a <strong>viable, profitable business</strong> with a clear path to KES 200,000+ monthly revenue within 6-12 months
              if executed with discipline, authenticity, and strong digital marketing. Start small, learn fast, and scale what works.</em>
            </p>
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={() => onNavigate('shop')}
              className="bg-white text-amber-600 font-black px-6 py-3 rounded-xl hover:bg-amber-50 transition-colors shadow-lg"
            >
              🛍️ View the Store →
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

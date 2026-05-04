import { motion } from 'framer-motion';

const features = [
  {
    emoji: '🚚',
    title: 'Fast Delivery',
    description: 'Same-day delivery in Dhaka. Next-day for all other cities across Bangladesh.',
    color: 'from-blue-50 to-indigo-50 border-blue-100',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    emoji: '🌿',
    title: 'Fresh Products',
    description: 'Sourced directly from farms and trusted suppliers. Freshness guaranteed or your money back.',
    color: 'from-green-50 to-emerald-50 border-green-100',
    badge: 'bg-green-100 text-green-700',
  },
  {
    emoji: '↩️',
    title: 'Easy Returns',
    description: 'Not satisfied? Return within 7 days, no questions asked. Full refund, guaranteed.',
    color: 'from-orange-50 to-amber-50 border-orange-100',
    badge: 'bg-orange-100 text-orange-700',
  },
  {
    emoji: '🔒',
    title: 'Secure Payment',
    description: 'SSL-encrypted checkout with bKash, cards & COD. Your data is always safe with us.',
    color: 'from-purple-50 to-violet-50 border-purple-100',
    badge: 'bg-purple-100 text-purple-700',
  },
];

export function WhyShopWithUs() {
  return (
    <section className="py-10">
      <div className="container">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground">Why Shop With Us?</h2>
          <p className="mt-2 text-muted-foreground">
            We make grocery shopping simple, affordable and delightful.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`flex flex-col gap-3 rounded-2xl border bg-gradient-to-br p-6 ${f.color}`}
            >
              <div className={`inline-flex w-fit items-center justify-center rounded-xl px-3 py-2 text-3xl ${f.badge}`}>
                {f.emoji}
              </div>
              <h3 className="text-base font-bold text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

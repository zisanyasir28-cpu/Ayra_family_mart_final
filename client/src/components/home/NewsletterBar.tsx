import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export function NewsletterBar() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    // Stub: simulate API call
    setTimeout(() => {
      setLoading(false);
      setEmail('');
      toast.success('🎉 You\'re subscribed! Check your inbox for a welcome discount.');
    }, 800);
  }

  return (
    <section className="bg-gradient-to-r from-green-700 to-teal-600 py-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-6 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              Get exclusive deals in your inbox
            </h2>
            <p className="mt-1 text-white/80">
              Subscribe and get <strong>৳100 off</strong> your first order + weekly deals.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 rounded-xl border-0 bg-white/20 px-4 py-3 text-sm text-white placeholder:text-white/60 backdrop-blur-sm focus:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-green-700 shadow transition hover:bg-white/90 active:scale-95 disabled:opacity-70"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-green-700 border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Subscribe
            </button>
          </form>

          <p className="text-xs text-white/60">
            No spam, ever. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

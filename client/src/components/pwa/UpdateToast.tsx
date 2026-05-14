import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

// ─── Component ────────────────────────────────────────────────────────────────

export function UpdateToast() {
  const [dismissed, setDismissed] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl) {
      // Periodic update check (every hour while app is open)
      const interval = setInterval(() => {
        if (navigator.onLine) {
          fetch(swUrl, { cache: 'no-store' }).catch(() => {});
        }
      }, 60 * 60 * 1000);
      return () => clearInterval(interval);
    },
  });

  useEffect(() => {
    if (needRefresh) setDismissed(false);
  }, [needRefresh]);

  function handleReload() {
    void updateServiceWorker(true);
  }

  function handleDismiss() {
    setDismissed(true);
    setNeedRefresh(false);
  }

  const visible = needRefresh && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{    y: -80, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="fixed inset-x-3 top-3 z-[60] flex items-center gap-3 rounded-2xl border border-sage/30 bg-surface px-4 py-3 shadow-lift sm:left-auto sm:right-4 sm:max-w-sm"
          style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sage/20 text-sage">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-bold text-cream">New version available</p>
            <p className="text-[11px] text-cream/55">Reload to update the app</p>
          </div>
          <button
            onClick={handleReload}
            className="rounded-full bg-sage px-3.5 py-1.5 text-xs font-bold text-bg transition hover:bg-sage/90"
          >
            Reload
          </button>
          <button
            onClick={handleDismiss}
            className="flex h-8 w-8 items-center justify-center rounded-full text-cream/55 transition hover:bg-cream/5 hover:text-cream"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

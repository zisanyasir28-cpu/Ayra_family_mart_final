import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

const VISIT_COUNT_KEY  = 'ayra:visitCount';
const PROMPT_SHOWN_KEY = 'ayra:pwaPromptDismissed';
const MIN_VISITS       = 3;

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible,  setVisible]  = useState(false);

  // Increment visit count once on mount
  useEffect(() => {
    const v = parseInt(localStorage.getItem(VISIT_COUNT_KEY) ?? '0', 10) + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(v));
  }, []);

  useEffect(() => {
    // Hide if already installed
    if (window.matchMedia?.('(display-mode: standalone)').matches) return;
    if (localStorage.getItem(PROMPT_SHOWN_KEY) === '1') return;

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      const ev = e as BeforeInstallPromptEvent;
      setDeferred(ev);

      const visits = parseInt(localStorage.getItem(VISIT_COUNT_KEY) ?? '0', 10);
      if (visits >= MIN_VISITS) {
        setTimeout(() => setVisible(true), 2000); // small delay to not jar first paint
      }
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  async function handleInstall() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'accepted') {
      localStorage.setItem(PROMPT_SHOWN_KEY, '1');
    }
    setVisible(false);
    setDeferred(null);
  }

  function handleDismiss() {
    localStorage.setItem(PROMPT_SHOWN_KEY, '1');
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && deferred && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{    y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="fixed inset-x-3 bottom-3 z-50 flex items-center gap-3 rounded-2xl border border-saffron/30 bg-surface px-4 py-3 shadow-lift sm:left-auto sm:right-4 sm:max-w-sm"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-saffron text-bg">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-bold text-cream">Install Ayra</p>
            <p className="text-[11px] text-cream/55">Faster browsing & offline access</p>
          </div>
          <button
            onClick={handleInstall}
            className="rounded-full bg-saffron px-3.5 py-1.5 text-xs font-bold text-bg transition hover:bg-saffron/90"
          >
            Install
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

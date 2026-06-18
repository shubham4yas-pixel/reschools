import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/store/useStore';
import { BookOpen, LogOut } from 'lucide-react';
import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { BrandLogo } from "@/components/BrandLogo";
import { DashboardRail, DashboardNavMobile, NavItem } from "@/components/DashboardNav";

interface DashboardNavConfig {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

const AppLayout = ({ children, title, nav }: { children: ReactNode; title: string; nav?: DashboardNavConfig }) => {
  const { role, signOut } = useAuth();
  const { schoolName, schoolNameLoading } = useStore();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-display font-bold text-lg tracking-tight leading-tight">
                <BrandLogo />
              </span>
              <span className="text-xs font-medium text-muted-foreground capitalize leading-tight">
                {role ? `${role} Dashboard` : 'Dashboard'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
            />

            {/* Dialog */}
            <motion.div
              className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="p-6 text-center">
                {/* Icon */}
                <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <LogOut className="w-6 h-6 text-destructive" />
                </div>

                <h2 className="text-lg font-display font-bold text-foreground mb-1">
                  Logout
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Are you sure you want to logout? You'll need to sign in again to access your dashboard.
                </p>
              </div>

              {/* Actions */}
              <div className="flex border-t border-border">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <div className="w-px bg-border" />
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    signOut();
                  }}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                >
                  Yes, Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {nav && <DashboardRail items={nav.items} activeId={nav.activeId} onSelect={nav.onSelect} />}

      <main className={nav ? 'lg:pl-[76px]' : ''}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-display font-bold tracking-tight">{title}</h1>
            </div>
            {nav && <DashboardNavMobile items={nav.items} activeId={nav.activeId} onSelect={nav.onSelect} />}
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;

import { ReactNode, useEffect, useState } from 'react';

interface KeepAliveProps {
  active: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Keeps a tab panel mounted once it has been opened, hiding it (instead of
 * unmounting) when another tab is active. This means switching tabs no longer
 * throws away component state — scroll position, filters, selections and
 * partially filled inputs all survive — so the app stops "refreshing itself"
 * every time the user moves between tabs.
 *
 * Panels mount lazily: nothing renders until the tab is first visited.
 *
 * When a panel is revealed we fire a `resize` event so charts built on
 * recharts' ResponsiveContainer re-measure (a hidden container reports a width
 * of 0, which would otherwise leave the chart blank until the next resize).
 */
const KeepAlive = ({ active, children, className }: KeepAliveProps) => {
  const [hasMounted, setHasMounted] = useState(active);

  useEffect(() => {
    if (active && !hasMounted) setHasMounted(true);
  }, [active, hasMounted]);

  useEffect(() => {
    if (!active || !hasMounted) return;
    const id = window.setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
    return () => window.clearTimeout(id);
  }, [active, hasMounted]);

  if (!hasMounted) return null;

  return <div className={active ? className : 'hidden'}>{children}</div>;
};

export default KeepAlive;

import { ReactNode } from 'react';

export interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface NavProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * Collapsed icon rail pinned to the far-left edge of the screen (desktop only).
 *
 * It is `position: fixed`, so it stays in place while the page scrolls. By
 * default it shows only the icons in a narrow navy strip; hovering (or moving
 * keyboard focus into it) expands it to reveal the labels, overlaying the
 * content rather than reflowing it.
 *
 * Active item = solid white tab with navy icon/label (matches the reference
 * design); inactive items = muted white-on-navy with a subtle hover.
 */
export const DashboardRail = ({ items, activeId, onSelect }: NavProps) => (
  <aside
    aria-label="Dashboard menu"
    className="group fixed left-0 top-[72px] bottom-0 z-40 hidden w-[76px] flex-col overflow-hidden bg-primary transition-[width] duration-300 ease-out hover:w-64 focus-within:w-64 hover:shadow-2xl lg:flex"
  >
    <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto overflow-x-hidden px-3 py-4">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            onClick={(e) => {
              onSelect(item.id);
              // Drop focus after a click so the rail collapses on mouse-leave.
              // Without this, :focus-within keeps it expanded until you click
              // elsewhere. Keyboard users still expand it by tabbing in.
              e.currentTarget.blur();
            }}
            aria-current={active ? 'page' : undefined}
            title={item.label}
            className={`flex h-12 shrink-0 items-center gap-3 rounded-xl pl-[15px] pr-3 transition-colors [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0 ${
              active
                ? 'bg-white font-bold text-primary shadow-sm'
                : 'text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground'
            }`}
          >
            {item.icon}
            <span className="whitespace-nowrap text-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  </aside>
);

/**
 * Horizontal, scrollable fallback for small screens, where a hover-to-expand
 * rail isn't usable. Keeps the original pill styling.
 */
export const DashboardNavMobile = ({ items, activeId, onSelect }: NavProps) => (
  <nav aria-label="Dashboard menu" className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
    {items.map((item) => {
      const active = item.id === activeId;
      return (
        <button
          key={item.id}
          onClick={() => onSelect(item.id)}
          aria-current={active ? 'page' : undefined}
          className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
            active
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
              : 'bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      );
    })}
  </nav>
);

export default DashboardRail;

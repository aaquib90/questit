import { createContext, useContext, useMemo, useState } from 'react';

import { cn } from '@/lib/utils.js';

const AccordionContext = createContext(null);
const AccordionItemContext = createContext(null);

export function Accordion({ type = 'single', collapsible = false, defaultValue = null, className, children }) {
  const [openValue, setOpenValue] = useState(defaultValue ?? null);

  const value = useMemo(
    () => ({
      openValue,
      setOpenValue,
      type,
      collapsible
    }),
    [openValue, type, collapsible]
  );

  return (
    <AccordionContext.Provider value={value}>
      <div className={cn('flex flex-col divide-y divide-border rounded-xl border border-border/60 bg-card', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, className, children }) {
  return (
    <AccordionItemContext.Provider value={{ itemValue: value }}>
      <div className={cn('flex flex-col', className)}>{children}</div>
    </AccordionItemContext.Provider>
  );
}

export function AccordionTrigger({ children, className }) {
  const accordion = useContext(AccordionContext);
  const item = useContext(AccordionItemContext);

  if (!accordion || !item) {
    throw new Error('AccordionTrigger must be used within AccordionItem inside Accordion');
  }

  const isOpen = accordion.openValue === item.itemValue;

  const toggle = () => {
    if (accordion.type === 'single') {
      if (isOpen) {
        if (accordion.collapsible) {
          accordion.setOpenValue(null);
        }
      } else {
        accordion.setOpenValue(item.itemValue);
      }
    } else {
      accordion.setOpenValue((prev) => {
        const set = new Set(Array.isArray(prev) ? prev : []);
        if (set.has(item.itemValue)) {
          set.delete(item.itemValue);
        } else {
          set.add(item.itemValue);
        }
        return Array.from(set);
      });
    }
  };

  const indicator = isOpen ? '▾' : '▸';

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-none bg-transparent px-4 py-3 text-left text-sm font-medium text-foreground transition hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
      aria-expanded={isOpen}
    >
      <span>{children}</span>
      <span className="text-muted-foreground transition">{indicator}</span>
    </button>
  );
}

export function AccordionContent({ children, className }) {
  const accordion = useContext(AccordionContext);
  const item = useContext(AccordionItemContext);

  if (!accordion || !item) {
    throw new Error('AccordionContent must be used within AccordionItem inside Accordion');
  }

  let isOpen = false;
  if (accordion.type === 'single') {
    isOpen = accordion.openValue === item.itemValue;
  } else {
    const list = Array.isArray(accordion.openValue) ? accordion.openValue : [];
    isOpen = list.includes(item.itemValue);
  }

  if (!isOpen) {
    return null;
  }

  return <div className={cn('px-4 pb-4 text-sm text-muted-foreground', className)}>{children}</div>;
}

export default {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
};

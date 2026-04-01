"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionContextValue {
  openItems: Set<string>;
  toggle: (value: string) => void;
  type: "single" | "multiple";
}

const AccordionContext = React.createContext<AccordionContextValue>({
  openItems: new Set(),
  toggle: () => {},
  type: "single",
});

interface AccordionProps {
  type?: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string;
  className?: string;
  children: React.ReactNode;
}

function Accordion({ type = "single", defaultValue, className, children }: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(
    defaultValue ? new Set([defaultValue]) : new Set()
  );

  const toggle = React.useCallback(
    (value: string) => {
      setOpenItems((prev) => {
        const next = new Set(prev);
        if (next.has(value)) {
          next.delete(value);
        } else {
          if (type === "single") next.clear();
          next.add(value);
        }
        return next;
      });
    },
    [type]
  );

  return (
    <AccordionContext.Provider value={{ openItems, toggle, type }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

function AccordionItem({ value, className, children }: AccordionItemProps) {
  return (
    <div className={cn("border-b", className)} data-value={value}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<{ itemValue?: string }>, { itemValue: value });
        }
        return child;
      })}
    </div>
  );
}

interface AccordionTriggerProps {
  className?: string;
  children: React.ReactNode;
  itemValue?: string;
}

function AccordionTrigger({ className, children, itemValue }: AccordionTriggerProps) {
  const { openItems, toggle } = React.useContext(AccordionContext);
  const isOpen = itemValue ? openItems.has(itemValue) : false;

  return (
    <button
      type="button"
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all text-left w-full [&>svg]:transition-transform",
        isOpen && "[&>svg]:rotate-180",
        className
      )}
      onClick={() => itemValue && toggle(itemValue)}
      aria-expanded={isOpen}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-gray-500" />
    </button>
  );
}

interface AccordionContentProps {
  className?: string;
  children: React.ReactNode;
  itemValue?: string;
}

function AccordionContent({ className, children, itemValue }: AccordionContentProps) {
  const { openItems } = React.useContext(AccordionContext);
  const isOpen = itemValue ? openItems.has(itemValue) : false;

  if (!isOpen) return null;

  return (
    <div className={cn("overflow-hidden pb-4 pt-0 text-sm", className)}>
      {children}
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

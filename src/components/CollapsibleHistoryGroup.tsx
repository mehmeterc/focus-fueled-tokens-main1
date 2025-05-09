import React, { useState } from 'react';

interface CollapsibleHistoryGroupProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function CollapsibleHistoryGroup({ title, children, defaultOpen = false }: CollapsibleHistoryGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-4">
      <button
        className="w-full flex justify-between items-center px-4 py-2 bg-antiapp-teal/10 hover:bg-antiapp-teal/20 rounded font-semibold text-antiapp-purple focus:outline-none"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <svg
          className={`h-5 w-5 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {open && <div className="pt-2">{children}</div>}
    </div>
  );
}

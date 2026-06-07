'use client';

import { useEffect, useState } from 'react';

export type ToastKind = 'success' | 'error' | 'info';

export type ToastMessage = {
  id: number;
  kind: ToastKind;
  text: string;
};

let counter = 0;
type Listener = (msg: ToastMessage) => void;
const listeners = new Set<Listener>();

export function toast(text: string, kind: ToastKind = 'success') {
  const msg: ToastMessage = { id: ++counter, kind, text };
  listeners.forEach((l) => l(msg));
}

export function ToastViewport() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener: Listener = (msg) => {
      setMessages((cur) => [...cur, msg]);
      setTimeout(() => {
        setMessages((cur) => cur.filter((m) => m.id !== msg.id));
      }, 3000);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {messages.map((m) => (
        <div
          key={m.id}
          className={
            'animate-toast-in pointer-events-auto min-w-[220px] rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ' +
            (m.kind === 'success'
              ? 'bg-[#16A34A]'
              : m.kind === 'error'
                ? 'bg-[#DC2626]'
                : 'bg-[#2563EB]')
          }
        >
          {m.text}
        </div>
      ))}
    </div>
  );
}

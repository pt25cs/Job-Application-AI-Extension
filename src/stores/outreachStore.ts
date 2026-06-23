import { create } from 'zustand';
import type { Outreach } from '@/types/outreach';

interface OutreachStore {
  outreachItems: Outreach[];
  isDrafting: boolean;
  isSending: boolean;
  setItems: (items: Outreach[]) => void;
  updateItem: (id: string, patch: Partial<Outreach>) => void;
  addItem: (item: Outreach) => void;
  setDrafting: (v: boolean) => void;
  setSending: (v: boolean) => void;
  reset: () => void;
}

export const useOutreachStore = create<OutreachStore>((set) => ({
  outreachItems: [],
  isDrafting: false,
  isSending: false,
  setItems: (items) => set({ outreachItems: items }),
  updateItem: (id, patch) =>
    set((s) => ({
      outreachItems: s.outreachItems.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    })),
  addItem: (item) => set((s) => ({ outreachItems: [...s.outreachItems, item] })),
  setDrafting: (v) => set({ isDrafting: v }),
  setSending: (v) => set({ isSending: v }),
  reset: () => set({ outreachItems: [], isDrafting: false, isSending: false }),
}));

import { create } from 'zustand';
import type { Contact } from '@/types/contacts';

interface ContactsStore {
  contacts: Contact[];
  isDiscovering: boolean;
  discoveryProgress: string;
  setContacts: (contacts: Contact[]) => void;
  setDiscovering: (v: boolean) => void;
  setProgress: (msg: string) => void;
  reset: () => void;
}

export const useContactsStore = create<ContactsStore>((set) => ({
  contacts: [],
  isDiscovering: false,
  discoveryProgress: '',
  setContacts: (contacts) => set({ contacts }),
  setDiscovering: (v) => set({ isDiscovering: v }),
  setProgress: (msg) => set({ discoveryProgress: msg }),
  reset: () => set({ contacts: [], isDiscovering: false, discoveryProgress: '' }),
}));

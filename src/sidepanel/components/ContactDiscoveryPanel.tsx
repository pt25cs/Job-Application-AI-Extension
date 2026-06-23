import { useEffect } from 'react';
import { useContactsStore } from '@/stores/contactsStore';
import { useAuthStore } from '@/stores/authStore';
import { discoverContacts, fetchContacts } from '@/lib/contacts';
import { ContactCard } from './ContactCard';

interface Props {
  applicationId: string;
  company: string;
}

export function ContactDiscoveryPanel({ applicationId, company }: Props) {
  const { user } = useAuthStore();
  const { contacts, isDiscovering, discoveryProgress, setContacts, setDiscovering, setProgress } = useContactsStore();

  useEffect(() => {
    if (!user) return;
    fetchContacts(user.id, applicationId)
      .then(setContacts)
      .catch(console.error);
  }, [user?.id, applicationId]);

  async function handleDiscover() {
    if (!user) return;
    setDiscovering(true);
    setProgress('Searching Apollo.io…');
    try {
      const res = await discoverContacts({
        userId: user.id,
        applicationId,
        company,
        userUniversity: undefined,
      });
      setContacts(res.contacts);
      setProgress(`Found ${res.totalFound} contacts (${res.verifiedCount} verified, ${res.alumniCount} alumni)`);
    } catch (err) {
      setProgress(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDiscovering(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Contacts at {company}</h3>
        <button
          onClick={handleDiscover}
          disabled={isDiscovering}
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isDiscovering ? 'Discovering…' : 'Discover Contacts'}
        </button>
      </div>

      {discoveryProgress && (
        <p className="text-xs text-gray-500">{discoveryProgress}</p>
      )}

      {contacts.length === 0 && !isDiscovering && (
        <p className="text-xs text-gray-400 text-center py-4">No contacts yet. Click "Discover Contacts" to find recruiters and alumni.</p>
      )}

      <div className="flex flex-col gap-2">
        {contacts.map((c) => (
          <ContactCard key={c.id} contact={c} />
        ))}
      </div>
    </div>
  );
}

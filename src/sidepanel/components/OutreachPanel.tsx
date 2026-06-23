import { useEffect, useState } from 'react';
import { useOutreachStore } from '@/stores/outreachStore';
import { useContactsStore } from '@/stores/contactsStore';
import { useAuthStore } from '@/stores/authStore';
import { draftOutreach, sendOutreach, fetchOutreach } from '@/lib/outreach';
import { supabase } from '@/lib/supabase';
import { OutreachDraftCard } from './OutreachDraftCard';

interface Props {
  applicationId?: string;
}

export function OutreachPanel({ applicationId }: Props) {
  const { user } = useAuthStore();
  const { contacts } = useContactsStore();
  const { outreachItems, isDrafting, setItems, updateItem, addItem, setDrafting } = useOutreachStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchOutreach(user.id, applicationId).then(setItems).catch(console.error);
  }, [user?.id, applicationId]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const filter = applicationId
      ? `application_id=eq.${applicationId}`
      : `user_id=eq.${user.id}`;
    const channel = supabase
      .channel(`outreach:${applicationId ?? 'all'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'outreach', filter },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            addItem(payload.new as Parameters<typeof addItem>[0]);
          } else if (payload.eventType === 'UPDATE') {
            updateItem(payload.new.id as string, payload.new as Parameters<typeof updateItem>[1]);
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, applicationId]);

  async function handleDraftAll() {
    if (!user) return;
    const verifiedContacts = contacts.filter((c) => c.email_verified && c.email);
    if (!verifiedContacts.length) return;
    setDrafting(true);
    setError(null);
    try {
      await draftOutreach({
        userId: user.id,
        applicationId,
        contactIds: verifiedContacts.map((c) => c.id),
      });
      const updated = await fetchOutreach(user.id, applicationId);
      setItems(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to draft emails');
    } finally {
      setDrafting(false);
    }
  }

  async function handleSend(outreachId: string) {
    setError(null);
    try {
      const result = await sendOutreach(outreachId);
      updateItem(outreachId, { status: 'sent', resend_message_id: result.resend_message_id });
      chrome.runtime.sendMessage({
        type: 'OUTREACH_STATUS',
        payload: { action: 'schedule_followup', outreachId },
        timestamp: Date.now(),
      }).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    }
  }

  const contactMap = Object.fromEntries(contacts.map((c) => [c.id, c.full_name]));
  const sent = outreachItems.filter((o) => o.status === 'sent').length;
  const pending = outreachItems.filter((o) => ['drafted', 'approved'].includes(o.status)).length;
  const bounced = outreachItems.filter((o) => o.status === 'bounced').length;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Outreach</h3>
        <button
          onClick={handleDraftAll}
          disabled={isDrafting}
          className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isDrafting ? 'Drafting…' : 'Draft All'}
        </button>
      </div>

      {outreachItems.length > 0 && (
        <div className="flex gap-3 text-xs text-gray-500">
          <span className="text-green-600">{sent} sent</span>
          <span>{pending} pending</span>
          {bounced > 0 && <span className="text-red-500">{bounced} bounced</span>}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-xs text-red-600">{error}</div>
      )}

      {outreachItems.length === 0 && !isDrafting && (
        <p className="text-xs text-gray-400 text-center py-4">No drafts yet. Click "Draft All" to generate emails for verified contacts.</p>
      )}

      <div className="flex flex-col gap-2">
        {outreachItems.map((o) => (
          <OutreachDraftCard
            key={o.id}
            outreach={o}
            contactName={o.contact_id ? contactMap[o.contact_id] : undefined}
            onSend={handleSend}
          />
        ))}
      </div>
    </div>
  );
}

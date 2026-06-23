import { useState } from 'react';
import type { Outreach } from '@/types/outreach';
import { updateOutreachStatus, updateOutreachBody } from '@/lib/outreach';
import { useOutreachStore } from '@/stores/outreachStore';

const STATUS_COLORS: Record<string, string> = {
  drafted: 'bg-gray-100 text-gray-600',
  approved: 'bg-blue-100 text-blue-700',
  sending: 'bg-yellow-100 text-yellow-700',
  sent: 'bg-green-100 text-green-700',
  follow_up_scheduled: 'bg-purple-100 text-purple-700',
  follow_up_sent: 'bg-purple-100 text-purple-700',
  replied: 'bg-emerald-100 text-emerald-700',
  bounced: 'bg-red-100 text-red-700',
};

interface Props {
  outreach: Outreach;
  contactName?: string;
  onSend: (id: string) => void;
}

export function OutreachDraftCard({ outreach, contactName, onSend }: Props) {
  const { updateItem } = useOutreachStore();
  const [subject, setSubject] = useState(outreach.email_subject ?? '');
  const [body, setBody] = useState(outreach.email_body ?? '');
  const [saving, setSaving] = useState(false);

  async function handleApprove() {
    setSaving(true);
    try {
      await updateOutreachBody(outreach.id, subject, body);
      await updateOutreachStatus(outreach.id, 'approved');
      updateItem(outreach.id, { status: 'approved', email_subject: subject, email_body: body });
    } finally {
      setSaving(false);
    }
  }

  async function handleDiscard() {
    await updateOutreachStatus(outreach.id, 'drafted');
    updateItem(outreach.id, { status: 'drafted' });
  }

  const statusClass = STATUS_COLORS[outreach.status] ?? 'bg-gray-100 text-gray-600';
  const canEdit = ['drafted', 'approved'].includes(outreach.status);
  const canSend = outreach.status === 'approved';

  return (
    <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2 bg-white">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-800">{contactName ?? 'Contact'}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusClass}`}>
          {outreach.status.replace(/_/g, ' ')}
        </span>
      </div>

      {canEdit ? (
        <>
          <input
            className="text-xs border border-gray-200 rounded px-2 py-1 w-full"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
          />
          <textarea
            className="text-xs border border-gray-200 rounded px-2 py-1 w-full resize-none"
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Email body"
          />
        </>
      ) : (
        <>
          <p className="text-xs text-gray-500 font-medium">{outreach.email_subject}</p>
          <p className="text-xs text-gray-600 whitespace-pre-wrap line-clamp-4">{outreach.email_body}</p>
        </>
      )}

      {canEdit && (
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={saving}
            className="flex-1 text-xs bg-blue-600 text-white py-1.5 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Approve
          </button>
          {canSend && (
            <button
              onClick={() => onSend(outreach.id)}
              className="flex-1 text-xs bg-green-600 text-white py-1.5 rounded hover:bg-green-700"
            >
              Send
            </button>
          )}
          <button
            onClick={handleDiscard}
            className="text-xs text-gray-500 px-2 py-1.5 rounded hover:bg-gray-100"
          >
            Discard
          </button>
        </div>
      )}
    </div>
  );
}

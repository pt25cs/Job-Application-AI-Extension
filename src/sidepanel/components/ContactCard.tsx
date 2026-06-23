import type { Contact } from '@/types/contacts';

interface Props {
  contact: Contact;
}

export function ContactCard({ contact }: Props) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-1 bg-white">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-sm text-gray-900">{contact.full_name}</p>
          <p className="text-xs text-gray-500">{contact.title}{contact.company ? ` · ${contact.company}` : ''}</p>
        </div>
        {contact.is_alumni && (
          <span className="shrink-0 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            Alumni
          </span>
        )}
      </div>

      {contact.email && (
        <p className="text-xs text-gray-600 flex items-center gap-1">
          <span>{contact.email}</span>
          {contact.email_verified && (
            <span className="text-green-600" title="Verified">✓</span>
          )}
          {contact.email_confidence != null && (
            <span className="text-gray-400">({contact.email_confidence}%)</span>
          )}
        </p>
      )}

      {contact.linkedin_url && (
        <a
          href={contact.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          LinkedIn →
        </a>
      )}
    </div>
  );
}

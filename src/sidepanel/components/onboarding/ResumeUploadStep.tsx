import { useRef, useState } from 'react';
import type { WizardData } from './OnboardingWizard';
import { Button } from '@/sidepanel/components/ui/button';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

interface Props {
  data: WizardData;
  onChange: (partial: Partial<WizardData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ResumeUploadStep({ data, onChange, onNext, onBack }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validate = (file: File): string | null => {
    if (file.type !== 'application/pdf') return 'Only PDF files are supported';
    if (file.size > MAX_SIZE) return 'File must be under 10 MB';
    return null;
  };

  const handleFile = (file: File) => {
    const err = validate(file);
    if (err) { setError(err); return; }
    setError(null);
    onChange({ resumeFile: file });
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Upload Resume</h2>
      <p className="text-sm text-gray-500">Upload your base resume as a PDF (max 10 MB). You can skip this step.</p>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300'
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onInputChange}
        />
        {data.resumeFile ? (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-800">{data.resumeFile.name}</p>
            <p className="text-xs text-gray-500">{(data.resumeFile.size / 1024).toFixed(0)} KB</p>
            <button
              className="text-xs text-red-500 hover:underline"
              onClick={(e) => { e.stopPropagation(); onChange({ resumeFile: null }); setError(null); }}
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Drag & drop your PDF here, or click to browse</p>
            <p className="text-xs text-gray-400">PDF only · max 10 MB</p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onBack}>Back</Button>
        <Button className="flex-1" onClick={onNext}>
          {data.resumeFile ? 'Next' : 'Skip'}
        </Button>
      </div>
    </div>
  );
}

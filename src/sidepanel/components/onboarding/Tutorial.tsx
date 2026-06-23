import { useState, useEffect } from 'react';

const TUTORIAL_KEY = 'autoapply:tutorial_seen';

const STEPS = [
  {
    title: 'Job Detection',
    description: 'AutoApply automatically detects job listings on Greenhouse, Lever, Workday, and more. A banner appears when a job is found.',
    emoji: '🎯',
  },
  {
    title: 'ATS Optimization',
    description: 'Click "Optimize Resume" to tailor your resume to the job description using GPT-4o. Your ATS score improves with each iteration.',
    emoji: '📈',
  },
  {
    title: 'Contact Discovery',
    description: 'Click "Discover Contacts" to find recruiters and alumni at the target company via Apollo.io and Proxycurl.',
    emoji: '🔍',
  },
  {
    title: 'Outreach Drafting',
    description: 'Generate personalized cold emails for each contact. Review, edit, and approve drafts before sending.',
    emoji: '✉️',
  },
  {
    title: 'Application Dashboard',
    description: 'Track all your applications in a pipeline view. Filter, sort, and update statuses in real time.',
    emoji: '📋',
  },
  {
    title: 'Analytics',
    description: 'See your interview rate, ATS score distribution, and outreach funnel to refine your job search strategy.',
    emoji: '📊',
  },
];

interface Props {
  onDone?: () => void;
}

export function Tutorial({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(TUTORIAL_KEY);
    if (!seen) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    setVisible(false);
    onDone?.();
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      dismiss();
    }
  }

  if (!visible) return null;

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl p-6 mx-4 max-w-xs w-full flex flex-col gap-4">
        <div className="text-center">
          <span className="text-4xl">{current.emoji}</span>
        </div>

        <div className="text-center">
          <p className="font-semibold text-gray-900 text-sm">{current.title}</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{current.description}</p>
        </div>

        <div className="flex justify-center gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === step ? 'bg-blue-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={dismiss}
            className="flex-1 text-xs text-gray-500 py-2 rounded-lg hover:bg-gray-50"
          >
            Skip
          </button>
          <button
            onClick={next}
            className="flex-1 text-xs bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            {step < STEPS.length - 1 ? 'Next →' : 'Get Started'}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Returns true if the tutorial has not been seen yet */
export function shouldShowTutorial(): boolean {
  return !localStorage.getItem(TUTORIAL_KEY);
}

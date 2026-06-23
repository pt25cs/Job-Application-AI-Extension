import '@testing-library/jest-dom';

// Mock chrome APIs
const chromeMock = {
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    },
  },
  runtime: {
    sendMessage: vi.fn().mockResolvedValue({ success: true }),
    onMessage: { addListener: vi.fn() },
  },
  identity: {
    getRedirectURL: vi.fn().mockReturnValue('https://test.chromiumapp.org/'),
    launchWebAuthFlow: vi.fn(),
  },
  sidePanel: { open: vi.fn().mockResolvedValue(undefined) },
  alarms: {
    create: vi.fn(),
    clear: vi.fn(),
    onAlarm: { addListener: vi.fn() },
  },
  action: { onClicked: { addListener: vi.fn() } },
};

(globalThis as unknown as { chrome: typeof chromeMock }).chrome = chromeMock;

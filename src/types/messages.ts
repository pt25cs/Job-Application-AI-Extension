export type MessageType =
  | 'DETECT_ATS_PLATFORM'
  | 'EXTRACT_JOB_DESCRIPTION'
  | 'AUTOFILL_FORM'
  | 'GET_AUTH_SESSION'
  | 'OPEN_SIDE_PANEL'
  | 'OPTIMIZATION_STATUS'
  | 'OUTREACH_STATUS';

export interface ExtensionMessage<T = unknown> {
  type: MessageType;
  payload: T;
  tabId?: number;
  timestamp: number;
}

export interface ExtensionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

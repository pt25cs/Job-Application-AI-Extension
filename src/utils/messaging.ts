import { ExtensionMessage, ExtensionResponse } from '@/types/messages';

export async function sendMessage<T>(
  message: Omit<ExtensionMessage, 'timestamp'>
): Promise<ExtensionResponse<T>> {
  const msg: ExtensionMessage = { ...message, timestamp: Date.now() };
  return chrome.runtime.sendMessage(msg);
}

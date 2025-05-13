import { RelayStatus } from '../containers/CreateFormNew/providers/FormBuilder/typeDefs'; // Adjust path

/**
 * @param url The WebSocket URL of the relay.
 * @param timeoutMs The timeout in milliseconds for the connection attempt.
 * @returns A promise that resolves to the RelayStatus.
 */
export const checkRelayConnection = (
  url: string,
  timeoutMs: number = 3000
): Promise<RelayStatus> => {
  return new Promise((resolve) => {
    let ws: WebSocket;
    let timeoutId: NodeJS.Timeout | undefined;

    try {
      ws = new WebSocket(url);
      const cleanup = () => {
        clearTimeout(timeoutId);
        if (ws) {
          ws.onopen = null;
          ws.onerror = null;
          ws.onclose = null;
          if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
            ws.close();
          }
        }
      };

      timeoutId = setTimeout(() => {
        cleanup();
        resolve('error');
      }, timeoutMs);

      ws.onopen = () => {
        cleanup();
        resolve('connected');
      };

      ws.onerror = (event) => {
        cleanup();
        resolve('error');
      };

    } catch (e) {
      clearTimeout(timeoutId);
      resolve('error');
    }
  });
};
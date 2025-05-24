import { Relay } from 'nostr-tools';
import { RelayStatus } from '../containers/CreateFormNew/providers/FormBuilder/typeDefs';
/**
 * @param url The WebSocket URL of the relay.
 * @param timeoutMs The timeout in milliseconds for the connection attempt.
 * @returns A promise that resolves to the RelayStatus.
 */
export const checkRelayConnection = async (
  url: string,
  timeoutMs: number = 3000
): Promise<RelayStatus> => {
  let relayInstance: Relay | undefined;
  try {
    relayInstance = new Relay(url);
    const connectPromise = relayInstance.connect();
    
    const timeoutPromise = new Promise<void>((_resolve, reject) => 
      setTimeout(() => reject(new Error('Connection timed out')), timeoutMs)
    );

    await Promise.race([connectPromise, timeoutPromise]);
    
    return 'connected';
  } catch (error) {
    return 'error';
  } finally {
    if (relayInstance) {
      try {
        await relayInstance.close();
      } catch (closeError) {
      }
    }
  }
};
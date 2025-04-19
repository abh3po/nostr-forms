import { message } from "antd";
import { nip19, nip57 } from "nostr-tools";
import type { SimplePool } from "nostr-tools";

export interface ZapInfo {
  amount: number;
  count: number;
}

export interface ProfileInfo {
  lud16?: string;
  name?: string;
  picture?: string;
  displayName?: string;
}

export const fetchProfiles = async (
  pubkeys: string[],
  pool: SimplePool,
  relays: string[]
): Promise<Map<string, ProfileInfo>> => {
  const profiles = new Map<string, ProfileInfo>();
  if (!pubkeys.length) return profiles;
  
  try {
    const events = await pool.querySync(
      relays,
      { kinds: [0], authors: pubkeys },
      { maxWait: 3000 }
    );
    
    for (const event of events) {
      try {
        const content = JSON.parse(event.content);
        profiles.set(event.pubkey, {
          lud16: content.lud16 || content.lightning,
          name: content.name,
          picture: content.picture,
          displayName: content.display_name || content.displayName
        });
      } catch (e) {
        console.error("Failed to parse profile content", e);
      }
    }
  } catch (error) {
    console.error("Error fetching profiles:", error);
  }
  
  return profiles;
};

export const fetchZapReceipts = async (
  eventIds: string[],
  pool: SimplePool,
  relays: string[]
): Promise<Map<string, ZapInfo>> => {
  const zapAmounts = new Map<string, ZapInfo>();
  if (!eventIds.length) return zapAmounts;

  try {
    const events = await pool.querySync(
      relays,
      { kinds: [9735], "#e": eventIds },
      { maxWait: 3000 }
    );

    for (const zapReceipt of events) {
      // Find the zapped event ID from the tags
      const eventTag = zapReceipt.tags.find(tag => tag[0] === 'e');
      if (!eventTag?.[1]) continue;

      const eventId = eventTag[1];

      // Extract the amount from the zap receipt
      const amountTag = zapReceipt.tags.find(tag => tag[0] === 'amount');
      if (!amountTag?.[1]) continue;

      const amount = parseInt(amountTag[1]) / 1000; // Convert msats to sats

      const currentInfo = zapAmounts.get(eventId) || { amount: 0, count: 0 };
      zapAmounts.set(eventId, {
        amount: currentInfo.amount + amount,
        count: currentInfo.count + 1
      });
    }
  } catch (error) {
    console.error("Error fetching zap receipts:", error);
  }

  return zapAmounts;
};

export const createZapRequest = async (
  recipientPubkey: string,
  lud16: string,
  eventId: string,
  formId: string,
  amount: number,
  comment = "",
  relays: string[]
): Promise<string | null> => {
  if (!lud16) return null;
  
  try {
    if (!relays?.length) {
      relays = ["wss://relay.damus.io", "wss://nos.lol"];
    }
    
    const unsignedZapRequest = nip57.makeZapRequest({
      profile: recipientPubkey,
      event: eventId,
      amount: amount * 1000,
      comment,
      relays
    });
    unsignedZapRequest.tags.push(["e", formId, "", "root"]);
    
    let signedZapRequest = unsignedZapRequest;
    const nostr = typeof window !== "undefined" ? (window as any).nostr : null;
    
    if (nostr?.signEvent) {
      try {
        signedZapRequest = await nostr.signEvent(unsignedZapRequest);
      } catch {
        message.error("You need to sign the zap request with your Nostr extension (e.g. Alby).");
        return null;
      }
    } else {
      message.error("No Nostr extension (NIP-07) found. Please install Alby or another Nostr browser extension.");
      return null;
    }
    
    // Get zap endpoint
    let zapEndpoint;
    if (lud16.includes('@')) {
      const [name, domain] = lud16.split('@');
      zapEndpoint = `https://${domain}/.well-known/lnurlp/${name}`;
    } else {
      try {
        const metadataEvent = {
          kind: 0,
          content: JSON.stringify({ lud16 }),
          created_at: Math.floor(Date.now() / 1000),
          tags: [],
          pubkey: recipientPubkey,
          id: '',
          sig: ''
        };
        zapEndpoint = await nip57.getZapEndpoint(metadataEvent);
      } catch {
        if (lud16.toLowerCase().startsWith('lnurl')) {
          try {
            const decoded = nip19.decode(lud16);
            if (decoded?.data) {
              zapEndpoint = decoded.data.toString();
            }
          } catch {}
        }
      }
    }
    
    if (!zapEndpoint) return null;
    
    // Make the zap request
    const zapRequestString = btoa(JSON.stringify(signedZapRequest));
    const callbackUrl = new URL(zapEndpoint);
    callbackUrl.searchParams.set("amount", (amount * 1000).toString());
    callbackUrl.searchParams.set("nostr", zapRequestString);
    if (comment) callbackUrl.searchParams.set("comment", comment);
    
    const response = await fetch(callbackUrl.toString());
    if (!response.ok) return null;
    
    const zapResponse = await response.json();
    
    // Handle callback scenario
    if (zapResponse.callback) {
      const callbackUrl2 = new URL(zapResponse.callback);
      callbackUrl2.searchParams.set("amount", (amount * 1000).toString());
      callbackUrl2.searchParams.set("nostr", zapRequestString);
      if (comment) callbackUrl2.searchParams.set("comment", comment);
      
      const invoiceResponse = await fetch(callbackUrl2.toString());
      if (!invoiceResponse.ok) return null;
      
      const invoiceJson = await invoiceResponse.json();
      if (!invoiceJson.pr) return null;
      
      return `lightning:${invoiceJson.pr}`;
    }
    
    // Direct PR scenario
    if (!zapResponse.pr) return null;
    return `lightning:${zapResponse.pr}`;
  } catch {
    return null;
  }
};

export const formatCompact = (num: number): string => {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(num);
};
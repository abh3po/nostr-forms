# Simple Nostr Relay

A simple [nostr](https://github.com/nostr-protocol/nostr) relay written in TypeScript and Hono.
It supports the main Nostr Protocol and stores data in an SQLite database.

# Hosted Relay (not recommended for production)

wss://nostr.inaridiy.com/

## Features

- [x] NIP-01: [Basic protocol flow description](https://github.com/nostr-protocol/nips/blob/master/01.md)
- [x] NIP-02: [Contact List and Petnames](https://github.com/nostr-protocol/nips/blob/master/02.md)
- [x] NIP-09: [Event Deletion](https://github.com/nostr-protocol/nips/blob/master/09.md)
- [x] NIP-11: [Relay Information Document](https://github.com/nostr-protocol/nips/blob/master/11.md)
- [x] NIP-26: [Event Delegation](https://github.com/nostr-protocol/nips/blob/master/26.md)
- [ ] NIP-42: [Authentication of clients to relays](https://github.com/nostr-protocol/nips/blob/master/42.md)
- [x] NIP-45: [Event Counts](https://github.com/nostr-protocol/nips/blob/master/45.md)

## Quickstart

```bash
pnpm install # Install dependencies
pnpm migrate # Create database
pnpm run dev # Start the relay
```

## License

MIT
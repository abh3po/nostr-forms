## What is Nostr?

Nostr, or "Notes and Other Stuff Transmitted by Relays," is a decentralized protocol that puts you in control of your data. 

Instead of relying on centralized servers, Nostr uses a network of relays—servers you pick—to store and share information securely. With Formstr, we tap into Nostr to let you build and share forms without middlemen. 

You sign your actions with a private key, ensuring privacy and authenticity. Your data is yours alone, and only you get to decide who you want to share it with. 

## Where are my forms stored?

Your forms are stored as encrypted events on the Nostr relays and here’s the cool part: *you* decide which relays they go to! In Formstr, every form has a relay settings section where you can pick exactly which relays to publish to, giving you full control over where your data lives. 

Each form gets its own private key for privacy and sharing, they are stored locally in your browser. If logged in, those keys are also encrypted and synced in a Nostr list event, so your forms are accessible from any device, on the relays you’ve chosen.

Formstr itself is only a UI, we store your forms on the relays of your chosing.

## Do I need to login to use Formstr?

You can explore Formstr and even create forms without logging in. But to save, manage, or share your forms securely across devices, you’ll need to log in.

To log into Formstr, you’ll need a NIP-07 browser extension like Alby or nos2x installed. These extensions manage your Nostr identity, and hold your private keys securely for you. 

On iOS you can use the "NoStore" app/extension to login on safari, while on android, browsers that support extensions (like Firefox) should be able to run regular extensions like Alby or nos2x as well.

[Here's a list of nostr extensions](https://github.com/aljazceru/awesome-nostr?tab=readme-ov-file#nip-07-browser-extensions)

## Are responses private? 

Yes! responses are encrypted with [NIP-44](https://github.com/nostr-protocol/nips/blob/master/44.md) such that only *you* and the creator of the form will have access to them, No one else can see your responses without your permission.

## Are forms private?

It's upto you, you can make a form private, public, accessible via link, or only accessible to a select few. You control who gets to access your forms.
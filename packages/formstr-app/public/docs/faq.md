## What is Nostr?

Nostr, or "Notes and Other Stuff Transmitted by Relays," is a decentralized protocol that puts you in control of your data. 

Instead of relying on centralized servers, Nostr uses a network of relays—servers you pick—to store and share information securely. With Formstr, we tap into Nostr to let you build and share forms without middlemen. 

You sign your actions with a private key, ensuring privacy and authenticity. Your data is yours alone, and only you get to decide who you want to share it with. 

## Where are my forms stored?

Your forms are stored as encrypted events on the Nostr relays and here’s the cool part: *you* decide which relays they go to! In Formstr, every form has a relay settings section where you can pick exactly which relays to publish to, giving you full control over where your data lives. 

If you’re logged in via a NIP-07 extension (like Alby or nos2x), it’ll default to your preferred relays for convenience. Not logged in? No problem—Formstr uses a default set of relays to keep things running smoothly. Each form gets its own private key for privacy and sharing, stored locally in your browser. If logged in, those keys are encrypted and synced as a Nostr list event, so your forms are accessible from any device, on the relays you’ve chosen.

## Do I need to login to use Formstr?

You can explore Formstr and even create forms without logging in. But to save, manage, or share your forms securely across devices, you’ll need to log in.

To log into Formstr, you’ll need a NIP-07 browser extension like Alby or nos2x installed. These extensions manage your Nostr identity, providing a public key (pubkey) and private key pair. Once you’ve got your extension set up, just click the "Login" button in Formstr—it’ll prompt your extension to authenticate you securely. After that, you’re in! Your forms and settings sync up via the Nostr network, ready for you to create and collaborate from any device with your extension active.

On iOS you can use the "NoStore" app/extension, while on android browsers that support extensions (like Firefox) should be able to run regular extensions like Alby or nos2x.
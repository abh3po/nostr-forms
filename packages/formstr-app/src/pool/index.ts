import { AuthPool } from "./AuthPool";
import { signerManager } from "../signer";

let pubkey: string | undefined;
let signer: ((ev: any) => Promise<any>) | undefined;

export const pool = new AuthPool({
  getPubkey: () => pubkey,
  getSigner: () => signer,
});

// initialize signer/pubkey asynchronously
export async function initPoolAuth() {
  try {
    const mySigner = await signerManager.getSigner();
    pubkey = await mySigner.getPublicKey();
    signer = async (ev) => await mySigner.signEvent(ev);
    console.log("AuthPool signer ready");
  } catch (err) {
    console.warn("AuthPool signer could not initialize:", err);
    // leave pubkey & signer undefined — AuthPool will queue publishes until available
  }
}

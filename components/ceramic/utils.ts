import type { CeramicClient } from "@ceramicnetwork/http-client";
import type { ComposeClient } from "@composedb/client";
import { DIDSession } from "did-session";
import { EthereumWebAuth, getAccountId } from "@didtools/pkh-ethereum";

// If you are relying on an injected provider this must be here otherwise you will have a type error.
declare global {
  interface Window {
    ethereum: any;
    // solflare: any;
  }
}

const threeMonths = 60 * 60 * 24 * 90;
export const CERAMIC_SESSION_KEY = "ceramic-session";

/**
 * Checks localStorage for a stored DID Session. If one is found we authenticate it, otherwise we create a new one.
 * @returns Promise<DID-Session> - The User's authenticated sesion.
 */
export const authenticateCeramic = async (
  ceramic: CeramicClient,
  compose: ComposeClient,
  provider: any,
) => {
  // authenticateEthPKH(ceramic, compose);
  const processedProvider = processProvider(provider);
  authenticateEthPKH(ceramic, compose, processedProvider);
};

const authenticateEthPKH = async (
  ceramic: CeramicClient,
  compose: ComposeClient,
  provider: any,
) => {
  const sessionStr = localStorage.getItem(CERAMIC_SESSION_KEY); // for production you will want a better place than localStorage for your sessions.
  let session;

  if (sessionStr) {
    session = await DIDSession.fromSession(sessionStr);
  }

  if (!session || (session.hasSession && session.isExpired)) {
    /** If provider isn't passed we use window.ethereum */
    if (!provider) {
      if (window.ethereum) {
        console.log("in authenticateCeramic func: You need to pass the provider as an argument in the `authenticateCeramic()` function. We will be using window.ethereum by default.");
        provider = window.ethereum;
      } else {
        console.error("ERROR in authenticateCeramic func: no provider args passed and no window.ethereum found.");
        return false;
      }
    }

    // We enable the ethereum provider to get the user's addresses.
    // request ethereum accounts.
    const addresses = await provider.enable({
      method: "eth_requestAccounts",
    });
    const accountId = await getAccountId(provider, addresses[0]);
    const authMethod = await EthereumWebAuth.getAuthMethod(provider, accountId);
    /**
     * Create DIDSession & provide capabilities for resources that we want to access.
     * @NOTE: The specific resources (ComposeDB data models) are provided through
     * "compose.resources" below.
     */
    session = await DIDSession.authorize(authMethod, {
      // resources: [`ceramic://*`],
      resources: compose.resources,
      expiresInSecs: threeMonths
    });
    console.log({ session }, session.serialize())
    // Set the session in localStorage.
    localStorage.setItem(CERAMIC_SESSION_KEY, session.serialize());
  }

  // Set our Ceramic DID to be our session DID.
  ceramic.did = session.did;
  compose.setDID(session.did);
  return;
};


const processProvider = (signer: any) => {
  const provider = signer?.provider;

  provider.enable = async () => [await signer.getAddress()];

  provider.request = async (payload: any) => {
    if (payload.method === "personal_sign") {
      const message = payload.params[0];

      if (/^(0x)?[0-9A-Fa-f]+$/i.test(message)) {
        const bufferMessage = Buffer.from(
          message.startsWith("0x") ? message.slice(2) : message,
          "hex"
        );
        return signer.signMessage(bufferMessage);
      }

      return signer.signMessage(message);
    }

    return provider.send(payload.method, payload.params || []);
  };

  return provider;
};
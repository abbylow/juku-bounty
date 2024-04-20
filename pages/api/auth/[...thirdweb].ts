import { ThirdwebAuth } from '@thirdweb-dev/auth/next';
import { PrivateKeyWallet } from '@thirdweb-dev/auth/evm';

export const { ThirdwebAuthHandler, getUser } = ThirdwebAuth({
  domain: process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || "",
  // TODO: check production's private key to be different with development's
  wallet: new PrivateKeyWallet(process.env.THIRDWEB_AUTH_PRIVATE_KEY || ""),
  // TODO: check nonce
  // authOptions: {
  //   validateNonce: async (nonce: string) => {
  //     // Check in database or storage if nonce exists
  //     const nonceExists = await dbExample.nonceExists(nonce);
  //     if (nonceExists) {
  //       throw new Error("Nonce has already been used!");
  //     }

  //     // Otherwise save nonce in database or storage for later validation
  //     await dbExample.saveNonce(nonce);
  //   }
  // },
});

export default ThirdwebAuthHandler();

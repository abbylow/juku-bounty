"use client"

import { ReactNode, createContext, useContext } from "react";
import { ThirdwebClient, createThirdwebClient } from "thirdweb";
import {
  ThirdwebProvider,
} from "thirdweb/react";
import {
  createWallet,
  walletConnect,
  inAppWallet,
  Wallet,
} from "thirdweb/wallets";

// Ensure environment variables are defined
if (!process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID) {
  throw new Error("NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not defined in the environment variables.");
}

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
});

const wallets = [
  inAppWallet({
    auth: {
      options: ["email", "google"],
    },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  walletConnect(),
];

interface ITwebContext {
  client: ThirdwebClient,
  wallets: (Wallet<"io.metamask"> | Wallet<"com.coinbase.wallet"> | Wallet<"walletConnect"> | Wallet<"inApp">)[]
}
const TwebContext = createContext<ITwebContext>({ client, wallets });

export function TwebProvider({ children }: { children: ReactNode }) {
  return (
    <TwebContext.Provider value={{
      client,
      wallets,
    }}>
      <ThirdwebProvider>
        {children}
      </ThirdwebProvider>
    </TwebContext.Provider>
  );
}

export const useTwebContext = () => useContext(TwebContext);
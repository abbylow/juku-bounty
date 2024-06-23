"use client"

import { ReactNode, createContext, useContext } from "react";
import { ThirdwebClient } from "thirdweb";
import {
  ThirdwebProvider,
} from "thirdweb/react";
import {
  createWallet,
  walletConnect,
  inAppWallet,
  Wallet,
} from "thirdweb/wallets";
import { client } from "@/lib/thirdweb-client";

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
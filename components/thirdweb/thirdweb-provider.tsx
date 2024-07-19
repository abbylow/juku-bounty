"use client"

import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from "react";
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
  createWallet("com.coinbase.wallet"),
  inAppWallet({
    auth: {
      options: ["email", "google"],
    },
  }),
  createWallet("io.metamask"),
  walletConnect(),
];

interface ITwebContext {
  client: ThirdwebClient,
  wallets: (Wallet<"io.metamask"> | Wallet<"com.coinbase.wallet"> | Wallet<"walletConnect"> | Wallet<"inApp">)[],
  setLoggedIn: Dispatch<SetStateAction<boolean>>,
  loggedIn: boolean
}
const TwebContext = createContext<ITwebContext>({ client, wallets, setLoggedIn: () => { }, loggedIn: false });

export function TwebProvider({ children }: { children: ReactNode }) {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  return (
    <TwebContext.Provider value={{
      client,
      wallets,
      setLoggedIn,
      loggedIn
    }}>
      <ThirdwebProvider>
        {children}
      </ThirdwebProvider>
    </TwebContext.Provider>
  );
}

export const useTwebContext = () => useContext(TwebContext);
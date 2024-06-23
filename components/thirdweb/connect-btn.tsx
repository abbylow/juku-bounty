"use client"
import {
  ConnectButton,
} from "thirdweb/react";
import { base, baseSepolia } from 'thirdweb/chains'

import { useTwebContext } from '@/components/thirdweb/thirdweb-provider'
import { JUKU_LOGO, TERMS_OF_SERVICE_URL } from "@/const/links";
// import { lightThirdwebTheme } from './customized-themes'

export function ConnectBtn() {
  const { client, wallets } = useTwebContext()

  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      chain={process.env.NODE_ENV === "production" ? base : baseSepolia}
      // theme={lightThirdwebTheme} //TODO: customize to juku's theme
      theme={"light"}
      connectModal={{
        size: "wide",
        titleIcon: JUKU_LOGO,
        showThirdwebBranding: false,
        termsOfServiceUrl: TERMS_OF_SERVICE_URL,
      }}
      showAllWallets={false} //TBC
      recommendedWallets={[wallets[0]]} //TBC
    />
  );
}
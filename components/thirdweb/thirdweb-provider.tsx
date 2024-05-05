"use client"

import * as React from 'react'
import {
  ThirdwebProvider as NextThirdwebProvider,
  metamaskWallet,
  coinbaseWallet,
  walletConnect,
  embeddedWallet,
  en,
} from '@thirdweb-dev/react'
import { Cyber, CyberTestnet} from '@thirdweb-dev/chains'

export function ThirdwebProvider({ children, ...props }: any) {
  return (
    <NextThirdwebProvider
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
      supportedWallets={[
        metamaskWallet(),
        coinbaseWallet(),
        walletConnect(),
        embeddedWallet({
          auth: {
            options: ["email", "google"],
          },
        }),
      ]}
      locale={en()}
      activeChain={process.env.NODE_ENV === "production" ? Cyber : CyberTestnet}
      authConfig={{
        authUrl: "/api/auth",
        domain: process.env.NEXT_PUBLIC_THIRDWEB_AUTH_DOMAIN || "",
      }}
      {...props}
    >
      {children}
    </NextThirdwebProvider>
  )
}

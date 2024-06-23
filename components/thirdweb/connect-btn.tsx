// "use client"

// import {
//   ConnectWallet,
//   // Theme
// } from 'thirdweb/react'
// // import { useTheme } from 'next-themes'
// // import { useEffect, useState } from 'react'
// // import { darkThirdwebTheme, lightThirdwebTheme } from './customized-themes'

// export function ConnectBtn() {
//   // const { theme, systemTheme } = useTheme()
//   // const [customizedTheme, setCustomizedTheme] = useState<"dark" | "light" | Theme | undefined>("light")
//   // useEffect(() => {
//   //   const currentTheme = theme ? (theme === "system" ? systemTheme : theme) : "light"
//   //   const tempTheme = currentTheme === "dark" ? darkThirdwebTheme : lightThirdwebTheme
//   //   setCustomizedTheme(tempTheme)
//   // }, [theme, systemTheme])

//   return (
//     <ConnectWallet
//       // theme={customizedTheme}
//       btnTitle="Login"
//       modalTitle="Login"
//       modalTitleIconUrl={""} //TODO: add link to our logo
//       auth={{
//         loginOptional: false,
//       }}
//       switchToActiveChain
//     // termsOfServiceUrl="https://...." //TODO: add terms of service page and turn this on
//     // privacyPolicyUrl="https://...." //TODO: add privacy policy page and turn this on
//     // switchToActiveChain={true} // to turn this on, must specify `activeChain` on thirdweb provider
//     />
//   )
// }


"use client"
import {
  ConnectButton,
} from "thirdweb/react";
import { base, baseSepolia } from 'thirdweb/chains'

import { useTwebContext } from '@/components/thirdweb/thirdweb-provider'
import { JUKU_LOGO, TERMS_OF_SERVICE_URL } from "@/const/links";

export function ConnectBtn() {
  const { client, wallets } = useTwebContext()

  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      chain={process.env.NODE_ENV === "production" ? base : baseSepolia}
      // theme={customizedTheme} //TODO: customize to juku's theme
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
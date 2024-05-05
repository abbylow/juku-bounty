"use client"

import {
  ConnectWallet,
  // Theme
} from '@thirdweb-dev/react'
import { CERAMIC_SESSION_KEY } from '@/components/ceramic/utils';
// import { useTheme } from 'next-themes'
// import { useEffect, useState } from 'react'
// import { darkThirdwebTheme, lightThirdwebTheme } from './customized-themes'

export function ConnectBtn() {
  // const { theme, systemTheme } = useTheme()
  // const [customizedTheme, setCustomizedTheme] = useState<"dark" | "light" | Theme | undefined>("light")
  // useEffect(() => {
  //   const currentTheme = theme ? (theme === "system" ? systemTheme : theme) : "light"
  //   const tempTheme = currentTheme === "dark" ? darkThirdwebTheme : lightThirdwebTheme
  //   setCustomizedTheme(tempTheme)
  // }, [theme, systemTheme])

  return (
    <ConnectWallet
      // theme={customizedTheme}
      btnTitle="Login"
      modalTitle="Login"
      modalTitleIconUrl={""} //TODO: add link to our logo
      auth={{
        loginOptional: false,
        onLogout() {
          localStorage.removeItem(CERAMIC_SESSION_KEY);
        },
      }}
      switchToActiveChain
    // termsOfServiceUrl="https://...." //TODO: add terms of service page and turn this on
    // privacyPolicyUrl="https://...." //TODO: add privacy policy page and turn this on
    // switchToActiveChain={true} // to turn this on, must specify `activeChain` on thirdweb provider
    />
  )
}

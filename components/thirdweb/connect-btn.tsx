"use client"
import {
  ConnectButton,
} from "thirdweb/react";

import { useTwebContext } from '@/components/thirdweb/thirdweb-provider'
import { SHORT_LOGO, TERMS_OF_SERVICE_URL } from "@/const/links";
// import { lightThirdwebTheme } from './customized-themes'
import {
  generatePayload,
  isLoggedIn,
  login,
  logout,
} from "@/actions/auth";
import { CERAMIC_SESSION_KEY } from "@/components/ceramic/utils";
import { useCeramicContext } from "@/components/ceramic/ceramic-provider";
import { currentChain } from "@/const/chains";

export function ConnectBtn() {
  const { client, wallets, setLoggedIn } = useTwebContext()
  const { setProfile, ceramic, composeClient } = useCeramicContext()

  const reset = () => {
    // reset viewer profile after logout
    setProfile(undefined); 
    // reset ceramic session
    localStorage.removeItem(CERAMIC_SESSION_KEY);
    // TODO: check whether we need to remove DID from ceramic and composedb
    // reset DID in ceramic client
    // @ts-ignore
    ceramic.did = undefined;
    // reset DID in composedb client 
    // @ts-ignore
    composeClient.setDID(undefined);
  }

  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      chain={currentChain}
      // theme={lightThirdwebTheme} //TODO: customize to juku's theme
      theme={"light"}
      connectModal={{
        size: "wide",
        titleIcon: SHORT_LOGO,
        showThirdwebBranding: false,
        termsOfServiceUrl: TERMS_OF_SERVICE_URL,
      }}
      showAllWallets={false} //TBC
      recommendedWallets={[wallets[0]]} //TBC
      auth={{
        isLoggedIn: async (address) => {
          console.log("checking if logged in!", { address });
          const status = await isLoggedIn();
          setLoggedIn(status);
          return status;
        },
        doLogin: async (params) => {
          console.log("logging in!");
          await login(params);
        },
        getLoginPayload: async ({ address }) =>
          generatePayload({ address, chainId: currentChain.id }),
        doLogout: async () => {
          console.log("logging out!");
          await logout();
          setLoggedIn(false);
          reset();
        },
      }}
    />
  );
}
"use client"
import { useQueryClient } from "@tanstack/react-query";
import {
  ConnectButton,
  useActiveAccount,
} from "thirdweb/react";

import { useTwebContext } from '@/contexts/thirdweb'
import { SHORT_LOGO, TERMS_OF_SERVICE_URL } from "@/const/links";
import { customizedTheme } from './customized-themes'
import {
  generatePayload,
  isLoggedIn,
  login,
  logout,
} from "@/actions/auth";
import { currentChain } from "@/const/chains";

export function ConnectBtn() {
  const { client, wallets, setLoggedIn } = useTwebContext()

  const queryClient = useQueryClient();
  
  const activeAccount = useActiveAccount();
  
  const reset = () => {
    queryClient.invalidateQueries({ queryKey: ['fetchViewerProfile', activeAccount?.address] })
  }

  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      chain={currentChain}
      theme={customizedTheme}
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
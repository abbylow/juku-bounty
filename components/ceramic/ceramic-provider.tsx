"use client";

import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { RuntimeCompositeDefinition } from "@composedb/types";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { base, baseSepolia } from "thirdweb/chains";
import { useActiveAccount, useActiveWalletConnectionStatus } from "thirdweb/react";

import { ProfileFormValues } from "@/app/profile/settings/form";
import { authenticateCeramic } from "@/components/ceramic/utils";
import * as definition from "@/composites/runtime-composite.json";
import { CONNECTION_STATUS } from "@/const/thirdweb-connection";
import { client } from "@/lib/thirdweb-client";

/** Make sure ceramic node url is provided */
if (!process.env.NEXT_PUBLIC_CERAMIC_NODE_URL) {
  console.log("You haven't setup your NEXT_PUBLIC_CERAMIC_NODE_URL yet.")
}

/**
 * Configure CeramicClient and ComposeClient & create context.
 */
const ceramic = new CeramicClient(process.env.NEXT_PUBLIC_CERAMIC_NODE_URL);

const composeClient = new ComposeClient({
  ceramic: process.env.NEXT_PUBLIC_CERAMIC_NODE_URL!,
  definition: definition as RuntimeCompositeDefinition
});

// Define the extended profile type
export interface BasicProfile extends ProfileFormValues {
  id: string;
  author: {
    id: string;
  };
  pfp: string;
}

interface ICeramicContext {
  ceramic: CeramicClient,
  composeClient: ComposeClient,
  viewerProfile: BasicProfile | null | undefined,
  getViewerProfile: () => void
}
const CeramicContext = createContext<ICeramicContext>({ ceramic, composeClient, viewerProfile: null, getViewerProfile: () => { } });

export const CeramicProvider = ({ children }: { children: ReactNode }) => {
  const activeAccount = useActiveAccount();
  const connectionStatus = useActiveWalletConnectionStatus();
  
  const [signer, setSigner] = useState<any>();

  useEffect(() => {
    async function getSigner() {
      if (activeAccount) {
        const signer = await ethers5Adapter.signer.toEthers({
          account: activeAccount,
          client,
          chain: process.env.NODE_ENV === "production" ? base : baseSepolia
        });
        setSigner(signer);
      }
    }
    getSigner();
  }, [activeAccount]);

  /**
   * Authenticate user and create ceramic session when user logged in
   */
  useEffect(() => {
    if (connectionStatus === CONNECTION_STATUS.CONNECTED && signer) {
      authenticateCeramic(ceramic, composeClient, signer);
    }
  }, [connectionStatus, signer])

  const [viewerProfile, setProfile] = useState<BasicProfile | null | undefined>();

  const getViewerProfile = async () => {
    console.log('in context getViewerProfile begins')
    const viewerProfile = await composeClient.executeQuery(`
        query {
          viewer {
            basicProfile {
              id
              author {
                id
              }
              displayName
              username
              bio
              pfp
            }
          }
        }
      `);
    const viewer: any = viewerProfile?.data?.viewer
    console.log('in context getViewerProfile => ', { viewer })
    setProfile(viewer?.basicProfile);
  };

  // TODO: check the warning here
  useEffect(() => {
    if (ceramic.did !== undefined && composeClient) {
      getViewerProfile();
    }
  }, [ceramic.did, composeClient]);

  return (
    <CeramicContext.Provider value={{
      ceramic,
      composeClient,
      viewerProfile,
      getViewerProfile
    }}>
      {children}
    </CeramicContext.Provider>
  );
};

/**
 * Provide access to the Ceramic & Compose clients.
 * @example const { ceramic, compose } = useCeramicContext()
 * @returns CeramicClient and ComposeClient
 */

export const useCeramicContext = () => useContext(CeramicContext);
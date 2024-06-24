"use client";

import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { RuntimeCompositeDefinition } from "@composedb/types";
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from "react";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { base, baseSepolia } from "thirdweb/chains";
import { useActiveAccount } from "thirdweb/react";

import { ProfileFormValues } from "@/app/profile/settings/form";
import { authenticateCeramic } from "@/components/ceramic/utils";
import * as definition from "@/composites/runtime-composite.json";
import { client } from "@/lib/thirdweb-client";
import { useTwebContext } from "../thirdweb/thirdweb-provider";

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
  setProfile: Dispatch<SetStateAction<BasicProfile | null | undefined>>,
  getViewerProfile: () => void
}
const CeramicContext = createContext<ICeramicContext>({
  ceramic, composeClient, viewerProfile: null, setProfile: () => { }, getViewerProfile: () => { }
});

export const CeramicProvider = ({ children }: { children: ReactNode }) => {
  const activeAccount = useActiveAccount();
  // console.log({ activeAccount })

  const { loggedIn } = useTwebContext();
  // console.log({ loggedIn })

  useEffect(() => {
    async function authCeramicAndGetViewer() {
      // console.log("authCeramicAndGetViewer is called when activeAccount, loggedIn => ", activeAccount, loggedIn)
      if (activeAccount && loggedIn) {
        // console.log("activeAccount && loggedIn is true and we are going to get signer now", activeAccount && loggedIn)
        const signer = await ethers5Adapter.signer.toEthers({
          account: activeAccount,
          client,
          chain: process.env.NODE_ENV === "production" ? base : baseSepolia
        });
        // console.log("we got signer here and auth ceramic", signer._isSigner, signer)
        await authenticateCeramic(ceramic, composeClient, signer, getViewerProfile);
        // console.log("in useEffect after ceramic auth - ceramic, composeClient ", ceramic, composeClient)
      }
    }
    authCeramicAndGetViewer();
  }, [activeAccount, loggedIn]);

  const [viewerProfile, setProfile] = useState<BasicProfile | null | undefined>();
  console.log({ viewerProfile })

  async function getViewerProfile() {
    console.log('in context getViewerProfile begins')
    const viewerProfileReq = await composeClient.executeQuery(`
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
    const viewer: any = viewerProfileReq?.data?.viewer
    console.log('in context getViewerProfile viewer => ', viewer)
    setProfile(viewer?.basicProfile);
  };

  return (
    <CeramicContext.Provider value={{
      ceramic,
      composeClient,
      viewerProfile,
      setProfile,
      getViewerProfile,
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
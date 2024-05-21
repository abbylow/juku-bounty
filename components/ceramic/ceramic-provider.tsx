"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { RuntimeCompositeDefinition } from "@composedb/types";
import { useSigner, useUser } from "@thirdweb-dev/react";

import { CERAMIC_SESSION_KEY, authenticateCeramic } from "@/components/ceramic/utils";
import * as definition from "@/composites/runtime-composite.json";
import { ProfileFormValues } from "@/app/profile/settings/form";

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

export const CeramicProvider = ({ children }: any) => {
  const signer = useSigner()
  const { isLoggedIn, isLoading } = useUser()

  const [viewerProfile, setProfile] = useState<BasicProfile | null | undefined>();

  /**
   * Authenticate user and create ceramic session when user logged in
   * Delete ceramic session when user logged out
   */
  useEffect(() => {
    if (!isLoading && isLoggedIn && signer) {
      authenticateCeramic(ceramic, composeClient, signer);
    }
    if (!isLoading && !isLoggedIn) {
      localStorage.removeItem(CERAMIC_SESSION_KEY);
    }
  }, [isLoading, isLoggedIn, signer])

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
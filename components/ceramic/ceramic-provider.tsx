"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { RuntimeCompositeDefinition } from "@composedb/types";
import { useSigner, useUser } from "@thirdweb-dev/react";

import { CERAMIC_SESSION_KEY, authenticateCeramic } from "@/components/ceramic/utils";
import * as definition from "@/composites/runtime-composite.json";
import { Profile } from "@/app/profile/settings/form";

/**
 * Configure CeramicClient and ComposeClient & create context.
 */
const ceramic = new CeramicClient(process.env.NEXT_PUBLIC_CERAMIC_NODE_URL);

const composeClient = new ComposeClient({
  ceramic: process.env.NEXT_PUBLIC_CERAMIC_NODE_URL!,
  definition: definition as RuntimeCompositeDefinition
});

interface ICeramicContext {
  ceramic: CeramicClient,
  composeClient: ComposeClient,
  profile: Profile | null,
  getProfile: () => void
}
const CeramicContext = createContext<ICeramicContext>({ ceramic, composeClient, profile: null, getProfile: () => {} });

export const CeramicProvider = ({ children }: any) => {
  const signer = useSigner()
  const { isLoggedIn, isLoading } = useUser()

  const [profile, setProfile] = useState<Profile | null | undefined>();

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

  const getProfile = async () => {
    console.log('in context getProfile begins')
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
            }
          }
        }
      `);
    // console.log('in context getProfile => ', { viewerProfile })
    const viewer: any = viewerProfile?.data?.viewer
    setProfile(viewer?.basicProfile);
  };

  // TODO: check the warning here
  useEffect(() => {
    if (ceramic.did !== undefined && composeClient) {
      getProfile();
    }
  }, [ceramic.did, composeClient]);

  return (
    <CeramicContext.Provider value={{
      ceramic,
      composeClient,
      profile,
      getProfile
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
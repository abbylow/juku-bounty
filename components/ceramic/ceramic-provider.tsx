"use client";

import { createContext, useContext, useEffect } from "react";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { RuntimeCompositeDefinition } from "@composedb/types";
import { useSigner, useUser } from "@thirdweb-dev/react";

import { CERAMIC_SESSION_KEY, authenticateCeramic } from "@/components/ceramic/utils";
import * as definition from "@/composites/runtime-composite.json";

/**
 * Configure CeramicClient and ComposeClient & create context.
 */
const ceramic = new CeramicClient(process.env.NEXT_PUBLIC_CERAMIC_NODE_URL);

const composeClient = new ComposeClient({
  ceramic: process.env.NEXT_PUBLIC_CERAMIC_NODE_URL!,
  definition: definition as RuntimeCompositeDefinition,
});

const CeramicContext = createContext({ ceramic, composeClient });

export const CeramicProvider = ({ children }: any) => {
  const signer = useSigner()
  const { isLoggedIn, isLoading } = useUser()

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

  return (
    <CeramicContext.Provider value={{
      ceramic,
      composeClient
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
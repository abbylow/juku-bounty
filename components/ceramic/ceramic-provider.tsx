"use client";

import { createContext, useContext, useEffect } from "react";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { useSigner, useUser } from "@thirdweb-dev/react";
import { authenticateCeramic } from "@/components/ceramic/utils";
// import { ComposeClient } from "@composedb/client";

// import { definition } from "../src/__generated__/definition.js";
// import { RuntimeCompositeDefinition } from "@composedb/types";

/**
 * Configure ceramic Client & create context.
 */
const ceramic = new CeramicClient(process.env.NEXT_PUBLIC_CERAMIC_NODE_URL);

// const composeClient = new ComposeClient({
//   ceramic: "http://localhost:7007",
//   // cast our definition as a RuntimeCompositeDefinition
//   definition: definition as RuntimeCompositeDefinition,
// });

const CeramicContext = createContext({
  ceramic: ceramic,
  // composeClient: composeClient
});

export const CeramicProvider = ({ children }: any) => {
  const signer = useSigner()
  const { isLoggedIn, isLoading } = useUser()

  useEffect(() => {
    if (!isLoading && isLoggedIn && signer) {
      authenticateCeramic(ceramic, signer);
    }
  }, [isLoading, isLoggedIn, signer])

  return (
    <CeramicContext.Provider value={{
      ceramic,
      //  composeClient
    }}>
      {children}
    </CeramicContext.Provider>
  );
};

/**
 * Provide access to the Ceramic & Compose clients.
 * @example const { ceramic, compose } = useCeramicContext()
 * @returns CeramicClient
 */

export const useCeramicContext = () => useContext(CeramicContext);
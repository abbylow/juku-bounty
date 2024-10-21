"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from 'next/navigation'
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";

import { PROFILE_SETTINGS_URL } from "@/const/links";
import { getProfile } from "@/actions/profile/getProfile";
import { ProfileOrNull } from "@/actions/profile/type";

interface IViewerContext {
  viewer: ProfileOrNull
}

const ViewerContext = createContext<IViewerContext>({
  viewer: null
});

export const ViewerProvider = ({ children }: { children: ReactNode }) => {
  const activeAccount = useActiveAccount();

  const [viewer, setViewer] = useState<ProfileOrNull>(null);

  const { data } = useQuery({
    queryKey: ['fetchViewerProfile', activeAccount?.address],
    queryFn: async () => await fetchViewerProfile(activeAccount?.address!),
  })
  console.log("tanstack ", data)

  async function fetchViewerProfile(walletAddress: string) {
    if (!walletAddress) {
      setViewer(null);
      return null;
    }
    const profile = await getProfile({
      wallet_address: walletAddress
    });
    setViewer(profile);
    return profile
  };

  const router = useRouter();
  useEffect(() => {
    // if viewer is logged in and hasn't setup the profile, redirect to setup now
    if (activeAccount?.address && viewer === null) {
      console.log("viewer hasn't setup the profile, redirect to setup now");
      router.push(PROFILE_SETTINGS_URL);
    }
  }, [viewer, activeAccount, router]);

  return (
    <ViewerContext.Provider value={{ viewer }}>
      {children}
    </ViewerContext.Provider>
  );
};

/**
 * Provide access to viewer related data
 * @example const { viewer } = useViewerContext()
 * @returns viewer data
 */

export const useViewerContext = () => useContext(ViewerContext);
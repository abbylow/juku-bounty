"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from 'next/navigation'
import { ReactNode, createContext, useContext, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";

import { PROFILE_SETTINGS_URL } from "@/const/links";
import { getProfile } from "@/actions/profile/getProfile";
import { ProfileOrNull } from "@/actions/profile/type";

interface IViewerContext {
  viewer: ProfileOrNull,
  isViewerPending: boolean,
}

const ViewerContext = createContext<IViewerContext>({
  viewer: null,
  isViewerPending: false
});

export const ViewerProvider = ({ children }: { children: ReactNode }) => {
  const activeAccount = useActiveAccount();

  const { data: viewer, isPending } = useQuery({
    queryKey: ['fetchViewerProfile', activeAccount?.address],
    queryFn: async () => await fetchViewerProfile(activeAccount?.address!),
  })

  async function fetchViewerProfile(walletAddress: string) {
    const profile = await getProfile({
      wallet_address: walletAddress
    });
    return profile
  };

  const router = useRouter();
  useEffect(() => {
    // if viewer is logged in and hasn't setup the profile, redirect to setup now
    if (activeAccount?.address && !isPending && viewer === null) {
      console.log("viewer hasn't setup the profile, redirect to setup now");
      router.push(PROFILE_SETTINGS_URL);
    }
  }, [viewer, isPending, activeAccount, router]);

  return (
    <ViewerContext.Provider value={{ 
      viewer: viewer || null,
      isViewerPending: isPending
       }}>
      {children}
    </ViewerContext.Provider>
  );
};

/**
 * Provide access to viewer related data
 * @example const { viewer, isViewerPending } = useViewerContext()
 * @returns viewer data
 */
export const useViewerContext = () => useContext(ViewerContext);
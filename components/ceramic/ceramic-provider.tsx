"use client";

import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { RuntimeCompositeDefinition } from "@composedb/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from 'next/navigation'
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from "react";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import { useActiveAccount } from "thirdweb/react";

import { ProfileFormValues } from "@/app/profile/settings/form";
import { authenticateCeramic } from "@/components/ceramic/utils";
import * as definition from "@/composites/runtime-composite.json";
import { client } from "@/lib/thirdweb-client";
import { useTwebContext } from "../thirdweb/thirdweb-provider";
import { currentChain } from "@/const/chains";
import { PROFILE_SETTINGS_URL } from "@/const/links";

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
export interface Profile extends ProfileFormValues {
  id: string;
  author: {
    id: string;
  };
  pfp: string;
  createdAt: string;
  profileTopicList: {
    edges: {
      node: {
        topicId: string
        profileId: string
        createdAt: string
      }
    }
  }
  profileTopicListCount: number
}

interface ICeramicContext {
  ceramic: CeramicClient,
  composeClient: ComposeClient,
  viewerProfile: Profile | null | undefined,
  setProfile: Dispatch<SetStateAction<Profile | null | undefined>>,
}
const CeramicContext = createContext<ICeramicContext>({
  ceramic, composeClient, viewerProfile: null, setProfile: () => { }
});

export const CeramicProvider = ({ children }: { children: ReactNode }) => {
  const activeAccount = useActiveAccount();

  const { loggedIn } = useTwebContext();

  const queryClient = useQueryClient();

  useEffect(() => {
    async function authCeramicAndGetViewer() {
      if (activeAccount && loggedIn) {
        const signer = await ethers5Adapter.signer.toEthers({
          account: activeAccount,
          client,
          chain: currentChain
        });
        await authenticateCeramic(ceramic, composeClient, signer,
          // getViewerProfile
          () => {
            console.log('authceramic ondone invalidate query ');
            queryClient.invalidateQueries({ queryKey: ['retrieveViewerProfile'] })
          }
        );
      }
    }
    authCeramicAndGetViewer();
    // console.log({ceramic, composeClient})
  }, [activeAccount, loggedIn]);

  const [viewerProfile, setProfile] = useState<Profile | null | undefined>();

  const { data } = useQuery({
    queryKey: ['retrieveViewerProfile'],
    queryFn: async () => await retrieveViewerProfile()
  })

  async function retrieveViewerProfile() {
    // console.log("called retrieveViewerProfile")
    const viewerProfileReq = await composeClient.executeQuery(`
      query {
        viewer {
          profile {
            id
            author {
              id
            }
            displayName
            username
            bio
            pfp
            createdAt
          }
          profileTopicList(first: 10) {
            edges {
              node {
                id
                active
                topicId
                profileId
                topic {
                  slug
                  name
                }
              }
            }
          }
          profileTopicListCount
        }
      }
    `);
    if (viewerProfileReq.errors) {
      throw viewerProfileReq.errors;
    }
    const viewer: any = viewerProfileReq?.data?.viewer
    const latestProfile = viewer?.profile
    // process profileTopics and map to categories
    if (viewer?.profileTopicListCount) {
      latestProfile.categories = viewer?.profileTopicList.edges.filter((el: { node: { active: any; }; }) => el.node.active).map((el: { node: any; }) => {
        return {
          ...el.node,
          value: el.node.topicId,
          label: el.node.topic.name
        }
      })
    }
    console.log('in context retrieveViewerProfile latestProfile', latestProfile)
    setProfile(latestProfile); // return undefined as viewerProfile if user never setup the profile
    return latestProfile || null; // return null because tanstack doesn't accept undefined as data
  };

  const router = useRouter();
  useEffect(() => {
    // check if logged in and viewer.profile === null, redirect to profile settings page
    if (loggedIn && viewerProfile === null) {
      console.log("time to prompt user for profile settings")
      router.push(PROFILE_SETTINGS_URL);
    }
  }, [viewerProfile, loggedIn, router]);

  return (
    <CeramicContext.Provider value={{
      ceramic,
      composeClient,
      viewerProfile,
      setProfile,
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
"use client";

import { useActiveAccount } from "thirdweb/react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/user/avatar";
import { useCeramicContext } from "@/components/ceramic/ceramic-provider";
import WalletAddress from "@/components/copyable-address/address";
import { FoundProfileResponse } from "@/app/profile/settings/types";
import ProfileCard from "@/components/profile/card";
import { IPlatform } from "@/components/ceramic/types";

export default function ProfilePage({ params }: { params: { username: string } }) {
  console.log("params.username ", params.username)

  const { composeClient, viewerProfile } = useCeramicContext();

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // TODO: fix the type
  const [userData, setUserData] = useState<any>();

  const [userCategories, setUserCategories] = useState<any>();
  const [platformIntegrations, setPlatformIntegrations] = useState<IPlatform[]>();

  // TODO: change query below to get profileTopicList by active = true after schema update
  const getProfile = async () => {
    const findProfile = await composeClient.executeQuery(`
      query {
        profileIndex(
        filters: {
          where: {
            username: {
              equalTo: "${params.username}",
            }
          }
        }, 
        first: 1
      ) {
          edges {
            node {
              id
              username
              displayName
              pfp
              bio
              createdAt
              author {
                id
                profileTopicListCount
                profileTopicList(first: 10) {
                  edges {
                    node {
                      id
                      profileId
                      topicId
                      active
                      createdAt
                      topic {
                        name
                        slug
                      }
                    }
                  }
                }
                platformListCount
                platformList(first: 5) {
                  edges {
                    node {
                      id
                      name
                      verified
                      profileId
                    }
                  }
                }
              }
            }
          }
        }
      }
    `)

    const foundProfileRes = findProfile?.data?.profileIndex as FoundProfileResponse
    console.log({ foundProfileRes })

    if (findProfile.errors || foundProfileRes.edges.length < 1) {
      console.log('display error said this user is not found')
      setErrorMsg('Profile not found');
    }

    if (foundProfileRes?.edges[0]?.node) {
      console.log(foundProfileRes?.edges[0]?.node)
      const foundProfile = foundProfileRes.edges[0].node;
      setUserData(foundProfile)

      if (foundProfileRes?.edges[0]?.node?.author?.profileTopicListCount) {
        const categories = foundProfileRes?.edges[0]?.node?.author?.profileTopicList.edges.filter((el: { node: { active: any; }; }) => el.node.active).map((el: { node: any; }) => {
          return {
            ...el.node,
            value: el.node.topicId,
            label: el.node.topic.name
          }
        })
        setUserCategories(categories);
      }
      if (foundProfileRes?.edges[0]?.node?.author?.platformListCount) {
        const integrations = foundProfileRes?.edges[0]?.node?.author?.platformList.edges.map((el: { node: any; }) => el.node)
        setPlatformIntegrations(integrations);
      }
    }
  }

  useEffect(() => {
    if (params.username) {
      getProfile()
    }
  }, [params])

  if (errorMsg) {
    return (
      <section>
        <h3 className="text-xl font-medium mt-4">Oops! Profile not found</h3>
      </section>
    )
  }

  return (
    <div className="space-y-6 md:px-10 py-10 pb-16">
      <section className="">
        <ProfileCard
          id={userData?.id || ''}
          pfp={userData?.pfp || ''}
          displayName={userData?.displayName || ''}
          address={''} // // TODO: get user's wallet address after schema update
          username={userData?.username || ''}
          bio={userData?.bio || ''}
          categories={userCategories || []}
          integrations={platformIntegrations || []}
          allowEdit={false}
          allowFollow={userData?.id !== viewerProfile?.id}
        />
      </section>
    </div >
  )
}

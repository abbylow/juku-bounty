"use client";

import { useCallback, useEffect, useState } from "react";

import { VerifiedPlatform } from "@/actions/verifiedPlatform/type";
import { getVerifiedPlatform } from "@/actions/verifiedPlatform/getVerifiedPlatform";
import ProfileCard from "@/components/profile/card";
import ProfileTabs from "@/components/profile/tabs";
import { ConnectBtn } from "@/components/thirdweb/connect-btn";
import { Option } from "@/components/ui/multiple-selector";
import { useTwebContext } from "@/contexts/thirdweb";
import { useViewerContext } from "@/contexts/viewer";
import { useCategoryContext } from "@/contexts/categories";
import { coinbaseVerifiedAccount } from "@/const/verified_platform";

export default function Profile() {
  const { viewer } = useViewerContext();

  const { loggedIn } = useTwebContext();

  const { isCategoriesPending, categoryOptions } = useCategoryContext();

  const [userCategories, setUserCategories] = useState<Option[]>([]);

  const [platformIntegrations, setPlatformIntegrations] = useState<VerifiedPlatform[]>();

  const retrieveData = useCallback(async () => {
    try {
      const categories = categoryOptions.filter((option: { value: any; }) =>
        viewer?.category_ids?.includes(+(option.value))
      ) || []
      setUserCategories(categories);

      const verifiedCoinbase = await getVerifiedPlatform({
        profileId: viewer?.id!,
        type: coinbaseVerifiedAccount
      })
      if (verifiedCoinbase) {
        setPlatformIntegrations([verifiedCoinbase]);
      }
    } catch (error) {
      console.log({ error })
    }
  }, [viewer, categoryOptions])

  useEffect(() => {
    if (viewer && !isCategoriesPending) {
      retrieveData()
    }
  }, [viewer, isCategoriesPending, retrieveData])

  if (!loggedIn) {
    return (
      <div className="space-y-6 md:px-10 py-10 pb-16">
        <div className="space-y-4">
          <h3 className="text-xl font-medium">Oops! Login or sign up first to view your profile</h3>
          <ConnectBtn />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:px-10 py-10 pb-16">
      <section className="">
        <ProfileCard
          id={viewer?.id || ''}
          pfp={viewer?.pfp || ''}
          displayName={viewer?.display_name || ''}
          address={viewer?.wallet_address || ''}
          username={viewer?.username || ''}
          bio={viewer?.bio || ''}
          categories={userCategories || []}
          integrations={platformIntegrations || []}
          allowEdit={true}
        />
        <ProfileTabs relatedProfile={viewer?.id} />
      </section>
    </div >
  )
}

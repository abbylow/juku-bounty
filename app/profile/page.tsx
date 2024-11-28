"use client";

import { useCallback, useEffect, useState } from "react";

import { VerifiedPlatform } from "@/actions/verifiedPlatform/type";
import { getVerifiedPlatform } from "@/actions/verifiedPlatform/getVerifiedPlatform";
import ProfileCard from "@/components/profile/card";
import { Option } from "@/components/ui/multiple-selector";
import { useViewerContext } from "@/contexts/viewer";
import { useCategoryContext } from "@/contexts/categories";
import { coinbaseVerifiedAccount } from "@/const/verified_platform";

export default function Profile() {
  const { viewer } = useViewerContext();

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
      </section>
    </div >
  )
}

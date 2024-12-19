"use client";

import { useCallback, useEffect, useState } from "react";

import ProfileCard from "@/components/profile/card";
import ProfileTabs from "@/components/profile/tabs";
import { Option } from "@/components/ui/multiple-selector";
import { coinbaseVerifiedAccount } from "@/const/verified_platform";
import { useCategoryContext } from "@/contexts/categories";
import { useViewerContext } from "@/contexts/viewer";
import { getProfile } from "@/actions/profile/getProfile";
import { ProfileOrNull } from "@/actions/profile/type";
import { getVerifiedPlatform } from "@/actions/verifiedPlatform/getVerifiedPlatform";
import { VerifiedPlatform } from "@/actions/verifiedPlatform/type";

export default function ProfilePage({ params }: { params: { username: string } }) {
  const { viewer } = useViewerContext()

  const { isCategoriesPending, categoryOptions } = useCategoryContext()

  const [hasError, setHasError] = useState<boolean>(false);

  const [userData, setUserData] = useState<ProfileOrNull>(null);

  const [userCategories, setUserCategories] = useState<Option[]>([]);

  const [platformIntegrations, setPlatformIntegrations] = useState<VerifiedPlatform[]>();

  const retrieveProfile = useCallback(async () => {
    try {
      const profile = await getProfile({
        username: params.username
      });
      setUserData(profile);

      const categories = categoryOptions.filter((option: { value: any; }) =>
        profile?.category_ids?.includes(+(option.value))
      ) || []
      setUserCategories(categories);

      const verifiedCoinbase = await getVerifiedPlatform({
        profileId: profile?.id!,
        type: coinbaseVerifiedAccount
      })
      if (verifiedCoinbase) {
        setPlatformIntegrations([verifiedCoinbase]);
      }

      if (!profile) {
        setHasError(true);
      }
    } catch (error) {
      console.log({ error })
      setHasError(true);
    }
  }, [params.username, categoryOptions])

  useEffect(() => {
    if (params.username && !isCategoriesPending) {
      retrieveProfile()
    }
  }, [params, isCategoriesPending, retrieveProfile])

  if (hasError) {
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
          displayName={userData?.display_name || ''}
          address={userData?.wallet_address || ''}
          username={userData?.username || ''}
          bio={userData?.bio || ''}
          categories={userCategories || []}
          integrations={platformIntegrations || []}
          allowEdit={false}
          allowFollow={userData?.id !== viewer?.id}
        />
        <ProfileTabs relatedProfile={userData?.id} />
      </section>
    </div >
  )
}

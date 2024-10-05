"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import React, { useEffect, useRef, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { useActiveAccount, useActiveWallet } from "thirdweb/react"

import { useCeramicContext } from "@/components/ceramic/ceramic-provider"
import { Profile } from "@/components/ceramic/types"
import { toast } from "@/components/ui/use-toast"
import { profileFormSchema } from "@/app/profile/settings/form-schema"
import { ProfileFormValues, ProfileUpdateResponse, ProfileCategoriesIndexResponse, FoundProfileResponse } from "@/app/profile/settings/types"
import { PINATA_GATEWAY } from "@/lib/pinata-gateway"
import { ProfileFormComponent } from "@/components/profile/form"
import { findProfileByUsername } from "@/queries/find-profile-by-username"

export function ProfileForm() {
  const { composeClient, viewerProfile } = useCeramicContext();
  const queryClient = useQueryClient();
  const activeAccount = useActiveAccount();
  const wallet = useActiveWallet();

  /** beginning of pfp input field handling */
  const pfpRef = useRef<HTMLInputElement>(null); // ref to corresponding hidden pfp input field
  const [media, setMedia] = useState<File | null>(); // state to contain pfp input file
  const [dataUrl, setDataUrl] = useState<string>(""); // used for image preview

  useEffect(() => {
    let newUrl: string;
    if (media) {
      newUrl = URL.createObjectURL(media); // generate new data urls for media 
      setDataUrl(newUrl);
    }
    return () => {
      URL.revokeObjectURL(newUrl);
    }
  }, [media]);

  const triggerPfpInput = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    pfpRef?.current?.click();
  }

  const handlePfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files)
      setMedia(e.target.files[0]);
  }
  /** end of pfp input field handling */

  const [profileClone, setProfileClone] = useState<Profile | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // pre-populate form fields with current data
    if (viewerProfile && !profileClone) {
      setProfileClone({ ...viewerProfile })

      if (viewerProfile?.pfp) {
        setDataUrl(`${PINATA_GATEWAY}/ipfs/${viewerProfile?.pfp.split('://')[1]}`)
      }
    }
    // set loading to true when it's still getting viewer profile
    if (viewerProfile !== undefined) {
      setLoading(false)
    }
  }, [viewerProfile, profileClone])

  const defaultValues: Partial<ProfileFormValues> = {
    displayName: viewerProfile?.displayName || "",
    username: viewerProfile?.username || "",
    bio: viewerProfile?.bio || "",
    categories: viewerProfile?.categories || [],
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    values: profileClone,
    mode: "onBlur"
  })

  const updateProfile = async (data: Partial<ProfileFormValues>) => {
    setLoading(true);

    let uploadedPfp: string = "";
    // upload new pfp to ipfs if there is
    if (media) {
      const formData = new FormData();
      formData.append("file", media);
      const mediaRes = await fetch('/ipfs/upload', {
        method: "POST",
        body: formData
      });
      if (mediaRes.status == 200) {
        const result = await mediaRes.json();
        uploadedPfp = result.url;
      } else {
        toast({ title: 'Fail to upload media' })
      }
    }

    const update = await composeClient.executeQuery(`
        mutation {
          setProfile(input: {
            content: {
              displayName: "${data?.displayName || ""}"
              username: "${data?.username || ""}"
              bio: "${data?.bio?.replace(/\n/g, "\\n") || ""}"
              pfp: "${media ? uploadedPfp : (profileClone?.pfp || "")}"
              walletAddress: "${profileClone?.walletAddress || activeAccount?.address}"
              loginMethod: "${profileClone?.loginMethod || wallet?.id}"
              createdAt: "${profileClone?.createdAt || new Date().toISOString()}"
              editedAt: "${new Date().toISOString()}"
              context: "${profileClone?.context || process.env.NEXT_PUBLIC_CONTEXT_ID}"
            }
          }) 
          {
            document {
              id
              displayName
              username
              bio
              pfp
              walletAddress
              loginMethod
              createdAt
              editedAt
            }
          }
        }
      `);
    console.log("profile/settings/form", { update })

    if (!update.errors) {
      // Find items in viewerProfile.categories that are not in data.categories (to be removed)
      const toRemove = viewerProfile?.categories?.filter(category => !data?.categories?.map(el => el.value)?.includes(category.value)) || [];

      toRemove.map(async (c) => {
        const removeRelation = await composeClient.executeQuery(`
        mutation {
          updateProfileCategory(
            input: {
              id: "${c.id}",
              content: {
                active: false,
                editedAt: "${new Date().toISOString()}"
              }
            }
          ) {
            document {
              active
              id
              profileId
              categoryId
            }
          }
        }
      `)
        console.log("profile/settings/form", { removeRelation })
        if (!removeRelation.errors) {
          queryClient.invalidateQueries({ queryKey: ['retrieveViewerProfile'] })
        }
      })

      // Find items in data.categories that are not in viewerProfile.categories (to be added)
      const toAdd = data?.categories?.map(el => el.value)?.filter(category => !viewerProfile?.categories?.map(el => el.value)?.includes(category)) || [];

      toAdd.map(async (c) => {
        const profileUpdateRes = update?.data?.setProfile as ProfileUpdateResponse;
        // find existing relation, if found then update, else create new relation
        const toAddRelation = await composeClient.executeQuery(`
        query {
          profileCategoryIndex(
            filters: {
              where: {
                profileId: {
                  equalTo: "${profileClone?.id || profileUpdateRes?.document?.id}"
                }, 
                categoryId: {
                  equalTo: "${c}"
                }
              }
            }
            first: 1
          ) {
            edges {
              node {
                id
                profileId
                categoryId
                active
              }
            }
          }
        }
      `)
        console.log("profile/settings/form", { toAddRelation })

        const profileCategoryIndexRes = toAddRelation?.data?.profileCategoryIndex as ProfileCategoriesIndexResponse

        if (profileCategoryIndexRes?.edges?.length) {
          // update existing relation to be active 
          const updatedRelation = await composeClient.executeQuery(`
          mutation {
            updateProfileCategory(
              input: {
                id: "${profileCategoryIndexRes?.edges[0]?.node?.id}",
                content: {
                  active: true,
                  editedAt: "${new Date().toISOString()}"
                }
              }
            ) {
              document {
                active
                id
              }
            }
          }
        `)
          console.log("profile/settings/form", { updatedRelation })

          if (!updatedRelation.errors) {
            queryClient.invalidateQueries({ queryKey: ['retrieveViewerProfile'] })
          }
        } else {
          // TODO: first time setup profile, after creation, the new created is not shown
          // create new relation
          const createdRelation = await composeClient.executeQuery(`
          mutation {
            createProfileCategory(
              input: {
                content: {
                  active: true,
                  profileId: "${profileClone?.id || profileUpdateRes?.document?.id}",
                  categoryId: "${c}", 
                  createdAt: "${new Date().toISOString()}",
                  editedAt: "${new Date().toISOString()}"
                }
              }
            ) {
              document {
                active
                id
              }
            }
          }
        `)
        console.log("profile/settings/form", { createdRelation })
        if (!createdRelation.errors) {
          queryClient.invalidateQueries({ queryKey: ['retrieveViewerProfile'] })
        }
      }
    })

      toast({ title: "Updated profile" })
      setLoading(true);
      queryClient.invalidateQueries({ queryKey: ['retrieveViewerProfile'] })
    } else {
      toast({ title: `Something went wrong: ${update.errors}` })
    }
    setLoading(false);
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    await updateProfile(data)
  }

  const checkDuplication = async (e: any) => {
    const foundProfile = await findProfileByUsername(composeClient, e.target.value);
    if (foundProfile) {
      if (profileClone && profileClone.id === foundProfile?.id) {
        console.log('the found profile is exactly this current profile')
      } else {
        form.setError('username', { type: 'custom', message: 'This username is already taken.' })
      }
    }
  }

  return (
    <ProfileFormComponent
      form={form}
      onSubmit={onSubmit}
      dataUrl={dataUrl}
      triggerPfpInput={triggerPfpInput}
      loading={loading}
      checkDuplication={checkDuplication}
      media={media}
      handlePfpChange={handlePfpChange}
      pfpRef={pfpRef}
    />
  )
}
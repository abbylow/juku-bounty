"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { UserRound } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"

import { Profile, useCeramicContext } from "@/components/ceramic/ceramic-provider"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import MultipleSelector from '@/components/ui/multiple-selector'
import { CATEGORY_OPTIONS } from "@/const/categories"
import { profileFormSchema } from "@/app/profile/settings/form-schema"
import { ProfileFormValues, ProfileUpdateResponse, ProfileTopicIndexResponse, FoundProfileResponse } from "@/app/profile/settings/types"
import { PINATA_GATEWAY } from "@/lib/pinata-gateway"

export function ProfileForm() {
  const { composeClient, viewerProfile } = useCeramicContext();

  const queryClient = useQueryClient();

  /** beginning of pfp input field handling */
  const pfpRef = useRef<HTMLInputElement>(null); // ref to corresponding hidden pfp input field
  const [media, setMedia] = useState<File | null>(); // state to contain pfp input file
  const [dataUrl, setDataUrl] = useState<string>(""); // used for image preview
  // console.log({ media, dataUrl })

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
  // console.log("pre-populated profileClone ", profileClone)
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // pre-populate form fields with current data
    if (viewerProfile && !profileClone) {
      // console.log('pre-populating with viewerProfile ', viewerProfile)
      setProfileClone({ ...viewerProfile })

      if (viewerProfile?.pfp) {
        // console.log('pre-populate and render pfp ', viewerProfile?.pfp)
        setDataUrl(`${PINATA_GATEWAY}/ipfs/${viewerProfile?.pfp.split('://')[1]}`)
      }
    }
    // set loading to true when it's still getting viewer profile
    if (viewerProfile !== undefined) {
      // console.log('disabled loading state')
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
              createdAt: "${profileClone?.createdAt || new Date().toISOString()}"
              editedAt: "${new Date().toISOString()}"
            }
          }) 
          {
            document {
              id
              displayName
              username
              bio
              pfp
              createdAt
              editedAt
            }
          }
        }
      `);
    // console.log({ update })

    // Find items in viewerProfile.categories that are not in data.categories (to be removed)
    const toRemove = viewerProfile?.categories?.filter(category => !data?.categories?.map(el => el.value)?.includes(category.value)) || [];

    toRemove.map(async (c) => {
      // console.log("time to remove c ", c)
      const removeRelation = await composeClient.executeQuery(`
        mutation {
          updateProfileTopic(
            input: {
              id: "${c.value}",
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
              topicId
            }
          }
        }
      `)
      // console.log('removed result ', { removeRelation })
      if (!removeRelation.errors) {
        // console.log('after remove topic profile relation - invalidate query ');
        queryClient.invalidateQueries({ queryKey: ['retrieveViewerProfile'] })
      }
    })

    // Find items in data.categories that are not in viewerProfile.categories (to be added)
    const toAdd = data?.categories?.map(el => el.value)?.filter(category => !viewerProfile?.categories?.map(el => el.value)?.includes(category)) || [];

    toAdd.map(async (c) => {
      const profileUpdateRes = update?.data?.setProfile as ProfileUpdateResponse;
      // console.log("in toAdd array , c = ", c, profileClone?.id || profileUpdateRes?.document?.id)
      // find existing relation, if found then update, else create new relation
      const toAddRelation = await composeClient.executeQuery(`
        query {
          profileTopicIndex(
            filters: {
              where: {
                profileId: {
                  equalTo: "${profileClone?.id || profileUpdateRes?.document?.id}"
                }, 
                topicId: {
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
                topicId
                active
              }
            }
          }
        }
      `)
      // console.log('toadd ', { toAddRelation })

      const profileTopicIndexRes = toAddRelation?.data?.profileTopicIndex as ProfileTopicIndexResponse

      if (profileTopicIndexRes?.edges?.length) {
        // update existing relation to be active 
        // console.log("update this id ", profileTopicIndexRes?.edges[0]?.node?.id)
        const updatedRelation = await composeClient.executeQuery(`
          mutation {
            updateProfileTopic(
              input: {
                id: "${profileTopicIndexRes?.edges[0]?.node?.id}",
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
        // console.log('updated result ', { updatedRelation })
        if (!updatedRelation.errors) {
          // console.log('after updating topic profile - invalidate query ');
          queryClient.invalidateQueries({ queryKey: ['retrieveViewerProfile'] })
        }
      } else {
        // create new relation
        const createdRelation = await composeClient.executeQuery(`
          mutation {
            createProfileTopic(
              input: {
                content: {
                  active: true,
                  profileId: "${profileClone?.id || profileUpdateRes?.document?.id}",
                  topicId: "${c}", 
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
        // console.log('created result ', { createdRelation })
        if (!createdRelation.errors) {
          // console.log('after updating topic profile - invalidate query ');
          queryClient.invalidateQueries({ queryKey: ['retrieveViewerProfile'] })
        }
      }
    })

    if (update?.errors) {
      toast({ title: `Something went wrong: ${update.errors}` })
    } else {
      toast({ title: "Updated profile" })
      setLoading(true);
      // console.log('after updating profile - invalidate query ');
      queryClient.invalidateQueries({ queryKey: ['retrieveViewerProfile'] })
    }
    setLoading(false);
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    // console.log('onSubmit => ', { data })
    await updateProfile(data)
  }

  const checkDuplication = async (e: any) => {
    if (e.target.value) {
      // console.log('checking duplication ', e.target.value)
      const duplication = await composeClient.executeQuery(`
        query {
          profileIndex(
          filters: {
            where: {
              username: {
                equalTo: "${e.target.value}",
              }
            }
          }, 
          first: 1
        ) {
            edges {
              node {
                id
                username
              }
            }
          }
        }
      `)

      // console.log({ duplication, profileClone })
      const foundProfileRes = duplication?.data?.profileIndex as FoundProfileResponse
      // if found existing username
      if (foundProfileRes?.edges?.length) {
        if (profileClone && profileClone.id === foundProfileRes?.edges[0]?.node?.id) {
          // console.log('has existing profile and found duplication and it is from same account')
        } else {
          form.setError('username', { type: 'custom', message: 'This username is already taken.' })
          // console.log('set error, formstate errors', form.formState.errors)
        }
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
        <div className="flex flex-col gap-4 items-start">
          {/* TODO: allow user to crop image / drag to adjust but maintain the square aspect - refer whatsapp pfp */}
          <Avatar className="w-24 h-24">
            <AvatarImage src={dataUrl} />
            <AvatarFallback><UserRound /></AvatarFallback>
          </Avatar>

          <Button onClick={triggerPfpInput} disabled={loading} variant="outline">
            Edit PFP
          </Button>
        </div>

        <div className="flex-1 space-y-8">
          <FormField
            control={form.control}
            name="username"
            disabled={loading}
            render={({ field }) => (
              <FormItem onBlur={checkDuplication}>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="john_doe" {...field} />
                </FormControl>
                <FormDescription>Your unique identifier on Juku, only letters, numerical values and underscore (_) are allowed with a minimum of 3 characters.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayName"
            disabled={loading}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            disabled={loading}
            render={({ field }) => (
              <FormItem>
                <FormLabel>About Me</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="You can write about your years of experience, industry, or skills. People also talk about their achievements or previous job experiences."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categories"
            disabled={loading}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expert Categories</FormLabel>
                <FormControl>
                  <MultipleSelector
                    {...field}
                    maxSelected={3}
                    onMaxSelected={(maxLimit) => {
                      toast({
                        title: `You have reached max selected: ${maxLimit}`,
                      });
                    }}
                    defaultOptions={CATEGORY_OPTIONS}
                    placeholder="Add categories for discovery..."
                    emptyIndicator={
                      <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                        no results found.
                      </p>
                    }
                  />
                </FormControl>
                <FormDescription>Choose the most relevant experts category based on your experience, industry or skills.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={
              loading ||
              (!media && !form.formState.isDirty) || // disable when nothing is changed
              (Object.values(form.formState.errors).length > 0) // check this bcoz setError wont impact formState.isValid
              // || !form.formState.isValid // categories is not validated onblur, it takes one step later to be validated, so we allow user to submit and this will be checked onsubmit
            }
          >
            Save changes
          </Button>
        </div>
      </form>
      <input
        id="pfpInput"
        accept={'image/*'}
        onChange={handlePfpChange}
        ref={pfpRef}
        type="file"
        className='hidden'
      />
    </Form>
  )
}
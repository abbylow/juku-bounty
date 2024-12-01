"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { UserRound } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { useActiveAccount, useActiveWallet } from "thirdweb/react"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import MultipleSelector from '@/components/ui/multiple-selector'
import { toast } from "@/components/ui/use-toast"
import { ExtendedProfileFormValues, profileFormSchema, ProfileFormValues } from "@/app/profile/settings/form-schema"
import { PINATA_GATEWAY } from "@/lib/pinata-gateway"
import { createOrUpdateProfile } from "@/actions/profile/createOrUpdateProfile"
import { getProfile } from "@/actions/profile/getProfile"
import { useViewerContext } from "@/contexts/viewer"
import { useCategoryContext } from "@/contexts/categories"

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export function ProfileForm() {
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

  const [loading, setLoading] = useState<boolean>(true);

  const { isCategoriesPending, categoryOptions } = useCategoryContext()
  useEffect(() => {
    if (!isCategoriesPending) {
      setLoading(false)
    }
  }, [isCategoriesPending]);

  const { viewer } = useViewerContext()
  const [profileClone, setProfileClone] = useState<ExtendedProfileFormValues>();

  useEffect(() => {
    // pre-populate form fields with current data
    if (viewer && !profileClone) {
      setProfileClone({
        displayName: viewer.display_name,
        username: viewer.username,
        bio: viewer.bio,
        pfp: viewer.pfp,
        walletAddress: viewer.wallet_address,
        loginMethod: viewer.login_method,
        categories: categoryOptions.filter(option =>
          viewer?.category_ids?.includes(+(option.value))
        )
      })

      if (viewer?.pfp) {
        setDataUrl(`${PINATA_GATEWAY}/ipfs/${viewer?.pfp.split('://')[1]}`)
      }
    }
  }, [viewer, profileClone, categoryOptions])

  const defaultValues: Partial<ProfileFormValues> = {
    displayName: viewer?.display_name || "",
    username: viewer?.username || "",
    bio: viewer?.bio || "",
    categories: categoryOptions.filter(option =>
      viewer?.category_ids?.includes(+(option.value))
    ) || []
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    values: profileClone,
    mode: "onBlur"
  })

  const submitHandler = async (data: Partial<ProfileFormValues>) => {
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

    try {
      const updatedProfile = await createOrUpdateProfile({
        displayName: data?.displayName || "",
        username: data?.username || "",
        bio: data?.bio?.replace(/\n/g, "\\n") || "",
        pfp: media ? uploadedPfp : (profileClone?.pfp || ""),
        walletAddress: activeAccount?.address || "",
        loginMethod: profileClone?.loginMethod || wallet?.id || "",
        categories: data?.categories
      })
      console.log({ updatedProfile })
      queryClient.invalidateQueries({ queryKey: ['fetchViewerProfile', activeAccount?.address] })
      toast({ title: "Updated profile" })
    } catch (error) {
      toast({ title: `Something went wrong: ${error}` })
    } finally {
      setLoading(false);
    }

  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    console.log("on submit ", data)
    await submitHandler(data)
  }

  const checkDuplication = async (e: any) => {
    const foundProfile = await getProfile({
      username: e.target.value
    });

    if (foundProfile) {
      if (activeAccount?.address === foundProfile?.wallet_address) {
        console.log('the found profile is exactly this current profile')
      } else {
        form.setError('username', { type: 'custom', message: 'This username is already taken.' })
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
                    defaultOptions={categoryOptions}
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
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { UserRound } from "lucide-react"
import React, { useEffect, useRef, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

import { useCeramicContext } from "@/components/ceramic/ceramic-provider"
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
import MultipleSelector, { optionSchema } from '@/components/ui/multiple-selector';
import { CATEGORY_OPTIONS } from "@/const/categories"

/** Make sure pinata gateway is provided */
if (!process.env.NEXT_PUBLIC_PINATA_GATEWAY) {
  console.log("You haven't setup your NEXT_PUBLIC_PINATA_GATEWAY yet.")
}

const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY;

const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(3, {
      message: "Display name must be at least 3 characters.",
    })
    .max(100, {
      message: "Display name must not be longer than 100 characters.",
    }),
  username: z
    .string()
    .min(3, {
      message: "Display name must be at least 3 characters.",
    })
    .max(100, {
      message: "Display name must not be longer than 100 characters.",
    })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Your username can only contain letters, numbers and '_'",
    }),
  bio: z
    .string()
    .max(160, {
      message: "About me must not be longer than 160 characters.",
    })
    .optional(),
  categories: z.array(optionSchema)
    .min(1, {
      message: "Choose at least 1 category for discovery"
    }).max(3, {
      message: "Only allow maximum 3 categories"
    }),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { composeClient, viewerProfile, getViewerProfile } = useCeramicContext();

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

  const [profileClone, setProfileClone] = useState<ProfileFormValues | undefined>();

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // pre-populate form fields with current data
    if (viewerProfile && !profileClone) {
      setProfileClone(viewerProfile)

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

    // TODO: change this mutation to setBasicProfile as createBasicProfile is deprecated soon
    const update = await composeClient.executeQuery(`
        mutation {
          createProfile(input: {
            content: {
              displayName: "${data?.displayName || ""}"
              username: "${data?.username || ""}"
              bio: "${data?.bio?.replace(/\n/g, "\\n") || ""}"
              pfp: "${uploadedPfp || ""}"
            }
          }) 
          {
            document {
              displayName
              username
              bio
              pfp
            }
          }
        }
      `);
    console.log({ update })
    if (update.errors) {
      toast({ title: `Something went wrong: ${update.errors}` })
    } else {
      toast({ title: "Updated profile" })
      setLoading(true);
      getViewerProfile()
    }
    setLoading(false);
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    console.log('onSubmit => ', { data })
    await updateProfile(data)
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
              <FormItem>
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

          <Button type="submit" disabled={loading}>Save changes</Button>
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
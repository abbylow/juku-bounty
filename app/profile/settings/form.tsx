"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

import { useCeramicContext } from "@/components/ceramic/ceramic-provider"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

// TODO: add profile picture setup - upload to ipfs and store ipfs link
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
  pfp: z
    .string()
    .min(3, {
      message: "Profile picture link must be at least 3 characters.",
    })
    .max(100, {
      message: "Profile picture link must not be longer than 100 characters.",
    })
    .optional(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { composeClient, viewerProfile, getViewerProfile } = useCeramicContext();

  const [profileClone, setProfileClone] = useState<ProfileFormValues | undefined>();

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // pre-populate form fields with current data
    if (viewerProfile && !profileClone) {
      console.log('prepopulate')
      setProfileClone(viewerProfile)
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

    // TODO: change this mutation to setBasicProfile as createBasicProfile is deprecated soon
    // TODO: add pfp field here
    const update = await composeClient.executeQuery(`
        mutation {
          createBasicProfile(input: {
            content: {
              displayName: "${data?.displayName || ""}"
              username: "${data?.username || ""}"
              bio: "${data?.bio?.replace(/\n/g, "\\n") || ""}"
            }
          }) 
          {
            document {
              displayName
              username
              bio
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
    await updateProfile(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
        <Button type="submit" disabled={loading}>Save changes</Button>
      </form>
    </Form>
  )
}
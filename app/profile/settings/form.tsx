"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { cn } from "@/lib/utils"
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

// TODO: update validation rules
// TODO: update onSubmit handling
// TODO: learn more about the form and zod library
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
    }),
  bio: z
    .string()
    .min(4, {
      message: "About me must be at least 4 characters.",
    })
    .max(160, {
      message: "About me must not be longer than 160 characters.",
    }),
  // pfp: z
  //   .string()
  //   .min(3, {
  //     message: "Profile picture link must be at least 3 characters.",
  //   })
  //   .max(100, {
  //     message: "Profile picture link must not be longer than 100 characters.",
  //   }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    mode: "onChange",
  })

  function onSubmit(data: ProfileFormValues) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="john-doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="displayName"
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
        <Button type="submit">Save changes</Button>
      </form>
    </Form>
  )
}

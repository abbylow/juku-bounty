"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link";
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { toast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { useCeramicContext } from "@/components/ceramic/ceramic-provider"
import { PROFILE_SETTINGS_URL } from "@/const/links";
import { useEffect, useState } from "react";
import { INotificationSettings } from "@/components/ceramic/types";
import { useViewerContext } from "@/contexts/viewer";

const notificationFormSchema = z.object({
  platformNewFeature: z.boolean(),
  platformNewQuest: z.boolean(),
  newContributionToInvolvedQuest: z.boolean(),
  newLikesToInvolvedQuest: z.boolean(),
  newRepliesToInvolvedQuest: z.boolean(),
  statusChangeToInvolvedQuest: z.boolean(),
  beMentioned: z.boolean()
})

type NotificationFormValues = z.infer<typeof notificationFormSchema>

const defaultValues: Partial<NotificationFormValues> = {
  platformNewFeature: true,
  platformNewQuest: true,
  newContributionToInvolvedQuest: true,
  newLikesToInvolvedQuest: true,
  newRepliesToInvolvedQuest: true,
  statusChangeToInvolvedQuest: true,
  beMentioned: true
}

export function ProfileNotificationForm() {
  const { composeClient, viewerProfile } = useCeramicContext();
  // console.log('notifi:: viewerProfile notificationSettings = ', viewerProfile?.notificationSettings)

  const queryClient = useQueryClient();

  const [settingsClone, setSettingsClone] = useState<INotificationSettings | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // pre-populate form fields with current data
    if (viewerProfile?.notificationSettings && !settingsClone) {
      // console.log('notifi:: pre populating ', { ...viewerProfile.notificationSettings })
      setSettingsClone({ ...viewerProfile.notificationSettings })
    }
    // set loading to true when it's still getting viewer profile
    if (viewerProfile !== undefined) {
      setLoading(false)
    }
  }, [viewerProfile, settingsClone])

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues,
    values: settingsClone,
    mode: "onBlur",
  })

  const onSubmit = async (data: NotificationFormValues) => {
    console.log('notifi:: onSubmit data = ', { data })
    setLoading(true);

    const update = await composeClient.executeQuery(`
      mutation {
        updateProfile(
          input: {
            id: "${viewerProfile?.id}",
            content: {
              editedAt: "${new Date().toISOString()}",
              notificationSettings: {
                platformNewFeature: ${data.platformNewFeature},
                platformNewQuest: ${data.platformNewQuest},
                newContributionToInvolvedQuest: ${data.newContributionToInvolvedQuest},
                newLikesToInvolvedQuest: ${data.newLikesToInvolvedQuest},
                newRepliesToInvolvedQuest: ${data.newRepliesToInvolvedQuest},
                statusChangeToInvolvedQuest: ${data.statusChangeToInvolvedQuest},
                beMentioned: ${data.beMentioned}
              }
            }
          }
        ) {
          document {
            id
            notificationSettings {
              platformNewFeature
              platformNewQuest
              newContributionToInvolvedQuest
              newLikesToInvolvedQuest
              newRepliesToInvolvedQuest
              statusChangeToInvolvedQuest
              beMentioned
            }
          }
        }
      }
    `);
    console.log("profile/settings/notification/form ", { update })
    
    if (update?.errors) {
      console.log('notifi:: graphql error', update.errors)
      toast({ title: `Something went wrong: ${update.errors}` })
    } else {
      toast({ title: "Updated notification settings" })
      setLoading(true);
      queryClient.invalidateQueries({ queryKey: ['retrieveViewerProfile'] })
    }
    setLoading(false);
  }

  const { viewer } = useViewerContext()
  // prompt user to create profile first 
  if (viewer === null) {
    return (
      <section>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Set up your basic profile first</h3>
            <Link href={PROFILE_SETTINGS_URL} className={buttonVariants({ variant: "outline" })}>
              Set up profile
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h3 className="mb-4 text-base font-medium">Platform Updates</h3>
          <div className="space-y-4">
            <FormField
              disabled={loading}
              control={form.control}
              name="platformNewFeature"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      New features
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={loading}
              control={form.control}
              name="platformNewQuest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      New platform quests
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-base font-medium">Quest Updates</h3>
          <div className="space-y-4">
            <FormField
              disabled={loading}
              control={form.control}
              name="newContributionToInvolvedQuest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      New contribution to your involved quests
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={loading}
              control={form.control}
              name="newLikesToInvolvedQuest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      New likes to your created quests
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={loading}
              control={form.control}
              name="newRepliesToInvolvedQuest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      New replies to your contributed quests
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={loading}
              control={form.control}
              name="statusChangeToInvolvedQuest"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      Status change to your contributed quests
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={loading}
              control={form.control}
              name="beMentioned"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>
                      Be mentioned
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button type="submit" disabled={loading}>Save changes</Button>
      </form>
    </Form>
  )
}

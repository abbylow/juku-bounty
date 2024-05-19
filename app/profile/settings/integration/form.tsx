"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { toast } from "@/components/ui/use-toast"

// TODO: update validation rules
// TODO: update onSubmit handling
// TODO: remove unused form functions
// TODO: TBD - which platform to integrate and what data to be imported?
const integrationFormSchema = z.object({
  linkedin: z.string(),
  twitter: z.string(),
})

type IntegrationFormValues = z.infer<typeof integrationFormSchema>

const defaultValues: Partial<IntegrationFormValues> = {
  linkedin: '',
  twitter: ''
}

export function ProfileIntegrationForm() {
  const form = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues,
    mode: "onBlur",
  })

  function onSubmit(data: IntegrationFormValues) {
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
        <div>
          <h3 className="mb-4 text-base font-medium">Link and/or authenticate your Juku profile with your other social accounts to increase the credentials and showcase your skills.</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="block mt-2"
                    // onClick={} //TODO: connect 
                    >
                      Connect
                    </Button>
                  </FormControl>
                  <FormDescription>
                    Link your LinkedIn to import experience
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="twitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>X (Formerly Twitter)</FormLabel>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="block mt-2"
                    // onClick={} //TODO: connect 
                    >
                      Connect
                    </Button>
                  </FormControl>
                  <FormDescription>
                    Link your Twitter to import number of followers
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>


        <Button type="submit">Update integration</Button>
      </form>
    </Form>
  )
}

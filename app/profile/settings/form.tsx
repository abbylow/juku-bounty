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
// TODO: TBD - add job experience, certificates, education
// TODO: skill field
const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(2, {
      message: "Display name must be at least 2 characters.",
    })
    .max(30, {
      message: "Display name must not be longer than 30 characters.",
    }),
  bio: z.string().max(160).min(4),
  skills: z
    .array(
      z.object({
        value: z
          .string()
          .min(2, {
            message: "Skill name must be at least 2 characters.",
          })
          .max(30, {
            message: "Skill name must not be longer than 30 characters.",
          }),
      })
    )
    .max(3, {
      message: "Skills must not contain more than 3 items.",
    })
    .refine(items => {
      const uniqueValues = new Set(items.map(item => item.value));
      return uniqueValues.size === items.length;
    }, {
      message: "Each skill must be unique",
    })
    .optional()
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const defaultValues: Partial<ProfileFormValues> = {
  displayName: "John Doe",
  bio: "I am an interesting human",
  skills: [
    { value: "" },
  ],
}

export function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  })

  const { fields, append } = useFieldArray({
    name: "skills",
    control: form.control,
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
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name. It can be your real name or a pseudonym.
              </FormDescription>
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
                  placeholder="Tell us a little bit about yourself"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                You can write about your years of experience, industry, or skills. People also talk about their achievements or previous job experiences.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`skills.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && "sr-only")}>
                    Skills
                  </FormLabel>
                  {/* <FormDescription className={cn(index !== 0 && "sr-only")}>
                    Add your skills here.
                  </FormDescription> */}
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          {fields.length < 3 &&
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append({ value: "" })}
            >
              Add Skill
            </Button>
          }
        </div>
        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  )
}

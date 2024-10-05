"use client"

import { UserRound } from "lucide-react"
import React from "react"
import { SubmitHandler, UseFormReturn } from "react-hook-form"

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

export function ProfileFormComponent({
  form,
  onSubmit,
  dataUrl,
  triggerPfpInput,
  loading,
  checkDuplication,
  media,
  handlePfpChange,
  pfpRef
}: {
  form: UseFormReturn<{
    username: string;
    displayName: string;
    categories: {
      value: string;
      label: string;
      disable?: boolean | undefined;
    }[];
    bio?: string | undefined;
  }, any, undefined>;
  onSubmit: SubmitHandler<{
    username: string;
    displayName: string;
    categories: {
      label: string;
      value: string;
      disable?: boolean | undefined;
    }[];
    bio?: string | undefined;
  }>;
  dataUrl: string;
  triggerPfpInput: (e: React.MouseEvent<HTMLButtonElement>) => void;
  loading: boolean;
  checkDuplication: (e: any) => Promise<void>;
  media: File | null | undefined;
  handlePfpChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pfpRef: React.RefObject<HTMLInputElement>;
}) {
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
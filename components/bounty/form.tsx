import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { UseFormReturn } from "react-hook-form"
import { Dispatch, SetStateAction } from "react"

import BountyCreateDialog from "@/components/bounty/create-dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { TERMS_OF_SERVICE_URL } from "@/const/links"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { tomorrow, oneMonthFromNow, EXPIRY_PRESET, ACCEPTABLE_CURRENCIES, ACCEPTABLE_CURRENCIES_ADDRESS_TYPE } from "@/app/bounty/create/const";
import { BountyFormValues } from "@/app/bounty/create/form-schema"

interface IBountyForm {
  form: UseFormReturn<BountyFormValues>, 
  loading: boolean,
  setLoading: Dispatch<SetStateAction<boolean>>,
  categoryOptions: Option[]
  tagOptions: Option[]
}

export function BountyForm({
  form,
  loading,
  setLoading,
  categoryOptions,
  tagOptions
}: IBountyForm) {
  return (
    <Form {...form}>
      <form className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Insert a catchy title to summarize your quest"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide context for your quest, state your quest completion goal and reward criteria clearly."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap gap-4">
          <FormField
            control={form.control}
            name="numberOfRewarders"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Rewarders</FormLabel>
                <FormControl onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(+(e?.target?.value))}>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    step={1}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rewardCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                  <FormControl>
                    <SelectTrigger >
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {
                      Object.keys(ACCEPTABLE_CURRENCIES).map(c => (
                        <SelectItem value={ACCEPTABLE_CURRENCIES[c]} key={c}>{c}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amountPerRewarder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount per Rewarder</FormLabel>
                <FormControl onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.onChange(+(e?.target?.value))}>
                  <Input
                    type="number"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="expiry"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Expiry Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="flex w-auto flex-col space-y-2 p-2" align="start">
                  <Select
                    onValueChange={(value) => { field.onChange(EXPIRY_PRESET[value]) }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {Object.keys(EXPIRY_PRESET).map(p => (
                        <SelectItem value={p} key={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="rounded-md border">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < tomorrow || date > oneMonthFromNow
                      }
                      initialFocus
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expert Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {
                    categoryOptions.map(c => (
                      <SelectItem value={c.value} key={c.value}>{c.label}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <MultipleSelector
                  {...field}
                  creatable
                  maxSelected={5}
                  onMaxSelected={(maxLimit) => {
                    toast({
                      title: `You have reached max selected: ${maxLimit}`,
                    });
                  }}
                  defaultOptions={tagOptions}
                  hidePlaceholderWhenSelected={true}
                  placeholder="Add tags for discovery..."
                  emptyIndicator={
                    <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                      no results found.
                    </p>
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <BountyCreateDialog form={form} disabled={!(form?.formState?.isValid) || loading} loading={loading} setLoading={setLoading}/>

        <p className="text-sm text-muted-foreground">
          By confirming to open the bounty, you hereby acknowledge that you have read and accept our {" "}
          <a href={TERMS_OF_SERVICE_URL} rel="noreferrer noopener" target="_blank" className="transition-colors text-foreground/60 underline hover:text-foreground/80">
            Terms of Service
          </a>.
        </p>
      </form >
    </Form >
  )
}

import { format } from "date-fns"
import { CalendarIcon } from "@radix-ui/react-icons"
import { SubmitHandler, UseFormReturn } from "react-hook-form"
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
interface IBountyForm {
  form: UseFormReturn<{
    title: string;
    description: string;
    numberOfRewarders: number;
    expiry: Date;
    category: string;
    rewardCurrency: ACCEPTABLE_CURRENCIES_ADDRESS_TYPE;
    amountPerRewarder: number;
    tags?: {
      label: string,
      value: string
    }[] | undefined;
  }, any, undefined>
  onSubmit: SubmitHandler<{
    title: string;
    description: string;
    numberOfRewarders: number;
    expiry: Date;
    category: string;
    rewardCurrency: ACCEPTABLE_CURRENCIES_ADDRESS_TYPE;
    amountPerRewarder: number;
    tags?: {
      label: string,
      value: string
    }[] | undefined;
  }>
  loading: boolean
  categoryOptions: Option[]
  tagOptions: Option[] 
}

export function BountyForm({
  form,
  onSubmit,
  loading,
  categoryOptions,
  tagOptions
}: IBountyForm) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          disabled={loading}
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
          disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
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
          disabled={loading}
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
                      disabled={loading}
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
          disabled={loading}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expert Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
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
          disabled={loading}
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

        <Button type="submit" disabled={loading}>Submit</Button>

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

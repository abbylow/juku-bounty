"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useActiveAccount, useReadContract } from "thirdweb/react"

import { getTags } from "@/actions/tag/getTags"
import { bountyFormSchema, BountyFormValues, defaultValues } from "@/app/bounty/create/form-schema";
import { BountyForm } from "@/components/bounty/form"
import { Label } from "@/components/ui/label"
import { Option } from '@/components/ui/multiple-selector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QUEST_TEMPLATES } from "@/const/quest-templates"
import { useCategoryContext } from "@/contexts/categories"
import { useViewerContext } from "@/contexts/viewer"
import { escrowContractInstance } from "@/lib/contract-instances"

export function BountyCreationForm() {
  const { isCategoriesPending, categoryOptions } = useCategoryContext();

  const [loading, setLoading] = useState<boolean>(false);

  const [ready, setReady] = useState<boolean>(false);

  const { data: tags, isPending: isTagsPending } = useQuery({
    queryKey: ['fetchAllTags'],
    queryFn: async () => await getTags(),
  })

  const tagOptions: Option[] = tags?.map(tag => ({
    value: tag.slug,
    label: tag.name,
  })) || [];

  const { data: platformRate, isLoading: isPlatformRateLoading } = useReadContract({
    contract: escrowContractInstance,
    method: "platformRate",
  });

  useEffect(() => {
    if (!isCategoriesPending && !isTagsPending && !isPlatformRateLoading) {
      setReady(true);
    }
  }, [isCategoriesPending, isTagsPending, isPlatformRateLoading])

  const [formValues, setFormValues] = useState({ ...defaultValues });

  const form = useForm<BountyFormValues>({
    resolver: zodResolver(bountyFormSchema),
    defaultValues,
    values: formValues as BountyFormValues,
    mode: "onBlur",
  })

  const selectTemplate = (templateId: string) => {
    setFormValues((currentValues) => {
      return {
        ...currentValues,
        title: QUEST_TEMPLATES[templateId].title,
        description: QUEST_TEMPLATES[templateId].description
      }
    })
  }

  return (
    <>
      <div className="space-y-2">
        <Label>Quest Template</Label>
        <Select onValueChange={selectTemplate} defaultValue={"empty"} disabled={loading}>
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {
              Object.keys(QUEST_TEMPLATES).map(template => (
                <SelectItem value={template} key={template}>
                  {QUEST_TEMPLATES[template].type}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>
      {
        ready && <BountyForm
          form={form}
          loading={loading}
          setLoading={setLoading}
          categoryOptions={categoryOptions}
          tagOptions={tagOptions}
        />
      }
    </>
  )
}

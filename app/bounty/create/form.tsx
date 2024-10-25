"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"

import { toast } from "@/components/ui/use-toast"
import { useCeramicContext } from "@/components/ceramic/ceramic-provider"
import { Option } from '@/components/ui/multiple-selector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QUEST_TEMPLATES } from "@/const/quest-templates"
import { Label } from "@/components/ui/label"
import { bountyFormSchema, BountyFormValues, defaultValues, ExtendedBountyFormValues } from "@/app/bounty/create/form-schema";
import { BountyForm } from "@/components/bounty/form"
import { useCategoryContext } from "@/contexts/categories"
import { useViewerContext } from "@/contexts/viewer"
import { escrowContract } from "@/const/contracts"
import { currentChain } from "@/const/chains"
import { getTags } from "@/actions/tag/getTags"
import { createBounty } from "@/actions/bounty/createBounty"

export function BountyCreationForm() {
  const { composeClient, viewerProfile } = useCeramicContext();
  const { viewer, isViewerPending } = useViewerContext();
  const { isCategoriesPending, categoryOptions } = useCategoryContext();

  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);

  const [ready, setReady] = useState<boolean>(false);

  const { data: tags, isPending: isTagsPending } = useQuery({
    queryKey: ['fetchAllTags'],
    queryFn: async () => await getTags(),
  })

  // Transform tags into options
  const tagOptions: Option[] = tags?.map(tag => ({
    value: tag.slug,
    label: tag.name,
  })) || [];

  useEffect(() => {
    if (!isCategoriesPending && !isTagsPending) {
      setReady(true);
    }
  }, [isCategoriesPending, isTagsPending])

  const [formValues, setFormValues] = useState({ ...defaultValues });

  const form = useForm<BountyFormValues>({
    resolver: zodResolver(bountyFormSchema),
    defaultValues,
    values: formValues as BountyFormValues,
    mode: "onBlur",
  })

  const handleSubmit = async (data: Partial<ExtendedBountyFormValues>) => {
    setLoading(true);

    try {
      // TODO: 1.create bounty on smart contract first
      const createdBounty = await createBounty({
        title: data?.title!,
        description: data?.description?.replace(/\n/g, "\\n"),
        expiry: data?.expiry?.toISOString()!,
        escrowContractAddress: escrowContract,
        escrowContractChainId: String(currentChain.id),
        bountyIdOnEscrow: 1, //TODO: 2. replace this with real bounty ID
        creatorProfileId: viewer?.id!,
        category: +data?.category!,
        tags: data.tags
      })
      console.log({ createdBounty })

      toast({ title: "Created Bounty" })
      if (createdBounty) {
        router.push(`/bounty/${createdBounty.id}`)
      } else {
        throw new Error('Fail to create bounty')
      }
    } catch (error) {
      toast({ title: `Something went wrong: ${error}` })
    } finally {
      setLoading(false);
    }
  };

  const transformTags = (tags: Option[]): Option[] => {
    return tags.map(tag => ({
      ...tag,
      value: tag.label.toLowerCase().replace(/\s+/g, "_")
    }));
  }

  const onSubmit: SubmitHandler<BountyFormValues> = async (data) => {
    console.log("Submitting form with data:", { data }, {...data, tags: transformTags(data.tags || [])});
    await handleSubmit(data)
  }

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
          onSubmit={onSubmit}
          loading={loading}
          categoryOptions={categoryOptions}
          tagOptions={tagOptions}
        />
      }
    </>
  )
}

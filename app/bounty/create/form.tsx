"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "@/components/ui/use-toast"
import { useCeramicContext } from "@/components/ceramic/ceramic-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QUEST_TEMPLATES } from "@/const/quest-templates"
import { Label } from "@/components/ui/label"
import { bountyFormSchema, BountyFormValues, defaultValues } from "@/app/bounty/create/form-schema";
import { BountyForm } from "@/components/bounty/form"

export function BountyCreationForm() {
  const { composeClient, viewerProfile } = useCeramicContext();

  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (viewerProfile !== undefined) {
      setLoading(false)
    }
  }, [viewerProfile])

  const [formValues, setFormValues] = useState({ ...defaultValues });

  const form = useForm<BountyFormValues>({
    resolver: zodResolver(bountyFormSchema),
    defaultValues,
    values: formValues as BountyFormValues,
    mode: "onBlur",
  })

  const createBounty = async (data: Partial<BountyFormValues>) => {
    // console.log("before submission ", { viewerProfile, data })

    setLoading(true);

    // TODO: set context according to the environment
    const creation = await composeClient.executeQuery(`
      mutation {
        createBounty(input: {
          content: {
            title: "${data?.title || ""}"
            description: "${data?.description?.replace(/\n/g, "\\n") || ""}"
            numberOfRewarders: ${data?.numberOfRewarders || ""}
            rewardCurrency: "${data?.rewardCurrency || ""}"
            amountPerRewarder: ${data?.amountPerRewarder || ""}
            expiry: "${data?.expiry?.toISOString() || ""}"
            createdAt: "${new Date().toISOString()}"
            profileId: "${viewerProfile?.id}"
            context: "dev_test"
          }
        }) 
        {
          document {
            id
            title
            description
            numberOfRewarders
            rewardCurrency
            amountPerRewarder
            expiry
          }
        }
      }
    `);
    // console.log({ creation })

    if (creation.errors) {
      toast({ title: `Something went wrong: ${creation.errors}` })
    } else {
      const createdBounty: any = creation?.data?.createBounty
      // console.log({ createdBounty })

      if (createdBounty?.document?.id) {
        // create bounty and category relationship
        const bountyCategory = await composeClient.executeQuery(`
          mutation {
            createBountyTopic(
              input: {
                content: {
                  active: true, 
                  topicId: "${data.category}", 
                  bountyId: "${createdBounty.document.id}", 
                  createdAt: "${new Date().toISOString()}"
                }
              }
            ) {
              document {
                active
                bountyId
                id
                topicId
                createdAt
              }
            }
          }
        `);
        // console.log({ bountyCategory })

        data?.tags?.map(async (t) => {
          // find existing tag with the slug, if not found create tag 
          const findTag = await composeClient.executeQuery(`
            query {
              tagIndex(
                filters: {
                  where: {
                    slug: {
                      equalTo: "${t.value}"
                    }
                  }
                }, first: 1) {
                edges {
                  node {
                    id
                    name
                    slug
                  }
                }
              }
            }
          `);
          // console.log({ findTag })

          let tagId: string;
          if (findTag?.data?.tagIndex?.edges.length === 0) {
            // create the tag first 
            const createdTag = await composeClient.executeQuery(`
              mutation {
                createTag(
                  input: {
                    content: {
                      name: "${t.label}", 
                      slug: "${t.value}", 
                      createdAt: "${new Date().toISOString()}"
                    }
                  }
                ) {
                  document {
                    id
                    name
                    slug
                  }
                }
              }
            `);
            // console.log({ createdTag })
            tagId = createdTag?.data?.createTag?.document?.id
          } else {
            tagId = findTag?.data?.tagIndex?.edges[0]?.node?.id
          }

          // create bounty and tag relationships
          const createdBountyTag = await composeClient.executeQuery(`
              mutation {
                createBountyTag(
                  input: {
                    content: {
                      tagId: "${tagId}", 
                      active: true, 
                      bountyId: "${createdBounty.document.id}", 
                      createdAt: "${new Date().toISOString()}"
                    }
                  }
                ) {
                  document {
                    active
                    bountyId
                    createdAt
                    id
                    tagId
                  }
                }
              }
            `);
          // console.log({ createdBountyTag })
        })

        toast({ title: "Created bounty" })
        router.push(`/bounty/${createdBounty.document.id}`)
      }
    }
    setLoading(false);
  };

  const onSubmit: SubmitHandler<BountyFormValues> = async (data) => {
    // console.log("Submitting form with data:", { data });
    await createBounty(data)
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
      <BountyForm
        form={form}
        onSubmit={onSubmit}
        loading={loading}
      />
    </>
  )
}

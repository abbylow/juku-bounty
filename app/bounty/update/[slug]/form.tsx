"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "@/components/ui/use-toast"
import { useCeramicContext } from "@/components/ceramic/ceramic-provider"
import { bountyFormSchema, BountyFormValues, defaultValues } from "@/app/bounty/create/form-schema";
import { BountyForm } from "@/components/bounty/form"
import { useCategoryContext } from "@/contexts/categories"

// NOTE: THIS FORM IS NOT COMPLETED. ALL CODE BELOW ARE MOSTLY CLONED FROM CREATION FORM AND NOT CORRECT FOR UPDATE ACTION. 
// TODO: pre-fill the form with existing bounty data (setFormValues)
// TODO: update bounty with latest form data
export function BountyUpdateForm() {
  const { composeClient, viewerProfile } = useCeramicContext();

  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);

  const { isCategoriesPending, categoryOptions } = useCategoryContext()

  useEffect(() => {
    if (viewerProfile !== undefined && !isCategoriesPending) {
      setLoading(false)
    }
  }, [viewerProfile, isCategoriesPending])

  const [formValues, setFormValues] = useState({ ...defaultValues });

  const form = useForm<BountyFormValues>({
    resolver: zodResolver(bountyFormSchema),
    defaultValues,
    values: formValues as BountyFormValues,
    mode: "onBlur",
  })

  const updateBounty = async (data: Partial<BountyFormValues>) => {
    // console.log("before submission ", { viewerProfile, data })

    setLoading(true);

    // TODO: set context according to the environment
    const creation = await composeClient.executeQuery(`
      mutation {
        createBounty(input: {
          content: {
            title: "${data?.title || ""}"
            description: "${data?.description?.replace(/\n/g, "\\n") || ""}"
            expiry: "${data?.expiry?.toISOString() || ""}"
            createdAt: "${new Date().toISOString()}"
            editedAt: "${new Date().toISOString()}"
            profileId: "${viewerProfile?.id}"
            context: "${process.env.NEXT_PUBLIC_CONTEXT_ID}"
          }
        }) 
        {
          document {
            id
            title
            description
            expiry
          }
        }
      }
    `);
    console.log("bounty/update/[slug]/form creation", { creation })

    if (creation.errors) {
      toast({ title: `Something went wrong: ${creation.errors}` })
    } else {
      const createdBounty: any = creation?.data?.createBounty
      // console.log({ createdBounty })

      if (createdBounty?.document?.id) {
        // create bounty and category relationship
        const bountyCategory = await composeClient.executeQuery(`
          mutation {
            createBountyCategory(
              input: {
                content: {
                  active: true, 
                  categoryId: "${data.category}", 
                  bountyId: "${createdBounty.document.id}", 
                  createdAt: "${new Date().toISOString()}",
                  editedAt: "${new Date().toISOString()}"
                }
              }
            ) {
              document {
                active
                bountyId
                id
                categoryId
                createdAt
                editedAt
              }
            }
          }
        `);
        console.log("bounty/update/[slug]/form bountyCategory", { bountyCategory })

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
          console.log("bounty/update/[slug]/form findTag", { findTag })

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
                      createdAt: "${new Date().toISOString()}",
                      editedAt: "${new Date().toISOString()}",
                      context: "${process.env.NEXT_PUBLIC_CONTEXT_ID}"
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
            console.log("bounty/update/[slug]/form createdTag", { createdTag })
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
                      createdAt: "${new Date().toISOString()}",
                      editedAt: "${new Date().toISOString()}",
                    }
                  }
                ) {
                  document {
                    active
                    bountyId
                    createdAt
                    editedAt
                    id
                    tagId
                  }
                }
              }
            `);
          console.log("bounty/update/[slug]/form", { createdBountyTag })
        })

        toast({ title: "Created bounty" })
        router.push(`/bounty/${createdBounty.document.id}`)
      }
    }
    setLoading(false);
  };

  const onSubmit: SubmitHandler<BountyFormValues> = async (data) => {
    console.log("Submitting form with data:", { data });
    // await updateBounty(data)
  }

  return (
    <BountyForm
      form={form}
      onSubmit={onSubmit}
      loading={loading}
      categoryOptions={categoryOptions}
    />
  )
}

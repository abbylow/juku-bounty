// "use client"

// import { zodResolver } from "@hookform/resolvers/zod"
// import { useFieldArray, useForm } from "react-hook-form"
// import { z } from "zod"

// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { toast } from "@/components/ui/use-toast"
// import { useEffect, useState } from "react"
// import { useCeramicContext } from "@/components/ceramic/ceramic-provider"

// // TODO: add profile picture setup - upload to ipfs and store ipfs link
// // TODO: update validation rules
// // TODO: update onSubmit handling
// // TODO: learn more about the form and zod library
// // TODO: check uncontrolled -> controlled issue (when text field on change)
// const profileFormSchema = z.object({
//   displayName: z
//     .string()
//     .min(3, {
//       message: "Display name must be at least 3 characters.",
//     })
//     .max(100, {
//       message: "Display name must not be longer than 100 characters.",
//     }),
//   username: z
//     .string()
//     .min(3, {
//       message: "Display name must be at least 3 characters.",
//     })
//     .max(100, {
//       message: "Display name must not be longer than 100 characters.",
//     }),
//   bio: z
//     .string()
//     .min(4, {
//       message: "About me must be at least 4 characters.",
//     })
//     .max(160, {
//       message: "About me must not be longer than 160 characters.",
//     })
//     .optional(),
//   // pfp: z
//   //   .string()
//   //   .min(3, {
//   //     message: "Profile picture link must be at least 3 characters.",
//   //   })
//   //   .max(100, {
//   //     message: "Profile picture link must not be longer than 100 characters.",
//   //   }),
// })

// type ProfileFormValues = z.infer<typeof profileFormSchema>

// export function ProfileForm() {
//   const { ceramic, composeClient } = useCeramicContext();

//   const [profile, setProfile] = useState<ProfileFormValues | undefined | null>();
//   const [loading, setLoading] = useState<boolean>(false);

//   const getProfile = async () => {
//     if (ceramic.did !== undefined) {
//       setLoading(true);
//       const viewerProfile = await composeClient.executeQuery(`
//         query {
//           viewer {
//             basicProfile {
//               id
//               author {
//                 id
//               }
//               displayName
//               username
//               bio
//             }
//           }
//         }
//       `);

//       console.log({ viewerProfile });

//       setProfile(viewerProfile?.data?.viewer?.basicProfile);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getProfile();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [ceramic.did, composeClient]);

//   // TODO: use query data as default value
//   const form = useForm<ProfileFormValues>({
//     resolver: zodResolver(profileFormSchema),
//     defaultValues: profile as Partial<ProfileFormValues>,
//     mode: "onChange",
//   })

//   const updateProfile = async (data: ProfileFormValues) => {
//     if (ceramic.did !== undefined) {
//       setLoading(true);

//       // TODO: change this mutation to setBasicProfile as createBasicProfile is deprecated soon
//       // TODO: don't pass if the value is undefined
//       const update = await composeClient.executeQuery(`
//         mutation {
//           createBasicProfile(input: {
//             content: {
//               displayName: "${data?.displayName}"
//               username: "${data?.username}"
//               bio: "${data?.bio}"
//             }
//           }) 
//           {
//             document {
//               displayName
//               username
//               bio
//             }
//           }
//         }
//       `);
//       if (update.errors) {
//         toast({ title: `Something went wrong: ${update.errors}` })
//       } else {
//         toast({ title: "Updated profile" })
//         setLoading(true);
//         await getProfile();
//       }
//       setLoading(false);
//     }
//   };

//   const onSubmit = async (data: ProfileFormValues) => {
//     console.log("onSubmit", data)
//     await updateProfile(data)
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
//         <FormField
//           control={form.control}
//           name="username"
//           disabled={loading}
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Username</FormLabel>
//               <FormControl>
//                 <Input placeholder="john-doe" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="displayName"
//           disabled={loading}
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Display name</FormLabel>
//               <FormControl>
//                 <Input placeholder="John Doe" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="bio"
//           disabled={loading}
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>About Me</FormLabel>
//               <FormControl>
//                 <Textarea
//                   placeholder="You can write about your years of experience, industry, or skills. People also talk about their achievements or previous job experiences."
//                   className="resize-none"
//                   {...field}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <Button type="submit" disabled={loading}>Save changes</Button>
//       </form>
//     </Form>
//   )
// }

// TODO: switch back to react-hook-form and zod
// NOTE: the form below is without validation
"use client"

import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"
import { useCeramicContext } from "@/components/ceramic/ceramic-provider"
import { Label } from "@/components/ui/label"

// TODO: add profile picture setup - upload to ipfs and store ipfs link
// TODO: update validation rules
// TODO: update onSubmit handling
// TODO: learn more about the form and zod library
const profileFormSchema = z.object({
  displayName: z
    .string()
    .min(3, {
      message: "Display name must be at least 3 characters.",
    })
    .max(100, {
      message: "Display name must not be longer than 100 characters.",
    }),
  username: z
    .string()
    .min(3, {
      message: "Display name must be at least 3 characters.",
    })
    .max(100, {
      message: "Display name must not be longer than 100 characters.",
    }),
  bio: z
    .string()
    .min(4, {
      message: "About me must be at least 4 characters.",
    })
    .max(160, {
      message: "About me must not be longer than 160 characters.",
    })
    .optional(),
  // pfp: z
  //   .string()
  //   .min(3, {
  //     message: "Profile picture link must be at least 3 characters.",
  //   })
  //   .max(100, {
  //     message: "Profile picture link must not be longer than 100 characters.",
  //   }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

type Profile = {
  id?: any
  displayName?: string
  username?: string
  bio?: string
  pfp?: string
}

export function ProfileForm() {
  const { ceramic, composeClient } = useCeramicContext();

  const [profile, setProfile] = useState<Profile | undefined | null>();
  const [loading, setLoading] = useState<boolean>(false);

  const getProfile = async () => {
    if (ceramic.did !== undefined) {
      setLoading(true);
      const viewerProfile = await composeClient.executeQuery(`
        query {
          viewer {
            basicProfile {
              id
              author {
                id
              }
              displayName
              username
              bio
            }
          }
        }
      `);
      setProfile(viewerProfile?.data?.viewer?.basicProfile);
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ceramic.did, composeClient]);

  const updateProfile = async () => {
    if (ceramic.did !== undefined) {
      setLoading(true);

      // TODO: change this mutation to setBasicProfile as createBasicProfile is deprecated soon
      const update = await composeClient.executeQuery(`
        mutation {
          createBasicProfile(input: {
            content: {
              displayName: "${profile?.displayName || ""}"
              username: "${profile?.username || ""}"
              bio: "${profile?.bio || ""}"
            }
          }) 
          {
            document {
              displayName
              username
              bio
            }
          }
        }
      `);
      if (update.errors) {
        toast({ title: `Something went wrong: ${update.errors}` })
      } else {
        toast({ title: "Updated profile" })
        setLoading(true);
        await getProfile();
      }
      setLoading(false);
    }
  };

  return (
    <form className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          placeholder="john-doe"
          name="username"
          disabled={loading}
          defaultValue={profile?.username || ""}
          onChange={(e) => {
            setProfile({ ...profile, username: e.target.value });
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          placeholder="John Doe"
          name="displayName"
          disabled={loading}
          defaultValue={profile?.displayName || ""}
          onChange={(e) => {
            setProfile({ ...profile, displayName: e.target.value });
          }}
        />
      </div>


      <div className="space-y-2">
        <Label htmlFor="bio">About Me</Label>
        <Textarea
          placeholder="You can write about your years of experience, industry, or skills. People also talk about their achievements or previous job experiences."
          className="resize-none"
          defaultValue={profile?.bio || ""}
          onChange={(e) => {
            setProfile({ ...profile, bio: e.target.value });
          }}
        />
      </div>

      <Button type="submit" disabled={loading} onClick={updateProfile}>Save changes</Button>
    </form>
  )
}

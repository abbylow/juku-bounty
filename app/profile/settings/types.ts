import { z } from "zod"
import { profileFormSchema } from "@/app/profile/settings/form-schema"

export type ProfileFormValues = z.infer<typeof profileFormSchema>

export type ProfileUpdateResponse = {
  document: {
    id: string;
    displayName: string;
    username: string;
    bio: string;
    pfp: string;
    createdAt: string;
    editedAt: string;
  };
};

export type ProfileTopicIndexResponse = {
  edges: Array<{
    node: {
      id: string;
      profileId: string;
      topicId: string;
      active: boolean;
    };
  }>;
};


import { CeramicClient } from "@ceramicnetwork/http-client";
import { ComposeClient } from "@composedb/client";
import { Dispatch, SetStateAction } from "react";

import { ProfileFormValues } from "@/app/profile/settings/types";

// TODO: update type here
export interface IPrivacySettings {
  allowReferGroup: "anyone" | "connections" | "noOne"
  allowReferKnowledgeBounty: boolean
  allowReferConsultation: boolean
  allowViewPortfolioGroup: "anyone" | "connectionsAndQuesters"
  allowViewWorkExperience: boolean
  allowViewSkillAttestation: boolean
  allowViewPeerRecommendation: boolean
}

export interface INotificationSettings {
  platformNewFeature: boolean
  platformNewQuest: boolean
  newContributionToInvolvedQuest: boolean
  newLikesToInvolvedQuest: boolean
  newRepliesToInvolvedQuest: boolean
  statusChangeToInvolvedQuest: boolean
  beMentioned: boolean
}

export interface IPlatform {
  id: string
  name: string
  verified: boolean
  profileId: string
}

export interface Profile extends ProfileFormValues {
  id: string;
  author: {
    id: string;
  };
  pfp: string;
  createdAt: string;
  walletAddress: string;
  loginMethod: string;
  context: string;
  profileCategoryList: {
    edges: {
      node: {
        categoryId: string
        profileId: string
        createdAt: string
      }
    }
  }
  profileCategoryListCount: number
  privacySettings?: IPrivacySettings
  notificationSettings?: INotificationSettings
  integrations?: IPlatform[]
}

export interface ICeramicContext {
  ceramic: CeramicClient,
  composeClient: ComposeClient,
  viewerProfile: Profile | null | undefined,
  setProfile: Dispatch<SetStateAction<Profile | null | undefined>>,
}
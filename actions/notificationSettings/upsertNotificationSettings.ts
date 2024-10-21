"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { decodeJWT } from "thirdweb/utils";

import { IUpsertNotificationSettingsParams, NotificationSettings, NotificationSettingsOrNull } from "@/actions/notificationSettings/type";
import { JWT_COOKIE_NAME } from "@/const/jwt";

export async function upsertNotificationSettings(params: IUpsertNotificationSettingsParams): Promise<NotificationSettingsOrNull> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  // check JWT before performing mutation
  const jwt = cookies().get(JWT_COOKIE_NAME);
  if (!jwt?.value) {
    throw new Error("Error updating notification settings due to invalid JWT");
  }
  const decoded = decodeJWT(jwt.value);
  const userAddressInJwt = decoded.payload.sub;

  if (userAddressInJwt !== params.walletAddress) {
    throw new Error("Unauthorized access to notification settings");
  }

  try {
    const notificationSettingsUpsertResult = await sql`
      INSERT INTO NotificationSettings (
        profile_id,
        platform_new_feature,
        platform_new_quest,
        new_contribution_to_involved_quest,
        new_likes_to_involved_quest,
        new_replies_to_involved_quest,
        status_change_to_involved_quest,
        be_mentioned,
        created_at,
        edited_at
      ) 
      VALUES (
        ${params.profileId},
        ${params.platformNewFeature ?? true},
        ${params.platformNewQuest ?? true},
        ${params.newContributionToInvolvedQuest ?? true},
        ${params.newLikesToInvolvedQuest ?? true},
        ${params.newRepliesToInvolvedQuest ?? true},
        ${params.statusChangeToInvolvedQuest ?? true},
        ${params.beMentioned ?? true},
        NOW(),
        NOW()
      )
      ON CONFLICT (profile_id) 
      DO UPDATE 
      SET 
        platform_new_feature = EXCLUDED.platform_new_feature,
        platform_new_quest = EXCLUDED.platform_new_quest,
        new_contribution_to_involved_quest = EXCLUDED.new_contribution_to_involved_quest,
        new_likes_to_involved_quest = EXCLUDED.new_likes_to_involved_quest,
        new_replies_to_involved_quest = EXCLUDED.new_replies_to_involved_quest,
        status_change_to_involved_quest = EXCLUDED.status_change_to_involved_quest,
        be_mentioned = EXCLUDED.be_mentioned,
        edited_at = NOW()
      RETURNING *;
    `;

    console.log("Notification settings upserted successfully", { notificationSettingsUpsertResult });
    return notificationSettingsUpsertResult.length > 0 ? notificationSettingsUpsertResult[0] as NotificationSettings : null;
  } catch (error) {
    console.log("Error upserting notification settings", error);
    throw new Error("Error upserting notification settings");
  }
}

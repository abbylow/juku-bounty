"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { decodeJWT } from "thirdweb/utils";

import { IUpsertPrivacySettingsParams, PrivacySettings, PrivacySettingsOrNull } from "@/actions/privacySettings/type";
import { JWT_COOKIE_NAME } from "@/const/jwt";

export async function upsertPrivacySettings(params: IUpsertPrivacySettingsParams): Promise<PrivacySettingsOrNull> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    // check JWT before performing mutation
    const jwt = cookies().get(JWT_COOKIE_NAME);
    if (!jwt?.value) {
      throw new Error("Error updating verified platform due to invalid JWT");
    }
    const decoded = decodeJWT(jwt.value);
    const userAddressInJwt = decoded.payload.sub;

    // Query the profile based on the wallet address from JWT
    const profileQuery = await sql`
      SELECT id FROM Profile WHERE wallet_address = ${userAddressInJwt};
    `;

    // If no profile is found, throw an error
    if (profileQuery.length === 0) {
      throw new Error("Profile not found for the provided wallet address from JWT.");
    }

    const profileIdFromDb = profileQuery[0].id;

    // Check if the profileId matches the one in params
    if (profileIdFromDb !== params.profileId) {
      throw new Error("Unauthorized access to verified platform. Profile ID does not match.");
    }
  } catch (error) {
    console.log('Fail to verify profile from JWT and params', error)
  }

  try {
    const privacySettingsUpsertResult = await sql`
      INSERT INTO PrivacySettings (
        profile_id,
        allow_refer_group,
        allow_refer_knowledge_bounty,
        allow_refer_consultation,
        allow_view_portfolio_group,
        allow_view_work_experience,
        allow_view_skill_attestation,
        allow_view_peer_recommendation,
        created_at,
        edited_at
      ) 
      VALUES (
        ${params.profileId},
        ${params.allowReferGroup || null},
        ${params.allowReferKnowledgeBounty ?? true},
        ${params.allowReferConsultation ?? true},
        ${params.allowViewPortfolioGroup || null},
        ${params.allowViewWorkExperience ?? true},
        ${params.allowViewSkillAttestation ?? true},
        ${params.allowViewPeerRecommendation ?? true},
        NOW(),
        NOW()
      )
      ON CONFLICT (profile_id) 
      DO UPDATE 
      SET 
        allow_refer_group = EXCLUDED.allow_refer_group,
        allow_refer_knowledge_bounty = EXCLUDED.allow_refer_knowledge_bounty,
        allow_refer_consultation = EXCLUDED.allow_refer_consultation,
        allow_view_portfolio_group = EXCLUDED.allow_view_portfolio_group,
        allow_view_work_experience = EXCLUDED.allow_view_work_experience,
        allow_view_skill_attestation = EXCLUDED.allow_view_skill_attestation,
        allow_view_peer_recommendation = EXCLUDED.allow_view_peer_recommendation,
        edited_at = NOW()
      RETURNING *;
    `;

    console.log("Privacy settings upserted successfully", { privacySettingsUpsertResult });
    return privacySettingsUpsertResult.length > 0 ? privacySettingsUpsertResult[0] as PrivacySettings : null;
  } catch (error) {
    console.log("Error upserting privacy settings", error);
    throw new Error("Error upserting privacy settings");
  }
}

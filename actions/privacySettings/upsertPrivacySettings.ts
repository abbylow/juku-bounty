"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { decodeJWT } from "thirdweb/utils";

import { IUpsertPrivacySettingsParams, PrivacySettings, PrivacySettingsOrNull } from "@/actions/privacySettings/type";
import { JWT_COOKIE_NAME } from "@/const/jwt";

export async function upsertPrivacySettings(params: IUpsertPrivacySettingsParams): Promise<PrivacySettingsOrNull> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  // check JWT before performing mutation
  const jwt = cookies().get(JWT_COOKIE_NAME);
  if (!jwt?.value) {
    throw new Error("Error updating privacy settings due to invalid JWT");
  }
  const decoded = decodeJWT(jwt.value);
  const userAddressInJwt = decoded.payload.sub;

  if (userAddressInJwt !== params.walletAddress) {
    throw new Error("Unauthorized access to privacy settings");
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

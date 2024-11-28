"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { decodeJWT } from "thirdweb/utils";

import { JWT_COOKIE_NAME } from "@/const/jwt";
import { CloseBountyParams } from "@/actions/bounty/type";

export async function closeBounty(params: CloseBountyParams): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("process.env.DATABASE_URL is not defined");
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Verify the JWT
    const jwt = cookies().get(JWT_COOKIE_NAME);
    if (!jwt?.value) {
      throw new Error("Authentication failed: JWT not found.");
    }

    const decoded = decodeJWT(jwt.value);
    const userAddressInJwt = decoded.payload.sub;

    // Ensure the user is the creator of the bounty
    const bounty = await sql`
      SELECT creator_profile_id, is_result_decided
      FROM Bounty
      WHERE id = ${params.bountyId} AND deleted_at IS NULL;
    `;

    if (bounty.length === 0) {
      throw new Error("Bounty not found.");
    }

    const { creator_profile_id: creatorProfileId, is_result_decided: isResultDecided } = bounty[0];

    if (isResultDecided) {
      throw new Error("Bounty has already been closed.");
    }

    const creatorProfile = await sql`
      SELECT id
      FROM Profile
      WHERE wallet_address = ${userAddressInJwt} AND deleted_at IS NULL;
    `;

    if (creatorProfile.length === 0 || creatorProfile[0].id !== creatorProfileId) {
      throw new Error("Unauthorized: Only the creator can close this bounty.");
    }

    // Update `is_result_decided` for the bounty
    await sql`
      UPDATE Bounty
      SET is_result_decided = TRUE, edited_at = NOW()
      WHERE id = ${params.bountyId};
    `;

    // Insert winning contributions into `BountyWinningContribution`
    const winningContributionValues = params.winningContributions.map(
      (contributionId) => `('${params.bountyId}', ${contributionId}, NOW(), NOW())`
    );

    if (winningContributionValues.length > 0) {
      const query = `
        INSERT INTO BountyWinningContribution (bounty_id, contribution_id, created_at, edited_at)
        VALUES ${winningContributionValues.join(", ")};
      `;
      console.log({ query });
      await sql(query);
    }
  } catch (error) {
    console.error("Error closing bounty:", error);
    throw new Error("Failed to close the bounty. Please try again.");
  }
}

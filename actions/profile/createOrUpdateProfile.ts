"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { decodeJWT } from "thirdweb/utils";

import { IUpsertProfileParams, Profile, ProfileOrNull } from "@/actions/profile/type";
import { JWT_COOKIE_NAME } from "@/const/jwt";

export async function createOrUpdateProfile(params: IUpsertProfileParams): Promise<ProfileOrNull> {
  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  // check JWT before performing mutation
  const jwt = cookies().get(JWT_COOKIE_NAME);
  if (!jwt?.value) {
    throw new Error("Error creating or updating profile due to invalid JWT");
  }
  const decoded = decodeJWT(jwt.value);
  const userAddressInJwt = decoded.payload.sub;

  if (userAddressInJwt !== params.walletAddress) {
    throw new Error("Error creating or updating profile due to unauthorized identity");
  }

  try {
    const profileUpsertResult = await sql`
      INSERT INTO Profile (
        display_name, 
        username, 
        bio, 
        pfp, 
        wallet_address, 
        login_method, 
        created_at, 
        edited_at
      ) 
      VALUES (
        ${params?.displayName}, 
        ${params?.username}, 
        ${params?.bio}, 
        ${params?.pfp}, 
        ${params?.walletAddress}, 
        ${params?.loginMethod}, 
        NOW(), 
        NOW()
      )
      ON CONFLICT (wallet_address) 
      DO UPDATE 
      SET 
        display_name = EXCLUDED.display_name,
        username = EXCLUDED.username,
        bio = EXCLUDED.bio,
        pfp = EXCLUDED.pfp,
        login_method = EXCLUDED.login_method,
        edited_at = NOW()
      RETURNING *;
    `;

    // Execute profile upsert query and get the profile id
    const profile = profileUpsertResult.length > 0 ? profileUpsertResult[0] as Profile : null;

    if (!profile) {
      throw new Error('Profile could not be created or updated');
    }

    const profileId = profile.id;

    // Retrieve existing ProfileCategory relationships
    const existingCategories = await sql`
      SELECT category_id, active FROM ProfileCategory 
      WHERE profile_id = ${profileId}
    `;

    // Create a Set of active category_ids from params.categories
    const activeCategoryIds = new Set(params?.categories?.map(category => category.value));
    // Collect categories to update as inactive
    const inactiveCategoryIds = existingCategories
      .filter(({ category_id }) => !activeCategoryIds.has(category_id))
      .map(({ category_id }) => category_id);

    // Set inactive status for categories not included in params.categories
    if (inactiveCategoryIds.length > 0) {
      await sql`
       UPDATE ProfileCategory
       SET active = false, edited_at = NOW()
       WHERE profile_id = ${profileId} AND category_id = ANY(${inactiveCategoryIds});
     `;
    }

    // Insert or update active categories in a single query
    if (params.categories && params.categories.length > 0) {
      const valuesClause = params.categories
        .map((category, index) => `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${index * 5 + 4}, $${index * 5 + 5})`)
        .join(", ");

      const values = params.categories.flatMap(category => [
        profileId,
        category.value,
        true,
        new Date(),
        new Date()
      ]);

      const query = `
        INSERT INTO ProfileCategory (profile_id, category_id, active, created_at, edited_at)
        VALUES ${valuesClause}
        ON CONFLICT (profile_id, category_id) 
        DO UPDATE SET active = true, edited_at = NOW();
      `;

      await sql(query, values);
    }

    return profile;
  } catch (error) {
    console.log("Error creating or updating profile ", error)
    throw new Error("Error creating or updating profile");
  }
}
"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";
import { decodeJWT } from "thirdweb/utils";

import { Bounty, BountyOrNull, CreateBountyParams } from "@/actions/bounty/type";
import { JWT_COOKIE_NAME } from "@/const/jwt";

export async function createBounty(params: CreateBountyParams): Promise<BountyOrNull> {
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
    if (profileIdFromDb !== params.creatorProfileId) {
      throw new Error("Unauthorized access to verified platform. Profile ID does not match.");
    }
  } catch (error) {
    console.log('Fail to verify profile from JWT and params', error)
  }

  try {
    const bountyResult = await sql`
      INSERT INTO Bounty (
        title,
        description,
        expiry,
        is_result_decided,
        escrow_contract_address,
        escrow_contract_chain_id,
        bounty_id_on_escrow,
        creator_profile_id,
        created_at,
        edited_at
      ) 
      VALUES (
        ${params.title},
        ${params.description || null},
        ${params.expiry},
        FALSE,
        ${params.escrowContractAddress},
        ${params.escrowContractChainId},
        ${params.bountyIdOnEscrow},
        ${params.creatorProfileId},
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    const bounty = bountyResult.length === 0 ? null : bountyResult[0] as Bounty;

    if (!bounty) {
      throw new Error("Error creating bounty.");
    }

    // Insert the single category into BountyCategory table
    if (params.category) {
      await sql`
        INSERT INTO BountyCategory (
          bounty_id,
          category_id,
          active,
          created_at,
          edited_at
        ) 
        VALUES (
          ${bounty.id},
          ${params.category},
          TRUE,
          NOW(),
          NOW()
        );
      `;
    }

    // Handle Tags: Iterate through params.tags and create or reuse tags
    if (params.tags && params.tags.length > 0) {
      const tagSlugs = params.tags.map(tag => tag.value);

      // Query all existing tags with provided slugs in a single query
      const existingTags = await sql`
        SELECT id, slug FROM Tag WHERE slug = ANY(${tagSlugs});
      `;
      const existingTagMap = new Map(existingTags.map((tag) => [tag.slug, tag.id]));

      // Separate tags into existing and new based on existingTagMap
      const newTags = params.tags.filter(tag => !existingTagMap.has(tag.value));

      // Insert new tags in bulk if any do not already exist
      if (newTags.length > 0) {
        const tagValuesClause = newTags
          .map((_, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`)
          .join(", ");

        const tagValues = newTags.flatMap(tag => [
          tag.label,
          tag.value,
          new Date(),
          new Date()
        ]);

        const tagQuery = `
          INSERT INTO Tag (name, slug, created_at, edited_at)
          VALUES ${tagValuesClause}
          RETURNING id, slug;
        `;

        const insertedTags = await sql(tagQuery, tagValues);
        // Add newly inserted tags to existingTagMap
        for (const insertedTag of insertedTags) {
          existingTagMap.set(insertedTag.slug, insertedTag.id);
        }
      }

      // Prepare values for bulk insert into BountyTag
      const bountyTagValuesClause = params.tags
        .map((_, index) => `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${index * 5 + 4}, $${index * 5 + 5})`)
        .join(", ");

      const bountyTagValues = params.tags.flatMap(tag => [
        bounty.id,
        existingTagMap.get(tag.value), // Use existing or newly created tag ID
        true,
        new Date(),
        new Date()
      ]);

      const bountyTagQuery = `
        INSERT INTO BountyTag (bounty_id, tag_id, active, created_at, edited_at)
        VALUES ${bountyTagValuesClause};
      `;

      // Insert all BountyTag relations in a single query
      await sql(bountyTagQuery, bountyTagValues);
    }

    return bounty;
  } catch (error) {
    console.log("Error creating bounty", error);
    throw new Error("Error creating bounty");
  }
}

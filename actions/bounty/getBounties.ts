"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";

import { Bounty, BountyWinningContribution, Contribution, GetBountiesParams } from "@/actions/bounty/type";
import { Tag } from "@/actions/tag/type";
import { BountyStatus } from "@/const/bounty-status";

export async function getBounties(params: GetBountiesParams): Promise<Bounty[]> {
  const _cookies = cookies()

  if (!process.env.DATABASE_URL) throw new Error("process.env.DATABASE_URL is not defined");

  const sql = neon(process.env.DATABASE_URL);

  try {
    let query = `
      SELECT 
        b.*, 
        bc.category_id AS category_id,
        t.id AS tag_id,
        t.name AS tag_name,
        t.slug AS tag_slug,
        bwc.id AS winning_contribution_id,
        bwc.contribution_id AS winning_contribution_contribution_id,
        ctb.id AS contribution_id,
        ctb.creator_profile_id AS contribution_creator_id,
        ctb.referee_id AS contribution_referee_id,
        ctb.description AS contribution_description,
        ctb.created_at AS contribution_created_at,
        ctb.edited_at AS contribution_edited_at,
        ctb.deleted_at AS contribution_deleted_at
      FROM (
        SELECT * FROM Bounty
        WHERE 1 = 1
    `;

    // Filter by category
    if (params.categoryId) {
      query += ` AND EXISTS (
        SELECT 1 FROM BountyCategory bc WHERE bc.bounty_id = Bounty.id AND bc.category_id = ${params.categoryId} AND bc.active = true
      )`;
    }

    // Filter by search term
    if (params.searchTerm) {
      query += ` AND (title ILIKE '%${params.searchTerm}%' OR description ILIKE '%${params.searchTerm}%')`;
    }

    // Filter by status
    if (params.status && params.status !== BountyStatus.UNKNOWN) {
      switch (params.status) {
        case BountyStatus.OPEN:
          query += ` AND NOT is_result_decided AND expiry > NOW()`;
          break;
        case BountyStatus.ENDED:
          query += ` AND is_result_decided AND NOT EXISTS (
            SELECT 1 FROM BountyWinningContribution bwc WHERE bwc.bounty_id = Bounty.id AND bwc.deleted_at IS NULL
          )`;
          break;
        case BountyStatus.COMPLETED:
          query += ` AND EXISTS (
            SELECT 1 FROM BountyWinningContribution bwc WHERE bwc.bounty_id = Bounty.id AND bwc.deleted_at IS NULL
          )`;
          break;
        case BountyStatus.EXPIRED:
          query += ` AND NOT is_result_decided AND expiry <= NOW()`;
          break;
      }
    }

    // Filter by relatedProfile
    if (params.relatedProfile) {
      query += ` AND (
        creator_profile_id = '${params.relatedProfile}' OR
        EXISTS (
          SELECT 1 FROM Contribution c 
          WHERE c.bounty_id = Bounty.id AND 
            (c.creator_profile_id = '${params.relatedProfile}' OR c.referee_id = '${params.relatedProfile}')
        )
      )`;
    }

    // Sorting and pagination
    query += ` ORDER BY ${params?.orderBy || "created_at"} ${params?.orderDirection || "DESC"} LIMIT ${params.limit} OFFSET ${params.offset}
      ) AS b
    `;

    // Join with other tables
    query += `
      LEFT JOIN BountyCategory bc ON b.id = bc.bounty_id AND bc.active = true
      LEFT JOIN BountyTag bt ON b.id = bt.bounty_id AND bt.active = true
      LEFT JOIN Tag t ON bt.tag_id = t.id
      LEFT JOIN BountyWinningContribution bwc ON b.id = bwc.bounty_id AND bwc.deleted_at IS NULL
      LEFT JOIN Contribution ctb ON b.id = ctb.bounty_id AND ctb.deleted_at IS NULL
    `;

    // Apply sorting
    query += ` ORDER BY b.${params?.orderBy || "created_at"} ${params?.orderDirection || "DESC"}`;

    // Execute query
    const result = await sql(query);

    // Process the result into bounties
    const bountiesMap: { [key: string]: Partial<Bounty> } = {};

    result.forEach((row) => {
      const bountyId = row.id;

      // Initialize the bounty if not in map
      if (!bountiesMap[bountyId]) {
        bountiesMap[bountyId] = {
          ...row,
          category_id: row.category_id,
          tags: [],
          winningContributions: [],
          contributions: [],
        };
      }

      // Add tags
      if (row.tag_id) {
        bountiesMap[bountyId].tags?.push({
          id: row.tag_id,
          name: row.tag_name,
          slug: row.tag_slug,
        } as Tag);
      }

      // Add winning contributions
      if (row.winning_contribution_id) {
        bountiesMap[bountyId].winningContributions?.push({
          id: row.winning_contribution_id,
          bounty_id: bountyId,
          contribution_id: row.winning_contribution_contribution_id,
        } as BountyWinningContribution);
      }

      const contributionMap: Record<number, Partial<Contribution>> = {};

      // Add contributions
      if (row.contribution_id) {
        if (!contributionMap[row.contribution_id]) {
          const thisContribution = {
            id: row.contribution_id,
            bounty_id: row.id,
            creator_profile_id: row.contribution_creator_id,
            referee_id: row.contribution_referee_id,
            description: row.contribution_description,
            created_at: new Date(row.contribution_created_at),
            edited_at: new Date(row.contribution_edited_at),
            deleted_at: row.contribution_deleted_at ? new Date(row.contribution_deleted_at) : null,
            creator: {
              id: row.contribution_creator_id,
              pfp: row.creator_pfp,
              display_name: row.creator_display_name,
              username: row.creator_username,
              wallet_address: row.creator_wallet_address
            },
            referee: row.contribution_referee_id
              ? {
                id: row.contribution_referee_id,
                display_name: row.referee_display_name,
                username: row.referee_username,
                wallet_address: row.referee_wallet_address
              }
              : null
          };

          contributionMap[row.contribution_id] = thisContribution

          bountiesMap[bountyId].contributions?.push(thisContribution)
        }
      }
      
    });

    return Object.values(bountiesMap) as Bounty[];
  } catch (error) {
    console.error("Error retrieving bounties:", error);
    throw new Error("Error retrieving bounties");
  }
}

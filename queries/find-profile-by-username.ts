import { ComposeClient } from "@composedb/client"
import { FoundProfileResponse } from "@/app/profile/settings/types"

export const findProfileByUsername = async (composeClient: ComposeClient, username: string) => {
  if (username) {
    const profileRes = await composeClient.executeQuery(`
      query {
        profileIndex(
        filters: {
          where: {
            username: {
              equalTo: "${username}",
            }
          }
        }, 
        first: 1
      ) {
          edges {
            node {
              id
              username
            }
          }
        }
      }
    `)
    console.log("findProfileByUsername", { profileRes })

    const foundProfileRes = profileRes?.data?.profileIndex as FoundProfileResponse

    if (foundProfileRes?.edges?.length) {
      return foundProfileRes?.edges[0]?.node;
    }
    return null;
  }
  return null;
}
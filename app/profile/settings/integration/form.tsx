"use client"

import { useEffect } from "react"
import { getContract } from "thirdweb";
import { useActiveAccount, useReadContract } from "thirdweb/react";

import { useCeramicContext } from "@/components/ceramic/ceramic-provider";
import { Button } from "@/components/ui/button";
import { currentChain } from "@/const/chains";
import { coinbaseIndexerContract, easContract } from "@/const/contracts";
import { verifiedAccountSchema } from "@/const/eas";
import { COINBASE_VERIFICATION_URL } from "@/const/links";
import { client } from "@/lib/thirdweb-client";

export function ProfileIntegrationForm() {
  const activeAccount = useActiveAccount();
  const { composeClient, viewerProfile } = useCeramicContext();
  // console.log('platform:: viewerProfile integrations = ', viewerProfile?.integrations)

  // use coinbase indexer to find if the wallet has any corresponding attestation with the schema
  const indexerContract = getContract({
    client,
    chain: currentChain,
    address: coinbaseIndexerContract
  });

  const { data: attestationUid } = useReadContract({
    contract: indexerContract,
    method: "function getAttestationUid(address recipient, bytes32 schemaUid) external view returns (bytes32)",
    params: [(activeAccount?.address || "0x"), verifiedAccountSchema],
    // params: ["0xB18e4C959bccc8EF86D78DC297fb5efA99550d85", verifiedAccountSchema] // hardcoded valid address
  });

  // use the responded attestation uid to check if it's valid in EAS contract
  const eas = getContract({
    client,
    chain: currentChain,
    address: easContract
  });

  const { data: attestationValid, status: attestationStatus } = useReadContract({
    contract: eas,
    method: "function isAttestationValid(bytes32 uid) public view returns (bool)",
    params: [attestationUid || "0x"]
  });

  const verifyCoinbase = () => {
    window.open(COINBASE_VERIFICATION_URL, '_blank', 'noreferrer noopener')
  }

  const createCbRecord = async (verified: boolean) => {
    const creation = await composeClient.executeQuery(`
      mutation {
        createCoinbaseIntegration(
          input: {
            content: {
              name: "coinbase_verified_account", 
              createdAt: "${new Date().toISOString()}",
              editedAt: "${new Date().toISOString()}",
              verified: ${verified}, 
              profileId: "${viewerProfile?.id}"
            }
          }
        ) {
          document {
            id
            name
            profileId
            verified
          }
        }
      }
    `);
    console.log("profile/settings/integration/form", { creation })
  }

  const updateCbRecord = async (id: string, verified: boolean) => {
    const update = await composeClient.executeQuery(`
      mutation {
        updateCoinbaseIntegration(
          input: {
            content: {
              verified: ${verified}, 
              profileId: "${viewerProfile?.id}",
              editedAt: "${new Date().toISOString()}",
            },
            id: "${id}"
          }
        ) {
          document {
            id
            name
            profileId
            verified
          }
        }
      }
    `);
    console.log("profile/settings/integration/form", { update })
  }

  // sync the latest coinbase verification result to ceramic
  useEffect(() => {
    console.log("platform:: ", { attestationValid, viewerProfile, attestationStatus })
    console.log(viewerProfile?.integrations.find(el => el.name === 'coinbase_verified_account'))
    // only perform this when attestation is loaded successfully 
    if (attestationStatus === 'success') {
      // create new record if there is no existing coinbase record 
      if (!viewerProfile?.integrations || viewerProfile?.integrations.filter(el => el.name === 'coinbase_verified_account').length < 1) {
        createCbRecord(attestationValid)
      } else {
        // update existing record if the attestation is updated
        const existingRecord = viewerProfile?.integrations.find(el => el.name === 'coinbase_verified_account')
        if (existingRecord?.verified !== attestationValid) {
          updateCbRecord(existingRecord?.id, attestationValid)
        }
      }
    }
  }, [attestationValid, viewerProfile, attestationStatus])

  return (
    <div>
      <div className="flex flex-col gap-2 mb-4">
        <h3 className="font-semibold">Coinbase Verification</h3>
        {
          attestationValid ? (
            <p className="text-sm text-muted-foreground">
              Verified Coinbase ID on this wallet address
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Click Verify button below to sign into your Coinbase account and verify Coinbase ID on this wallet address
              </p>
              <p className="text-sm text-muted-foreground">
                After verifying on Coinbase, you may try refreshing this page to get the updated verification.
              </p>
            </>
          )
        }
      </div>

      {
        attestationValid ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="block mt-2"
            disabled
          >
            Verified
          </Button>
        ) : (
          <Button
            type="button"
            variant="default"
            size="sm"
            className="block mt-2"
            onClick={verifyCoinbase}
          >
            Verify
          </Button>
        )
      }
    </div >
  )
}

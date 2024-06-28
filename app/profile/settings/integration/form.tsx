"use client"

import { getContract } from "thirdweb";
import { useActiveAccount, useReadContract } from "thirdweb/react";

import { Button } from "@/components/ui/button";
import { currentChain } from "@/const/chains";
import { coinbaseIndexerContract, easContract } from "@/const/contracts";
import { verifiedAccountSchema } from "@/const/eas";
import { COINBASE_VERIFICATION_URL } from "@/const/links";
import { client } from "@/lib/thirdweb-client";

export function ProfileIntegrationForm() {
  const activeAccount = useActiveAccount();

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

  const { data: attestationValid } = useReadContract({
    contract: eas,
    method: "function isAttestationValid(bytes32 uid) public view returns (bool)",
    params: [attestationUid || "0x"]
  });

  const verifyCoinbase = () => {
    window.open(COINBASE_VERIFICATION_URL, '_blank', 'noreferrer noopener')
  }

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

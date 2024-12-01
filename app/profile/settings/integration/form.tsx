"use client"

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useEffect } from "react"
import { getContract } from "thirdweb";
import { useActiveAccount, useReadContract } from "thirdweb/react";

import { Button, buttonVariants } from "@/components/ui/button";
import { currentChain } from "@/const/chains";
import { PROFILE_SETTINGS_URL } from "@/const/links";
import { coinbaseIndexerContract, easContract } from "@/const/contracts";
import { verifiedAccountSchema } from "@/const/eas";
import { COINBASE_VERIFICATION_URL } from "@/const/links";
import { coinbaseVerifiedAccount } from "@/const/verified_platform";
import { client } from "@/lib/thirdweb-client";
import { useViewerContext } from "@/contexts/viewer";
import { upsertVerifiedPlatform } from "@/actions/verifiedPlatform/upsertVerifiedPlatform";
import { getVerifiedPlatform } from "@/actions/verifiedPlatform/getVerifiedPlatform";

// use coinbase indexer to find if the wallet has any corresponding attestation with the schema
const indexerContract = getContract({
  client,
  chain: currentChain,
  address: coinbaseIndexerContract
});

// use the responded attestation uid to check if it's valid in EAS contract
const eas = getContract({
  client,
  chain: currentChain,
  address: easContract
});

export function ProfileIntegrationForm() {
  const activeAccount = useActiveAccount();
  const { viewer } = useViewerContext();

  const { data: verifiedCoinbase, isPending: isVerifiedCoinbasePending } = useQuery({
    queryKey: ['fetchVerifiedCoinbaseAcc', viewer?.id],
    queryFn: async () => await getVerifiedPlatform({ profileId: viewer?.id!, type: coinbaseVerifiedAccount }),
    enabled: !!(viewer?.id)
  })

  const { data: attestationUid } = useReadContract({
    contract: indexerContract,
    method: "function getAttestationUid(address recipient, bytes32 schemaUid) external view returns (bytes32)",
    params: [(activeAccount?.address || "0x"), verifiedAccountSchema],
    // params: ["0xB18e4C959bccc8EF86D78DC297fb5efA99550d85", verifiedAccountSchema] // hardcoded valid address
  });

  const { data: attestationValid, status: attestationStatus } = useReadContract({
    contract: eas,
    method: "function isAttestationValid(bytes32 uid) public view returns (bool)",
    params: [attestationUid || "0x"]
  });

  const verifyCoinbase = () => {
    window.open(COINBASE_VERIFICATION_URL, '_blank', 'noreferrer noopener')
  }

  const upsertRecord = useCallback(async (isValid: boolean) => {
    const result = await upsertVerifiedPlatform({
      profileId: viewer?.id!,
      type: coinbaseVerifiedAccount,
      verified: isValid,
    });
    console.log("upsertRecord ", { result })
  }, [viewer])

  useEffect(() => {
    // only perform this when attestation is loaded successfully 
    if (attestationStatus === 'success' && viewer) {
      if (!isVerifiedCoinbasePending && !verifiedCoinbase) {
        upsertRecord(attestationValid);
      }
      if (!isVerifiedCoinbasePending && verifiedCoinbase?.verified !== attestationValid) {
        upsertRecord(attestationValid);
      }
    }
  }, [attestationValid, attestationStatus, viewer, verifiedCoinbase, isVerifiedCoinbasePending, upsertRecord])

  // prompt user to create profile first 
  if (viewer === null) {
    return (
      <section>
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-medium">Set up your basic profile first</h3>
            <Link href={PROFILE_SETTINGS_URL} className={buttonVariants({ variant: "outline" })}>
              Set up profile
            </Link>
          </div>
        </div>
      </section>
    )
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

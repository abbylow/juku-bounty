"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { parseUnits, id } from "ethers/lib/utils"
import { BigNumber } from "ethers"
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { getContract, prepareContractCall, sendAndConfirmTransaction } from "thirdweb"
import { decimals } from "thirdweb/extensions/erc20";
import { useActiveAccount, useReadContract } from "thirdweb/react"

import { getTags } from "@/actions/tag/getTags"
import { createBounty } from "@/actions/bounty/createBounty"
import { bountyFormSchema, BountyFormValues, defaultValues } from "@/app/bounty/create/form-schema";
import { BountyForm } from "@/components/bounty/form"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Option } from '@/components/ui/multiple-selector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { QUEST_TEMPLATES } from "@/const/quest-templates"
import { useCategoryContext } from "@/contexts/categories"
import { useViewerContext } from "@/contexts/viewer"
import { currentChain } from "@/const/chains"
import { escrowContract } from "@/const/contracts"
import { client } from "@/lib/thirdweb-client"

// get escrow contract
const escrowContractInstance = getContract({
  client: client,
  chain: currentChain,
  address: escrowContract,
  abi: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "initialOwner",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "initialReferralRate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "initialPlatformRate",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "target",
          "type": "address"
        }
      ],
      "name": "AddressEmptyCode",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "AddressInsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "BountyAlreadyClosed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "BountyNotClosed",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ExceedsMaxWinners",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "FailedInnerCall",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InsufficientAllowance",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidMaxWinners",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidRate",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidRewardAmount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "LengthMismatch",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoClaimableFunds",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OnlyCreatorCanClose",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "token",
          "type": "address"
        }
      ],
      "name": "SafeERC20FailedOperation",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "bountyId",
          "type": "uint256"
        }
      ],
      "name": "BountyClosed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "bountyId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "rewardToken",
          "type": "address"
        }
      ],
      "name": "BountyCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "bountyId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "winner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "rewardToken",
          "type": "address"
        }
      ],
      "name": "FundClaimed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amountAdded",
          "type": "uint256"
        }
      ],
      "name": "PlatformFeeAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "token",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "admin",
          "type": "address"
        }
      ],
      "name": "PlatformFeeWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newRate",
          "type": "uint256"
        }
      ],
      "name": "PlatformRateUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newRate",
          "type": "uint256"
        }
      ],
      "name": "ReferralRateUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "bountyId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "referrer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "rewardAmount",
          "type": "uint256"
        }
      ],
      "name": "ReferrerSelected",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "bountyId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "refundAmount",
          "type": "uint256"
        }
      ],
      "name": "RefundableForCreator",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "bountyId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "winner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "rewardAmount",
          "type": "uint256"
        }
      ],
      "name": "WinnerSelected",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "bountyId",
          "type": "uint256"
        }
      ],
      "name": "bounties",
      "outputs": [
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "internalType": "contract IERC20",
          "name": "rewardToken",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amountPerWinner",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maxWinners",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "referralPercentage",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "platformRatePercentage",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "platformFee",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "isClosed",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "bountyCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "bountyId",
          "type": "uint256"
        }
      ],
      "name": "claimFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "bountyId",
          "type": "uint256"
        },
        {
          "internalType": "address[]",
          "name": "contributors",
          "type": "address[]"
        },
        {
          "internalType": "address[]",
          "name": "referrers",
          "type": "address[]"
        }
      ],
      "name": "closeBounty",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "tokenAddress",
          "type": "address"
        }
      ],
      "name": "collectedFees",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "totalFees",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "rewardTokenAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "maxWinners",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amountPerWinner",
          "type": "uint256"
        }
      ],
      "name": "createBounty",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "bountyId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getClaimableFunds",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "platformRate",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "referralRate",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "rate",
          "type": "uint256"
        }
      ],
      "name": "setPlatformRate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "rate",
          "type": "uint256"
        }
      ],
      "name": "setReferralRate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "tokenAddress",
          "type": "address"
        }
      ],
      "name": "withdrawPlatformFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
});

// Define the event signature (topic) for the BountyCreated event
const bountyCreatedEventSignature = id(
  "BountyCreated(uint256,address,address)"
);

export function BountyCreationForm() {
  const { viewer } = useViewerContext();
  const { isCategoriesPending, categoryOptions } = useCategoryContext();

  const router = useRouter();

  const activeAccount = useActiveAccount();

  const [loading, setLoading] = useState<boolean>(false);

  const [ready, setReady] = useState<boolean>(false);

  const { data: tags, isPending: isTagsPending } = useQuery({
    queryKey: ['fetchAllTags'],
    queryFn: async () => await getTags(),
  })

  const tagOptions: Option[] = tags?.map(tag => ({
    value: tag.slug,
    label: tag.name,
  })) || [];

  const { data: platformRate, isLoading: isPlatformRateLoading } = useReadContract({
    contract: escrowContractInstance,
    method: "platformRate",
  });

  useEffect(() => {
    if (!isCategoriesPending && !isTagsPending && !isPlatformRateLoading) {
      setReady(true);
    }
  }, [isCategoriesPending, isTagsPending, isPlatformRateLoading])

  const [formValues, setFormValues] = useState({ ...defaultValues });

  const form = useForm<BountyFormValues>({
    resolver: zodResolver(bountyFormSchema),
    defaultValues,
    values: formValues as BountyFormValues,
    mode: "onBlur",
  })

  const handleSubmit = async (data: BountyFormValues) => {
    setLoading(true);

    try {
      if (!activeAccount) {
        throw new Error('no active account')
      }

      // get reward token contract
      const rewardTokenInstance = getContract({
        client: client,
        chain: currentChain,
        address: data.rewardCurrency,
      });

      // get the decimals of the reward token 
      const rewardTokenDecimals = await decimals({
        contract: rewardTokenInstance
      })

      // transform to Bigint and calculate total reward, platform fee and total token amount to be approved by bounty creator
      const numberOfRewardersBigInt = BigInt(data.numberOfRewarders);
      const amountPerRewarderInDecimals = parseUnits(data.amountPerRewarder.toString(), rewardTokenDecimals).toBigInt();
      const totalReward = amountPerRewarderInDecimals * numberOfRewardersBigInt;
      const platformFee = platformRate ? (totalReward * platformRate) / BigInt(10000) : BigInt(0) // in basis points
      const sumToBeApproved = totalReward + platformFee;

      // prepare `approve` transaction
      const preparedApproveTx = prepareContractCall({
        contract: rewardTokenInstance,
        method: "function approve(address spender, uint256 value)",
        params: [escrowContract, sumToBeApproved],
      });

      // prompt bounty creator to approve the token (total reward + platform fee)
      const approveTxReceipt = await sendAndConfirmTransaction({
        transaction: preparedApproveTx,
        account: activeAccount,
      });

      // prepare `createBounty` transaction
      const preparedCreationTx = prepareContractCall({
        contract: escrowContractInstance,
        method: "createBounty",
        params: [data.rewardCurrency, numberOfRewardersBigInt, amountPerRewarderInDecimals],
      });

      // prompt bounty creator to send `createBounty` transaction
      const creationTxReceipt = await sendAndConfirmTransaction({
        transaction: preparedCreationTx,
        account: activeAccount,
      });

      if (creationTxReceipt.status !== "success") {
        throw new Error("Fail to create bounty on smart contract");
      }

      const logs = creationTxReceipt.logs;

      const creationLog = logs.find(log => log.topics[0] === bountyCreatedEventSignature);
      if (!creationLog) {
        throw new Error("Fail to get BountyCreated event log");
      }

      const bountyId = BigNumber.from(creationLog.topics[1]).toString();

      const createdBounty = await createBounty({
        title: data?.title!,
        description: data?.description?.replace(/\n/g, "\\n"),
        expiry: data?.expiry?.toISOString()!,
        escrowContractAddress: escrowContract,
        escrowContractChainId: String(currentChain.id),
        bountyIdOnEscrow: +bountyId,
        creatorProfileId: viewer?.id!,
        category: +data?.category!,
        tags: data.tags
      })
      console.log({ createdBounty })

      toast({ title: "Created Bounty" })
      if (createdBounty) {
        router.push(`/bounty/${createdBounty.id}`)
      } else {
        throw new Error('Fail to create bounty')
      }
    } catch (error) {
      console.log({ error })
      toast({ title: 'Something went wrong' })
    } finally {
      setLoading(false);
    }
  };

  const transformTags = (tags: Option[]): Option[] => {
    return tags.map(tag => ({
      ...tag,
      value: tag.label.toLowerCase().replace(/\s+/g, "_")
    }));
  }

  const onSubmit: SubmitHandler<BountyFormValues> = async (data) => {
    // console.log("Submitting form with data:", { data }, { ...data, tags: transformTags(data.tags || []) });
    await handleSubmit(data)
  }

  const selectTemplate = (templateId: string) => {
    setFormValues((currentValues) => {
      return {
        ...currentValues,
        title: QUEST_TEMPLATES[templateId].title,
        description: QUEST_TEMPLATES[templateId].description
      }
    })
  }

  return (
    <>
      <div className="space-y-2">
        <Label>Quest Template</Label>
        <Select onValueChange={selectTemplate} defaultValue={"empty"} disabled={loading}>
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {
              Object.keys(QUEST_TEMPLATES).map(template => (
                <SelectItem value={template} key={template}>
                  {QUEST_TEMPLATES[template].type}
                </SelectItem>
              ))
            }
          </SelectContent>
        </Select>
      </div>
      {
        ready && <BountyForm
          form={form}
          onSubmit={onSubmit}
          loading={loading}
          categoryOptions={categoryOptions}
          tagOptions={tagOptions}
        />
      }
    </>
  )
}

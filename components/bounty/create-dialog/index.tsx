import { BigNumber } from "ethers"
import { parseUnits } from "ethers/lib/utils"
import { Loader2 } from "lucide-react"
import { useRouter } from 'next/navigation'
import { Dispatch, SetStateAction, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { getContract, prepareContractCall, sendAndConfirmTransaction } from "thirdweb"
import { decimals } from "thirdweb/extensions/erc20"
import { useActiveAccount, useReadContract } from "thirdweb/react"

import { createBounty } from "@/actions/bounty/createBounty"
import { ACCEPTABLE_CURRENCIES } from "@/app/bounty/create/const"
import { BountyFormValues } from "@/app/bounty/create/form-schema"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { currentChain } from "@/const/chains"
import { escrowContract } from "@/const/contracts"
import { useViewerContext } from "@/contexts/viewer"
import { bountyCreatedEventSignature, escrowContractInstance } from "@/lib/contract-instances"
import { client } from "@/lib/thirdweb-client"

export default function BountyCreateDialog(
  { form, disabled, setLoading, loading }:
    {
      form: UseFormReturn<BountyFormValues>,
      disabled: boolean,
      setLoading: Dispatch<SetStateAction<boolean>>,
      loading: boolean
    }
) {

  const { viewer } = useViewerContext();

  const activeAccount = useActiveAccount();

  const router = useRouter();

  const { data: platformRate, isLoading: isPlatformRateLoading } = useReadContract({
    contract: escrowContractInstance,
    method: "platformRate",
  });

  const [approved, setApproved] = useState<boolean>(false);

  const data = form.getValues()

  // get reward token contract
  const rewardTokenInstance = getContract({
    client: client,
    chain: currentChain,
    address: data.rewardCurrency,
  });

  const rewardCurrencyName = Object.entries(ACCEPTABLE_CURRENCIES).find(([key, value]) => value === data.rewardCurrency)?.[0];
  const totalRewardNum = data.numberOfRewarders * data.amountPerRewarder;
  const platformFeeNum = data.numberOfRewarders * data.amountPerRewarder * Number(platformRate) / 10000;

  const handleApprove = async () => {
    try {
      setLoading(true);
      if (!activeAccount) {
        throw new Error('no active account')
      }

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
      console.log(approveTxReceipt)

      toast({ title: "Approved successfully" })
      setApproved(true);
    } catch (error) {
      console.log({ error })
      toast({ title: 'Something went wrong' })
    } finally {
      setLoading(false)
    }
  };

  const handleCreation = async () => {
    try {
      setLoading(true);
      if (!activeAccount) {
        throw new Error('no active account')
      }

      // get the decimals of the reward token 
      const rewardTokenDecimals = await decimals({
        contract: rewardTokenInstance
      })

      // transform to Bigint and calculate total reward, platform fee and total token amount to be approved by bounty creator
      const numberOfRewardersBigInt = BigInt(data.numberOfRewarders);
      const amountPerRewarderInDecimals = parseUnits(data.amountPerRewarder.toString(), rewardTokenDecimals).toBigInt();

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

      toast({ title: "Created bounty successfully" })
      if (createdBounty) {
        router.push(`/bounty/${createdBounty.id}`)
      } else {
        throw new Error('Fail to create bounty')
      }
    } catch (error) {
      console.log({ error })
      toast({ title: 'Something went wrong' })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" disabled={disabled}>Open Bounty</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Open Bounty</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <h3>
            {`Your bounty reward will be held temporarily and claimed by the chosen winner upon quest completion. `}
          </h3>
          <h3>
            {`For incomplete quest, you can claim your reward after quest expires or ends and no platform fee will be charged.`}
          </h3>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="name" className="col-span-1">
                Reward Amount
              </Label>
              <Label htmlFor="name" className="text-right col-span-1">
                {`${totalRewardNum.toFixed(2)} ${rewardCurrencyName}`}
              </Label>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="name" className="col-span-1">
                Platform Fee (1%)
              </Label>
              <Label htmlFor="name" className="text-right col-span-1">
                {`${platformFeeNum.toFixed(2)} ${rewardCurrencyName}`}
              </Label>
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="name" className="font-bold col-span-1">
                Total Amount
              </Label>
              <Label htmlFor="name" className="font-bold text-right col-span-1">
                {`${(totalRewardNum + platformFeeNum).toFixed(2)} ${rewardCurrencyName}`}
              </Label>
            </div>
          </div>
          <div className="flex flex-col items-between gap-2">
            <Button disabled={approved} onClick={handleApprove}>
              {(!approved && loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve USDC
            </Button>
            <Button disabled={!approved} onClick={handleCreation}>
              {(approved && loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deposit USDC
            </Button>
          </div>
        </DialogDescription>

      </DialogContent>
    </Dialog>
  )
}
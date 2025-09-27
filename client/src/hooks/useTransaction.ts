import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";

export const useTransaction = () => {
  const { address } = useAccount();
  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Example function to send a simple ETH transaction
  const sendTestTransaction = async (toAddress: string, amount: string) => {
    if (!address) {
      throw new Error("Wallet not connected");
    }

    try {
      // This is a simple ETH transfer example
      // In a real game, you'd interact with your smart contracts
      const tx = {
        to: toAddress as `0x${string}`,
        value: parseEther(amount),
      };

      // For contract interactions, you would use:
      // writeContract({
      //   address: 'YOUR_CONTRACT_ADDRESS',
      //   abi: yourContractABI,
      //   functionName: 'yourFunction',
      //   args: [arg1, arg2],
      // })

      console.log("Sending transaction:", tx);
      return tx;
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  };

  return {
    sendTestTransaction,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    address,
  };
};

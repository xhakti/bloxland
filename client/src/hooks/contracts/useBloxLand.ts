import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { type Address, parseUnits, decodeEventLog } from "viem";
import { usePublicClient } from "wagmi";
import {
  BloxLand_CONTRACT_ABI,
  BloxLand_CONTRACT_ADDRESS,
} from "../../constants/contracts/BloxLand";
import { apiClient } from "../../lib/api";

type ContractAddress = `0x${string}`;

export const useBloxLand = (
  address: ContractAddress = BloxLand_CONTRACT_ADDRESS as ContractAddress
) => {
  const { address: walletAddress } = useAccount();
  const publicClient = usePublicClient();
  const {
    data: hash,
    writeContract,
    writeContractAsync,
    isPending,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });

  // Constants reads
  const useGAME_RANDOM_DICE = () =>
    useReadContract({
      address,
      abi: BloxLand_CONTRACT_ABI as any,
      functionName: "GAME_RANDOM_DICE",
    });
  const useGAME_RANDOM_EVEN = () =>
    useReadContract({
      address,
      abi: BloxLand_CONTRACT_ABI as any,
      functionName: "GAME_RANDOM_EVEN",
    });
  const useGAME_RANDOM_OVER = () =>
    useReadContract({
      address,
      abi: BloxLand_CONTRACT_ABI as any,
      functionName: "GAME_RANDOM_OVER",
    });
  const useGAME_BTC_GT = () =>
    useReadContract({
      address,
      abi: BloxLand_CONTRACT_ABI as any,
      functionName: "GAME_BTC_GT",
    });

  // Storage reads
  const useGames = (gameId: bigint) =>
    useReadContract({
      address,
      abi: BloxLand_CONTRACT_ABI as any,
      functionName: "games",
      args: [gameId],
    });
  const usePlays = (playId: bigint) =>
    useReadContract({
      address,
      abi: BloxLand_CONTRACT_ABI as any,
      functionName: "plays",
      args: [playId],
    });

  // Writes: play, answer, answerWithSignature
  const play = async ({
    gameId,
    energyAmount,
  }: {
    gameId: bigint;
    energyAmount: bigint;
  }): Promise<bigint> => {
    if (!walletAddress) throw new Error("Wallet not connected");
    console.log("[Bloxland.play] args", {
      gameId: gameId.toString(),
      energyAmount: energyAmount.toString(),
    });

    // Submit the transaction and get the hash
    const txHash = await writeContractAsync({
      address,
      abi: BloxLand_CONTRACT_ABI as any,
      functionName: "play",
      args: [gameId, energyAmount],
    });

    console.log("[Bloxland.play] Transaction hash:", txHash);

    // Wait for the transaction to be mined and get the receipt
    if (!publicClient) {
      throw new Error("Public client not available");
    }
    
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    if (!receipt) {
      throw new Error("Transaction failed to be mined");
    }

    // Parse the PlayStarted event to extract the playId
    let playId: bigint | null = null;
    for (const log of receipt.logs) {
      try {
        const decodedLog = decodeEventLog({
          abi: BloxLand_CONTRACT_ABI as any,
          data: log.data,
          topics: log.topics,
        }) as any;
        
        if (decodedLog.eventName === "PlayStarted") {
          playId = decodedLog.args.playId as bigint;
          break;
        }
      } catch (error) {
        // Skip logs that can't be decoded (might be from other contracts)
        continue;
      }
    }

    if (playId === null) {
      throw new Error("PlayStarted event not found in transaction logs");
    }

    console.log("[Bloxland.play] Extracted playId:", playId.toString());
    return playId;
  };

  const answer = async ({
    playId,
    answer,
  }: {
    playId: bigint;
    answer: bigint;
  }) => {
    console.log("[Bloxland.answer] args", {
      playId: playId.toString(),
      answer: answer.toString(),
    });
    return writeContract({
      address,
      abi: BloxLand_CONTRACT_ABI as any,
      functionName: "answer",
      args: [playId, answer],
    });
  };

  const answerWithSignature = async ({
    playId,
    answerValue,
    result,
    signature,
  }: {
    playId: bigint;
    answerValue: bigint;
    result: -1 | 1;
    signature: `0x${string}`;
  }) => {
    console.log("[Bloxland.answerWithSignature] args", {
      playId: playId.toString(),
      answerValue: answerValue.toString(),
      result,
      signature,
    });
    return writeContract({
      address,
      abi: BloxLand_CONTRACT_ABI as any,
      functionName: "answerWithSignature",
      args: [playId, answerValue, result, signature],
    });
  };

  // Composed flow per requirements
  // 1) energize via backend signature (handled by Energy hook) and then 2) play with fixed 50 tokens, 3) sign play-answer via backend and call answerWithSignature
  const energizePlayAndAnswer = async ({
    gameId,
    energyTokenDecimals,
    answerValue,
  }: {
    gameId: bigint;
    energyTokenDecimals: number;
    answerValue: bigint; // int64
  }) => {
    if (!walletAddress) throw new Error("Wallet not connected");

    // fixed 50 ENERGY
    const amountWei = parseUnits("50", energyTokenDecimals);
    console.log("[Flow] Start energize->play->answer", {
      walletAddress,
      gameId: gameId.toString(),
      amountWei: amountWei.toString(),
      answerValue: answerValue.toString(),
    });

    // energize signature & mint (EnergyToken)
    const sig = await apiClient.getEnergizeSignature({
      player: walletAddress,
      amount: amountWei.toString(),
    });
    console.log("[Flow] energize signature received");

    // Note: actual call to `energizeWithSignature` should be done via Energy hook; we keep flow cohesive here by returning needed data
    // Execute play (consumes ENERGY inside contract via BLOXLAND_ROLE)
    const playTx = await writeContract({
      address,
      abi: BloxLand_CONTRACT_ABI as any,
      functionName: "play",
      args: [gameId, amountWei],
    });
    console.log("[Flow] play tx submitted", playTx);

    // Wait for receipt to get logs is handled by outer consumer if needed
    // Assume playId is returned synchronously via wagmi .data when chain supports; for simplicity, require caller to query `usePlays` after tx confirms.
    return { signatureForEnergize: sig.data.signature };
  };

  const signAndAnswerWithBackend = async ({
    playId,
    answerValue,
    result,
  }: {
    playId: bigint;
    answerValue: bigint;
    result: -1 | 1;
  }) => {
    if (!walletAddress) throw new Error("Wallet not connected");
    const sig = await apiClient.getPlayAnswerSignature({
      playId: playId.toString(),
      player: walletAddress,
      answer: answerValue.toString(),
    });
    console.log("[Flow] play-answer signature received");
    return answerWithSignature({
      playId,
      answerValue,
      result,
      signature: sig.data.signature as `0x${string}`,
    });
  };

  return {
    address,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    // reads
    useGAME_RANDOM_DICE,
    useGAME_RANDOM_EVEN,
    useGAME_RANDOM_OVER,
    useGAME_BTC_GT,
    useGames,
    usePlays,
    // writes
    play,
    answer,
    answerWithSignature,
    // composed helpers
    energizePlayAndAnswer,
    signAndAnswerWithBackend,
  };
};

export default useBloxLand;

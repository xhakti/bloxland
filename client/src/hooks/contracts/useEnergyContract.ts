import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { type Address, parseUnits } from "viem";
import { ENERGY_TOKEN_CONTRACT_ABI, ENERGY_TOKEN_CONTRACT_ADDRESS } from "../../constants/contracts/EnergyToken";
import { apiClient } from "../../lib/api";

type ContractAddress = `0x${string}`;

export const useEnergyContract = (address: ContractAddress = ENERGY_TOKEN_CONTRACT_ADDRESS as ContractAddress) => {
  const { address: walletAddress } = useAccount();
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // Reads
  const useBalanceOf = (account?: Address) =>
    useReadContract({
      address,
      abi: ENERGY_TOKEN_CONTRACT_ABI as any,
      functionName: "balanceOf",
      args: [account ?? (walletAddress as Address)],
      query: { enabled: !!(account ?? walletAddress) },
    });

  const useName = () =>
    useReadContract({ address, abi: ENERGY_TOKEN_CONTRACT_ABI as any, functionName: "name" });
  const useSymbol = () =>
    useReadContract({ address, abi: ENERGY_TOKEN_CONTRACT_ABI as any, functionName: "symbol" });
  const useDecimals = () =>
    useReadContract({ address, abi: ENERGY_TOKEN_CONTRACT_ABI as any, functionName: "decimals" });
  const useTotalSupply = () =>
    useReadContract({ address, abi: ENERGY_TOKEN_CONTRACT_ABI as any, functionName: "totalSupply" });
  const useAllowance = (owner: Address, spender: Address) =>
    useReadContract({ address, abi: ENERGY_TOKEN_CONTRACT_ABI as any, functionName: "allowance", args: [owner, spender] });
  const useHasRole = (role: `0x${string}`, account: Address) =>
    useReadContract({ address, abi: ENERGY_TOKEN_CONTRACT_ABI as any, functionName: "hasRole", args: [role, account] });
  const useGetRoleAdmin = (role: `0x${string}`) =>
    useReadContract({ address, abi: ENERGY_TOKEN_CONTRACT_ABI as any, functionName: "getRoleAdmin", args: [role] });
  const useSupportsInterface = (interfaceId: `0x${string}`) =>
    useReadContract({ address, abi: ENERGY_TOKEN_CONTRACT_ABI as any, functionName: "supportsInterface", args: [interfaceId] });
  const useEip712Domain = () =>
    useReadContract({ address, abi: ENERGY_TOKEN_CONTRACT_ABI as any, functionName: "eip712Domain" });

  // Writes (raw)
  const approve = async (spender: Address, value: bigint) => {
    console.log("[Energy.approve] args", { spender, value: value.toString() });
    return writeContract({ address, abi: ENERGY_TOKEN_CONTRACT_ABI as any, functionName: "approve", args: [spender, value] });
  };

  const transfer = async (to: Address, value: bigint) => {
    console.log("[Energy.transfer] args", { to, value: value.toString() });
    return writeContract({ address, abi: ENERGY_TOKEN_CONTRACT_ABI as any, functionName: "transfer", args: [to, value] });
  };

  const transferFrom = async (from: Address, to: Address, value: bigint) => {
    console.log("[Energy.transferFrom] args", { from, to, value: value.toString() });
    return writeContract({ address, abi: ENERGY_TOKEN_CONTRACT_ABI as any, functionName: "transferFrom", args: [from, to, value] });
  };

  const grantRole = async (role: `0x${string}`, accountAddr: Address) => {
    console.log("[Energy.grantRole] args", { role, account: accountAddr });
    return writeContract({ address, abi: ENERGY_TOKEN_CONTRACT_ABI as any, functionName: "grantRole", args: [role, accountAddr] });
  };

  const renounceRole = async (role: `0x${string}`, callerConfirmation: Address) => {
    console.log("[Energy.renounceRole] args", { role, callerConfirmation });
    return writeContract({ address, abi: ENERGY_TOKEN_CONTRACT_ABI as any, functionName: "renounceRole", args: [role, callerConfirmation] });
  };

  const revokeRole = async (role: `0x${string}`, accountAddr: Address) => {
    console.log("[Energy.revokeRole] args", { role, account: accountAddr });
    return writeContract({ address, abi: ENERGY_TOKEN_CONTRACT_ABI as any, functionName: "revokeRole", args: [role, accountAddr] });
  };

  const consume = async (player: Address, amount: bigint) => {
    console.log("[Energy.consume] args", { player, amount: amount.toString() });
    return writeContract({ address, abi: ENERGY_TOKEN_CONTRACT_ABI as any, functionName: "consume", args: [player, amount] });
  };

  // Flow: request backend signature -> call energizeWithSignature
  const energize = async ({ amount, decimalsHint = 18 }: { amount: string; decimalsHint?: number }) => {
    if (!walletAddress) throw new Error("Wallet not connected");
    console.log("[Energy.energize] start", { walletAddress, amount, decimalsHint });

    const wei = parseUnits(amount, decimalsHint);
    const sigResp = await apiClient.getEnergizeSignature({ player: walletAddress, amount: wei.toString() });
    console.log("[Energy.energize] signature received", sigResp.data);

    return writeContract({
      address,
      abi: ENERGY_TOKEN_CONTRACT_ABI as any,
      functionName: "energizeWithSignature",
      args: [wei, sigResp.data.signature as `0x${string}`],
    });
  };

  return {
    address,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    // reads
    useBalanceOf,
    useName,
    useSymbol,
    useDecimals,
    useTotalSupply,
    useAllowance,
    useHasRole,
    useGetRoleAdmin,
    useSupportsInterface,
    useEip712Domain,
    // writes
    approve,
    transfer,
    transferFrom,
    grantRole,
    renounceRole,
    revokeRole,
    consume,
    energize,
  };
};

export default useEnergyContract;

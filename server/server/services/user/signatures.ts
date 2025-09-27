import { Address, Hex, createWalletClient, http, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

type ServiceResult<T> = { data: T; message: string; error: any };

const PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY as string;
const ENERGY_TOKEN_CONTRACT_ADDRESS = process.env
  .ENERGY_TOKEN_CONTRACT_ADDRESS as Address | undefined;
const BLOXLAND_CONTRACT_ADDRESS = process.env.BLOXLAND_CONTRACT_ADDRESS as
  | Address
  | undefined;

if (!PRIVATE_KEY) {
  // eslint-disable-next-line no-console
  console.warn("[SignatureService] SIGNER_PRIVATE_KEY is not set in env");
}

const account = PRIVATE_KEY
  ? privateKeyToAccount(PRIVATE_KEY as Hex)
  : undefined;

const walletClient = account
  ? createWalletClient({ account, chain: baseSepolia, transport: http() })
  : undefined;

export async function getEnergizeSignature({
  player,
  amount,
}: {
  player: Address;
  amount: string; // bigint string
}): Promise<
  ServiceResult<{ signature: string }>
> {
  try {
    if (!walletClient || !account) {
      return {
        data: null,
        message: "Server misconfiguration",
        error: "Missing signing account",
      } as any;
    }

    const domain = {
      name: "BloxlandEnergize",
      version: "1",
      chainId: walletClient.chain?.id,
      verifyingContract:
        ENERGY_TOKEN_CONTRACT_ADDRESS ??
        "0x0000000000000000000000000000000000000000",
    } as const;

    const types = {
      BloxlandEnergize: [
        { name: "player", type: "address" },
        { name: "amount", type: "uint256" },
      ],
    } as const;

    const value = {
      player,
      amount: BigInt(amount),
    } as const;

    const signature = await walletClient.signTypedData({
      domain,
      types,
      primaryType: "BloxlandEnergize",
      message: value,
      account,
    });

    console.log("Energize signature generated", { signature, domain, types, value });

    return {
    //   data: { signature, domain, types, value },
    data: { signature },
      message: "Energize signature generated",
      error: null,
    };
  } catch (error) {
    return { data: null as any, message: "Failed to sign energize", error };
  }
}

export async function getPlayAnswerSignature({
  playId,
  player,
  answer,
}: {
  playId: string; // bigint string
  player: Address;
  answer: string; // int64 string
}): Promise<
  ServiceResult<{ signature: Hex; domain: any; types: any; value: any }>
> {
  try {
    if (!walletClient || !account) {
      return {
        data: null,
        message: "Server misconfiguration",
        error: "Missing signing account",
      } as any;
    }

    const domain = {
      name: "BloxlandPlay",
      version: "1",
      chainId: walletClient.chain?.id,
      verifyingContract:
        BLOXLAND_CONTRACT_ADDRESS ??
        "0x0000000000000000000000000000000000000000",
    } as const;

    const types = {
      BloxlandPlay: [
        { name: "playId", type: "uint256" },
        { name: "player", type: "address" },
        { name: "answer", type: "int64" },
      ],
    } as const;

    const value = {
      playId: BigInt(playId),
      player,
      answer: BigInt(answer),
    } as const;

    const signature = await walletClient.signTypedData({
      domain,
      types,
      primaryType: "BloxlandPlay",
      message: { playId: value.playId, player: value.player, answer: value.answer },
      account,
    });

    return {
      data: { signature, domain, types, value },
      message: "Play signature generated",
      error: null,
    };
  } catch (error) {
    return { data: null as any, message: "Failed to sign play", error };
  }
}

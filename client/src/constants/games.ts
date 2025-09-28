export type MiniGameKey = "DICE" | "EVEN_ODD" | "OVER_UNDER" | "BTC_GT";

export interface MiniGameMeta {
  key: MiniGameKey;
  title: string;
  description: string;
  // ENERGY token amount consumed by Bloxland.play
  energyPrice: bigint;
}

export const MINI_GAMES: Record<MiniGameKey, MiniGameMeta> = {
  DICE: {
    key: "DICE",
    title: "Dice Guess",
    description: "Pick a number 1–6. Win if the random dice matches your pick.",
    energyPrice: 10n,
  },
  EVEN_ODD: {
    key: "EVEN_ODD",
    title: "Even or Odd",
    description:
      "Guess if a random number (1–100) is even or odd. Even = 1, Odd = 2.",
    energyPrice: 10n,
  },
  OVER_UNDER: {
    key: "OVER_UNDER",
    title: "Over or Under (50)",
    description:
      "Guess if a random number (1–100) is over (>50) or under (≤50). More = 1, Less = 2.",
    energyPrice: 10n,
  },
  BTC_GT: {
    key: "BTC_GT",
    title: "BTC Price > Your Number",
    description:
      "Enter a price and win if current BTC price (from oracle) is greater.",
    energyPrice: 10n,
  },
};



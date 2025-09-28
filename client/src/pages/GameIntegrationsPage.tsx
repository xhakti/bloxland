import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import useEnergyContract from "../hooks/contracts/useEnergyContract";
import useBloxLand from "../hooks/contracts/useBloxLand";
import { MINI_GAMES } from "../constants/games";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="p-4 border border-white/10 rounded-xl bg-black/40 backdrop-blur">
    <h2 className="text-white font-semibold mb-3">{title}</h2>
    {children}
  </div>
);

const Field = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <label className="flex flex-col gap-1 text-sm text-gray-300">
    <span>{label}</span>
    <input
      className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </label>
);

const Button = ({
  onClick,
  children,
  disabled,
}: {
  onClick?: () => void | Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 border border-white/20 text-white"
  >
    {children}
  </button>
);

export default function GameIntegrationsPage() {
  const { address } = useAccount();
  const energy = useEnergyContract();
  const blox = useBloxLand();

  // Inputs
  const [amount, setAmount] = useState("50");
  const [answerBtc, setAnswerBtc] = useState("6000000000000");
  // Per-game selections
  const [dicePick, setDicePick] = useState<number | null>(null);
  const [evenOddPick, setEvenOddPick] = useState<1 | 2 | null>(null); // 1=even, 2=odd
  const [overUnderPick, setOverUnderPick] = useState<1 | 2 | null>(null); // 1=more, 2=less
  const [overUnderDisplayInput, setOverUnderDisplayInput] = useState("50"); // UI-only 1..100
  // Per-game playIds
  const [dicePlayId, setDicePlayId] = useState<bigint | null>(null);
  const [evenOddPlayId, setEvenOddPlayId] = useState<bigint | null>(null);
  const [overUnderPlayId, setOverUnderPlayId] = useState<bigint | null>(null);
  const [btcPlayId, setBtcPlayId] = useState<bigint | null>(null);
  const decimals = useMemo(() => 18, []);

  // Energy balance hook - call at component level
  const energyBalance = energy.useBalanceOf(address);

  // Helpers
  const onEnergize = async () => {
    if (!address) {
      console.warn("Wallet not connected");
      alert("Please connect your wallet first");
      return;
    }
    try {
      console.log("[Integrations] Energize start", { address, amount });
      const tx = await energy.energize({ amount, decimalsHint: decimals });
      console.log("[Integrations] Energize submitted", { hash: energy.hash, tx });
      alert(`Energize transaction submitted! You will receive ${amount} ENERGY tokens. Transaction hash: ${tx}`);
    } catch (e) {
      const errorMessage = `Energize failed: ${e instanceof Error ? e.message : 'Unknown error'}`;
      console.error("[Integrations] Energize error", e);
      alert(errorMessage);
    }
  };

  const onPlay = async (gameId: bigint, setPid: (pid: bigint) => void, energyPrice: bigint) => {
    try {
      console.log("[Integrations] Play start", {
        gameId: gameId.toString(),
        energyPrice: energyPrice.toString(),
      });

      // Check if balance data is available
      if (!energyBalance.data) {
        console.log("[Integrations] Energy balance not available yet");
        alert("Energy balance is loading, please wait...");
        return;
      }

      const userEnergy = energyBalance.data as unknown as bigint;
      console.log("[Integrations] User energy balance:", userEnergy.toString());

      const energyAmount = energyPrice; // use per-game price
      
      if (userEnergy < energyAmount) {
        const insufficientMessage = `Insufficient energy balance! You have ${userEnergy.toString()} ENERGY but need ${energyAmount.toString()} ENERGY to play. Please energize first.`;
        console.log("[Integrations] User energy insufficient:", insufficientMessage);
        alert(insufficientMessage);
        return;
      }

      console.log("[Integrations] Energy balance sufficient, proceeding with play...");
      const playId = await blox.play({ gameId, energyAmount });
      console.log("[Integrations] Play started with playId", playId.toString());
      setPid(playId);
      
      // Show success message
      alert(`Play started! playId: ${playId.toString()}`);
    } catch (e) {
      const errorMessage = `Play failed: ${e instanceof Error ? e.message : 'Unknown error'}`;
      console.error("[Integrations] Play error", e);
      alert(errorMessage);
    }
  };

  const submitDiceAnswer = async () => {
    if (!dicePlayId) {
      alert("Please play Dice first to get a playId.");
      return;
    }
    if (!dicePick) {
      alert("Please pick a number (1–6).");
      return;
    }
    try {
      console.log("[Integrations] Dice Answer", { playId: dicePlayId.toString(), answer: dicePick });
      await blox.answer({ playId: dicePlayId, answer: BigInt(dicePick) });
      alert("Dice answer submitted!");
    } catch (e) {
      console.error("[Integrations] Dice Answer error", e);
    }
  };

  const submitEvenOddAnswer = async () => {
    if (!evenOddPlayId) {
      alert("Please play Even/Odd first to get a playId.");
      return;
    }
    if (!evenOddPick) {
      alert("Please pick Even or Odd.");
      return;
    }
    try {
      console.log("[Integrations] Even/Odd Answer", { playId: evenOddPlayId.toString(), answer: evenOddPick });
      await blox.answer({ playId: evenOddPlayId, answer: BigInt(evenOddPick) });
      alert("Even/Odd answer submitted!");
    } catch (e) {
      console.error("[Integrations] Even/Odd Answer error", e);
    }
  };

  const submitOverUnderAnswer = async () => {
    if (!overUnderPlayId) {
      alert("Please play Over/Under first to get a playId.");
      return;
    }
    if (!overUnderPick) {
      alert("Please pick More or Less.");
      return;
    }
    try {
      console.log("[Integrations] Over/Under Answer", { playId: overUnderPlayId.toString(), answer: overUnderPick });
      await blox.answer({ playId: overUnderPlayId, answer: BigInt(overUnderPick) });
      alert("Over/Under answer submitted!");
    } catch (e) {
      console.error("[Integrations] Over/Under Answer error", e);
    }
  };

  const submitBtcAnswer = async () => {
    if (!btcPlayId) {
      alert("Please play BTC > first to get a playId.");
      return;
    }
    const trimmed = (answerBtc || "").trim();
    if (!trimmed || Number.isNaN(Number(trimmed))) {
      alert("Please enter a valid BTC price number.");
      return;
    }
    try {
      const ans = BigInt(trimmed);
      console.log("[Integrations] BTC Answer", { playId: btcPlayId.toString(), answer: ans.toString() });
      await blox.answer({ playId: btcPlayId, answer: ans });
      alert("BTC answer submitted!");
    } catch (e) {
      console.error("[Integrations] BTC Answer error", e);
    }
  };

  // Game IDs (read live)
  const diceId = blox.useGAME_RANDOM_DICE().data as unknown as
    | bigint
    | undefined;
  const evenId = blox.useGAME_RANDOM_EVEN().data as unknown as
    | bigint
    | undefined;
  const overId = blox.useGAME_RANDOM_OVER().data as unknown as
    | bigint
    | undefined;
  const btcId = blox.useGAME_BTC_GT().data as unknown as bigint | undefined;

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Game Integrations</h1>
        <div className="flex flex-col gap-2">
          <p className="text-gray-300">Wallet: {address ?? "Not connected"}</p>
          <p className="text-gray-300">
            Energy Balance: {
              energyBalance.isLoading 
                ? "Loading..." 
                : energyBalance.data 
                  ? `${(energyBalance.data as unknown as bigint).toString()} ENERGY`
                  : "Not available"
            }
          </p>
        </div>

        <Section title="1) Energize (EIP-712 -> EnergyToken.energizeWithSignature)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <Field
              label="ENERGY amount"
              value={amount}
              onChange={setAmount}
              placeholder="50"
            />
            <div>
              <Button onClick={onEnergize} disabled={!address}>
                Energize
              </Button>
            </div>
            <div className="text-xs text-gray-400">
              Mints ENERGY to you using backend signature
            </div>
          </div>
        </Section>

        <Section title={`Dice (${String(diceId ?? "-")})`}>
          <div className="space-y-3">
            <p className="text-sm text-gray-400">{MINI_GAMES.DICE.description}</p>
            <div className="text-xs text-gray-400">Price: {MINI_GAMES.DICE.energyPrice.toString()} ENERGY</div>
            <div className="grid grid-cols-6 gap-2">
              {[1,2,3,4,5,6].map((n) => (
                <button
                  key={n}
                  onClick={() => setDicePick(n)}
                  className={`px-3 py-3 rounded-lg border text-center ${dicePick === n ? "bg-white/20 border-white" : "bg-white/10 border-white/20 hover:bg-white/20"}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => diceId ? onPlay(diceId, (pid) => setDicePlayId(pid), MINI_GAMES.DICE.energyPrice) : undefined}>
                Play
              </Button>
              <Button onClick={submitDiceAnswer} disabled={!dicePick || !dicePlayId}>
                Submit Answer
              </Button>
              <div className="text-xs text-gray-400">playId: {dicePlayId ? dicePlayId.toString() : "-"}</div>
            </div>
          </div>
        </Section>

        <Section title={`Even or Odd (${String(evenId ?? "-")})`}>
          <div className="space-y-3">
            <p className="text-sm text-gray-400">{MINI_GAMES.EVEN_ODD.description}</p>
            <div className="text-xs text-gray-400">Price: {MINI_GAMES.EVEN_ODD.energyPrice.toString()} ENERGY</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setEvenOddPick(1)}
                className={`px-3 py-3 rounded-lg border text-center ${evenOddPick === 1 ? "bg-white/20 border-white" : "bg-white/10 border-white/20 hover:bg-white/20"}`}
              >
                Even (1)
              </button>
              <button
                onClick={() => setEvenOddPick(2)}
                className={`px-3 py-3 rounded-lg border text-center ${evenOddPick === 2 ? "bg-white/20 border-white" : "bg-white/10 border-white/20 hover:bg-white/20"}`}
              >
                Odd (2)
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => evenId ? onPlay(evenId, (pid) => setEvenOddPlayId(pid), MINI_GAMES.EVEN_ODD.energyPrice) : undefined}>
                Play
              </Button>
              <Button onClick={submitEvenOddAnswer} disabled={!evenOddPick || !evenOddPlayId}>
                Submit Answer
              </Button>
              <div className="text-xs text-gray-400">playId: {evenOddPlayId ? evenOddPlayId.toString() : "-"}</div>
            </div>
          </div>
        </Section>

        <Section title={`Over or Under 50 (${String(overId ?? "-")})`}>
          <div className="space-y-3">
            <p className="text-sm text-gray-400">{MINI_GAMES.OVER_UNDER.description}</p>
            <div className="text-xs text-gray-400">Price: {MINI_GAMES.OVER_UNDER.energyPrice.toString()} ENERGY</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setOverUnderPick(1)}
                className={`px-3 py-3 rounded-lg border text-center ${overUnderPick === 1 ? "bg-white/20 border-white" : "bg-white/10 border-white/20 hover:bg-white/20"}`}
              >
                More (1)
              </button>
              <button
                onClick={() => setOverUnderPick(2)}
                className={`px-3 py-3 rounded-lg border text-center ${overUnderPick === 2 ? "bg-white/20 border-white" : "bg-white/10 border-white/20 hover:bg-white/20"}`}
              >
                Less (2)
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <Field
                label="Optional number (1–100)"
                value={overUnderDisplayInput}
                onChange={(v) => {
                  // accept only 1..100
                  const num = Number(v);
                  if (!Number.isNaN(num) && num >= 1 && num <= 100) setOverUnderDisplayInput(v);
                  if (v === "") setOverUnderDisplayInput("");
                }}
                placeholder="50"
              />
              <div className="text-xs text-gray-400 md:col-span-2">
                Note: Contract compares against 50; this input is for display only.
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => overId ? onPlay(overId, (pid) => setOverUnderPlayId(pid), MINI_GAMES.OVER_UNDER.energyPrice) : undefined}>
                Play
              </Button>
              <Button onClick={submitOverUnderAnswer} disabled={!overUnderPick || !overUnderPlayId}>
                Submit Answer
              </Button>
              <div className="text-xs text-gray-400">playId: {overUnderPlayId ? overUnderPlayId.toString() : "-"}</div>
            </div>
          </div>
        </Section>

        <Section title={`BTC Price Greater Than (${String(btcId ?? "-")})`}>
          <div className="space-y-3">
            <p className="text-sm text-gray-400">{MINI_GAMES.BTC_GT.description}</p>
            <div className="text-xs text-gray-400">Price: {MINI_GAMES.BTC_GT.energyPrice.toString()} ENERGY</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <Field
                label="Your BTC price"
                value={answerBtc}
                onChange={setAnswerBtc}
                placeholder="Enter integer price"
              />
              <div />
              <div />
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => btcId ? onPlay(btcId, (pid) => setBtcPlayId(pid), MINI_GAMES.BTC_GT.energyPrice) : undefined}>
                Play
              </Button>
              <Button onClick={submitBtcAnswer} disabled={!answerBtc || !btcPlayId}>
                Submit Answer
              </Button>
              <div className="text-xs text-gray-400">playId: {btcPlayId ? btcPlayId.toString() : "-"}</div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import useEnergyContract from "../hooks/contracts/useEnergyContract";
import useBloxLand from "../hooks/contracts/useBloxLand";

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
  const [answerDice, setAnswerDice] = useState("3");
  const [answerEven, setAnswerEven] = useState("1");
  const [answerOver, setAnswerOver] = useState("1");
  const [answerBtc, setAnswerBtc] = useState("6000000000000");
  const [playId, setPlayId] = useState("");
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

  const onPlay = async (gameId: bigint) => {
    try {
      console.log("[Integrations] Play start", {
        gameId: gameId.toString(),
        amount,
      });

      // Check if balance data is available
      if (!energyBalance.data) {
        console.log("[Integrations] Energy balance not available yet");
        alert("Energy balance is loading, please wait...");
        return;
      }

      const userEnergy = energyBalance.data as unknown as bigint;
      console.log("[Integrations] User energy balance:", userEnergy.toString());

      const energyAmount = BigInt(10); // per spec, deduct 50 overall; demo uses 10 per click
      
      if (userEnergy < energyAmount) {
        const insufficientMessage = `Insufficient energy balance! You have ${userEnergy.toString()} ENERGY but need ${energyAmount.toString()} ENERGY to play. Please energize first.`;
        console.log("[Integrations] User energy insufficient:", insufficientMessage);
        alert(insufficientMessage);
        return;
      }

      console.log("[Integrations] Energy balance sufficient, proceeding with play...");
      const tx = await blox.play({ gameId, energyAmount });
      console.log("[Integrations] Play tx submitted", tx);
      
      // Show success message
      alert(`Play transaction submitted successfully! Transaction hash: ${tx}`);
      
      // Note: retrieving playId from logs is chain/tooling dependent; user can enter it below
    } catch (e) {
      const errorMessage = `Play failed: ${e instanceof Error ? e.message : 'Unknown error'}`;
      console.error("[Integrations] Play error", e);
      alert(errorMessage);
    }
  };

  const onAnswer = async () => {
    try {
      console.log("this is answer")

      const pid = BigInt(playId);
      const ans = BigInt(answerDice || "1");
      console.log("[Integrations] Answer start", {
        playId: pid.toString(),
        ans: ans.toString(),
      });
      await blox.answer({ playId: pid, answer: ans });
      console.log("[Integrations] Answer submitted");
    } catch (e) {
      console.error("[Integrations] Answer error", e);
    }
  };

  const onSignAndAnswer = async (result: -1 | 1) => {
    try {
      const pid = BigInt(playId);
      const ans = BigInt(answerDice || "1");
      console.log("[Integrations] Sign+Answer start", {
        playId: pid.toString(),
        ans: ans.toString(),
        result,
      });
      
      const tx = await blox.signAndAnswerWithBackend({
        playId: pid,
        answerValue: ans,
        result,
      });
      console.log("[Integrations] Sign+Answer submitted", tx);
    } catch (e) {
      console.error("[Integrations] Sign+Answer error", e);
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

        <Section title="2) Play">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button onClick={() => (diceId ? onPlay(diceId) : undefined)}>
              Play Dice ({String(diceId ?? "")})
            </Button>
            <Button onClick={() => (evenId ? onPlay(evenId) : undefined)}>
              Play Even ({String(evenId ?? "")})
            </Button>
            <Button onClick={() => (overId ? onPlay(overId) : undefined)}>
              Play Over ({String(overId ?? "")})
            </Button>
            <Button onClick={() => (btcId ? onPlay(btcId) : undefined)}>
              Play BTC &gt; ({String(btcId ?? "")})
            </Button>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Play emits PlayStarted(playId). Enter your playId below to answer.
          </p>
        </Section>

        <Section title="3) Answer (random games: store answer; BTC game: evaluates immediately)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <Field
              label="playId"
              value={playId}
              onChange={setPlayId}
              placeholder="Enter returned playId"
            />
            <Field
              label="answer (int64)"
              value={answerDice}
              onChange={setAnswerDice}
              placeholder="Dice guess (1..6) / 1 for Even/Over / BTC price"
            />
            <Button onClick={onAnswer}>Answer</Button>
          </div>
        </Section>

        <Section title="4) Off-chain signature route (answerWithSignature)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <Field label="playId" value={playId} onChange={setPlayId} />
            <Field
              label="answer (int64)"
              value={answerDice}
              onChange={setAnswerDice}
            />
            <div className="flex gap-2">
              <Button onClick={() => onSignAndAnswer(1)}>
                Sign & Answer (win)
              </Button>
              <Button onClick={() => onSignAndAnswer(-1)}>
                Sign & Answer (lose)
              </Button>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Backend signs EIP-712 over BloxlandPlay; contract validates via
            answerWithSignature.
          </p>
        </Section>
      </div>
    </div>
  );
}

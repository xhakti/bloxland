We built the project with a full-stack Web3 architecture, keeping the frontend, backend, and blockchain code in a monorepo for smooth development and collaboration. The repo is structured into:
 - Client (frontend)
 - Server (backend)
 - Blockchain (smart contracts)

Frontend
- Built with React + Vite for a fast, modular, and developer-friendly setup.
- Styled with TailwindCSS for rapid and consistent UI design.
- ReOwn and wagmi for blockchain wallet connections and contract interactions.
- TanStack Query + Axios for efficient API communication with our backend.
- Mapbox for real-time geolocation and world map rendering.
- Ready Player Me for customizable player avatars.

Backend
- Node.js + Express powers our API layer.
- Drizzle ORM manages database operations cleanly and in a type-safe way.
- Supabase as our managed Postgres database for storing users, events, and checkpoint activity.
- Handles verification of user submissions (social proofs, tx hashes, etc.), event management, and partner dashboard logic.

Blockchain (smart contracts)
- Solidity + Hardhat for writing, and deploying smart contracts.
- Contracts handle:
    - Mini-game logic (price feed + randomness).
    - Reward token issuance and distribution.
    - Event registration and winner payouts.

Partner technologies used
1. Pyth Network
    - Integrated Price Feeds for mini-games like BTC/ETH ratio guess and market cap duels.
    - Integrated Entropy (randomness) for mini-games like coin flip, dice parity, and lucky draw.
2. ENS Domains
    - Integrated to simplify event and partner identity by replacing long wallet addresses with human-readable names.
    - Users can generate subdomains, allowing them to associate their profile or participation with an easy-to-search name.
    - These subdomains make it seamless for players to participate in leaderboards, ensuring recognition is tied to a readable identity rather than a complex wallet string.
    - This improves both usability and community engagement, as players can easily connect, search, and be identified within the game ecosystem.

Hacky & notable parts
 - The trickiest challenge was integrating Pyth Network’s price feeds and entropy services alongside ENS domains, because they are not available on the same chain. We had to carefully design our contract interactions and backend flow to bridge these differences by.
 -  We open-sourced all our code in a public GitHub monorepo.
 - Deployed seamlessly using Railway for backend + frontend hosting, ensuring quick iteration and live demos during the hackathon.

How it all comes together
1. The frontend shows the map, checkpoints, and mini-games.
2. When a user plays, the frontend connects to contracts via wagmi and fetches on-chain data (Pyth price feeds / entropy).
3. The backend validates off-chain parts (social proofs, tx hashes) and updates Supabase.
4. Rewards are issued on-chain via Solidity contracts.
5. All of this is tied together in the monorepo, making it easy to maintain and extend post-hackathon.
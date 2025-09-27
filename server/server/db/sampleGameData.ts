import { db } from "./index";
import {
  usersTable,
  socialQuestsTable,
  rewardsTable,
  questSubmissionsTable,
} from "./schema";

export async function seedGameData() {
  console.log("Seeding gaming platform data...");

  try {
    // Sample users - mix of regular users and partners
    const sampleUsers = [
      {
        userAddress: "0x1234567890abcdef1234567890abcdef12345678",
        level: 5,
        distanceTravelled: "1250.75",
        checkpointsConquered: 15,
        currentAvatarId: 2,
        purchasedAvatarIds: ["1", "2", "3"],
        currentLocation: "New York",
        subDomainName: "gaming-master",
        userType: "User" as const,
      },
      {
        userAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
        level: 8,
        distanceTravelled: "2100.50",
        checkpointsConquered: 25,
        currentAvatarId: 4,
        purchasedAvatarIds: ["1", "2", "3", "4", "5"],
        currentLocation: "Los Angeles",
        subDomainName: "quest-hunter",
        userType: "User" as const,
      },
      {
        userAddress: "0xpartner1234567890abcdef1234567890abcdef",
        level: 10,
        distanceTravelled: "3000.00",
        checkpointsConquered: 30,
        currentAvatarId: 6,
        purchasedAvatarIds: ["1", "2", "3", "4", "5", "6"],
        currentLocation: "San Francisco",
        subDomainName: "crypto-corp",
        userType: "Partner" as const,
      },
      {
        userAddress: "0xpartner2abcdef1234567890abcdef1234567890",
        level: 7,
        distanceTravelled: "1800.25",
        checkpointsConquered: 20,
        currentAvatarId: 3,
        purchasedAvatarIds: ["1", "2", "3"],
        currentLocation: "Miami",
        subDomainName: "defi-partners",
        userType: "Partner" as const,
      },
      {
        userAddress: "0xuser3def1234567890abcdef1234567890abcdef",
        level: 3,
        distanceTravelled: "750.30",
        checkpointsConquered: 8,
        currentAvatarId: 1,
        purchasedAvatarIds: ["1"],
        currentLocation: "Chicago",
        subDomainName: "newbie-gamer",
        userType: "User" as const,
      },
    ];

    // Insert users
    const insertedUsers = await db.insert(usersTable).values(sampleUsers).returning();
    console.log(`✅ Inserted ${insertedUsers.length} users`);

    // Sample social quests
    const sampleQuests = [
      {
        partnerAddress: "0xpartner1234567890abcdef1234567890abcdef",
        rewardToken: "0xtoken123abc",
        rewardAmount: "100",
        rewardSymbol: "GAME",
        questLocation: "San Francisco",
        energyToBeBurned: "50",
        questName: "DeFi Education Challenge",
        questDescription: "Complete our DeFi tutorial series and share your learnings on social media",
        partnerName: "Crypto Corp",
        isActive: true,
      },
      {
        partnerAddress: "0xpartner2abcdef1234567890abcdef1234567890",
        rewardToken: "0xtoken456def",
        rewardAmount: "250",
        rewardSymbol: "QUEST",
        questLocation: "Miami",
        energyToBeBurned: "75",
        questName: "NFT Art Creation Contest",
        questDescription: "Create an original NFT artwork showcasing Miami's blockchain scene",
        partnerName: "DeFi Partners",
        isActive: true,
      },
      {
        partnerAddress: "0xpartner1234567890abcdef1234567890abcdef",
        rewardToken: "0xtoken789ghi",
        rewardAmount: "150",
        rewardSymbol: "GAME",
        questLocation: "Virtual",
        energyToBeBurned: "60",
        questName: "Blockchain Quiz Marathon",
        questDescription: "Answer 50 blockchain-related questions correctly in under 30 minutes",
        partnerName: "Crypto Corp",
        isActive: true,
      },
    ];

    // Insert quests
    const insertedQuests = await db.insert(socialQuestsTable).values(sampleQuests).returning();
    console.log(`✅ Inserted ${insertedQuests.length} social quests`);

    // Sample quest submissions
    const sampleSubmissions = [
      {
        address: "0x1234567890abcdef1234567890abcdef12345678",
        questId: insertedQuests[0].questId,
        submissionLink: "https://twitter.com/gaming-master/status/123456789",
      },
      {
        address: "0xabcdef1234567890abcdef1234567890abcdef12",
        questId: insertedQuests[0].questId,
        submissionLink: "https://medium.com/@quest-hunter/defi-learnings-abc123",
      },
      {
        address: "0xuser3def1234567890abcdef1234567890abcdef",
        questId: insertedQuests[1].questId,
        submissionLink: "https://opensea.io/collection/miami-blockchain-art",
      },
      {
        address: "0x1234567890abcdef1234567890abcdef12345678",
        questId: insertedQuests[2].questId,
        submissionLink: "https://example.com/quiz-results/gaming-master-perfect-score",
      },
    ];

    // Insert submissions
    const insertedSubmissions = await db.insert(questSubmissionsTable).values(sampleSubmissions).returning();
    console.log(`✅ Inserted ${insertedSubmissions.length} quest submissions`);

    // Sample rewards
    const sampleRewards = [
      {
        userAddress: "0x1234567890abcdef1234567890abcdef12345678",
        tokenAddress: "0xtoken123abc",
        tokenSymbol: "GAME",
        tokenAmount: "50",
        eventType: "MINI_GAMES" as const,
      },
      {
        userAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
        tokenAddress: "0xtoken456def",
        tokenSymbol: "QUEST",
        tokenAmount: "75",
        eventType: "SOCIAL_QUEST" as const,
      },
      {
        userAddress: "0xuser3def1234567890abcdef1234567890abcdef",
        tokenAddress: "0xtoken789ghi",
        tokenSymbol: "GAME",
        tokenAmount: "25",
        eventType: "PARTNER_EVENTS" as const,
      },
    ];

    // Insert rewards
    const insertedRewards = await db.insert(rewardsTable).values(sampleRewards).returning();
    console.log(`✅ Inserted ${insertedRewards.length} rewards`);

    console.log("✅ Gaming platform data seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- Users: ${insertedUsers.length} (${insertedUsers.filter(u => u.userType === 'Partner').length} partners, ${insertedUsers.filter(u => u.userType === 'User').length} regular users)`);
    console.log(`- Social Quests: ${insertedQuests.length}`);
    console.log(`- Quest Submissions: ${insertedSubmissions.length}`);
    console.log(`- Rewards: ${insertedRewards.length}`);

    return {
      users: insertedUsers,
      quests: insertedQuests,
      submissions: insertedSubmissions,
      rewards: insertedRewards,
    };

  } catch (error) {
    console.error("❌ Error seeding gaming platform data:", error);
    throw error;
  }
}

// Function to clear all data (useful for testing)
export async function clearGameData() {
  console.log("Clearing gaming platform data...");
  
  try {
    await db.delete(questSubmissionsTable);
    await db.delete(rewardsTable);
    await db.delete(socialQuestsTable);
    await db.delete(usersTable);
    
    console.log("✅ All gaming platform data cleared");
  } catch (error) {
    console.error("❌ Error clearing gaming platform data:", error);
    throw error;
  }
}

// Example usage:
// import { seedGameData } from './sampleGameData';
// seedGameData().then(() => console.log('Data seeded!'));

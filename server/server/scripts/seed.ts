import { faker } from "@faker-js/faker";
import { db } from "../db";
import {
  usersTable,
  socialQuestsTable,
  questSubmissionsTable,
  rewardsTable,
} from "../db/schema";
import { eq } from "drizzle-orm";

// helper to clean postgres-invalid chars
function cleanString(str: string): string {
  return str.replace(/\u0000/g, "");
}

async function seedUsers() {
  console.log("🌱 Starting user & partner seed...");

  const avatarIds = Array.from({ length: 10 }).map((_, i) => i + 1);

  const users = Array.from({ length: 100 }).map(() => {
    const currentAvatarId = faker.helpers.arrayElement(avatarIds);
    const purchasedAvatarIds = faker.helpers
      .arrayElements(avatarIds, { min: 1, max: 5 })
      .map(String);

    return {
      userAddress: faker.finance.ethereumAddress(),
      username: cleanString(faker.internet.username()),
      level: faker.number.int({ min: 1, max: 50 }),
      distanceTravelled: faker.number
        .float({ min: 0, max: 10000, fractionDigits: 2 })
        .toString(),
      checkpointsConquered: faker.number.int({ min: 0, max: 100 }),
      currentAvatarId,
      purchasedAvatarIds,
      currentLocation: cleanString(faker.location.city()),
      subDomainName: cleanString(faker.internet.domainWord()),
      userType: faker.helpers.arrayElement(["User", "Partner"]) as
        | "User"
        | "Partner",
    };
  });

  await db.insert(usersTable).values(users);
  console.log("✅ Seeded 100 users!");
}

async function seedQuests() {
  console.log("🌱 Starting quest seed...");

  const partners = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.userType, "Partner"));

  const quests = partners.flatMap((partner) =>
    Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => ({
      partnerAddress: partner.userAddress,
      rewardToken: faker.finance.ethereumAddress(),
      rewardAmount: faker.number.int({ min: 10, max: 100 }).toString(),
      rewardSymbol: faker.finance.currencyCode(),
      questLocation: cleanString(faker.location.city()),
      energyToBeBurned: faker.number.int({ min: 10, max: 500 }).toString(),
      questName: cleanString(faker.company.catchPhrase()),
      questDescription: cleanString(faker.lorem.sentence()),
      partnerName: cleanString(faker.company.name()),
      isActive: true,
    }))
  );

  await db.insert(socialQuestsTable).values(quests);
  console.log(`✅ Seeded ${quests.length} quests!`);
}

async function seedQuestSubmissionsAndRewards() {
  console.log("🌱 Starting submissions & rewards seed...");

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.userType, "User"));

  const quests = await db.select().from(socialQuestsTable);

  const submissions: any[] = [];
  const rewards: any[] = [];

  for (const quest of quests) {
    const participants = faker.helpers.arrayElements(users, { min: 2, max: 5 });

    for (const user of participants) {
      submissions.push({
        address: user.userAddress,
        questId: quest.questId,
        submissionLink: cleanString(faker.internet.url()),
      });

      if (faker.datatype.boolean()) {
        rewards.push({
          userAddress: user.userAddress,
          tokenAddress: quest.rewardToken,
          tokenSymbol: quest.rewardSymbol,
          tokenAmount: faker.number
            .float({ min: 1, max: 10, fractionDigits: 2 })
            .toString(),
          eventType: "SOCIAL_QUEST" as const,
        });
      }
    }
  }

  if (submissions.length) {
    await db.insert(questSubmissionsTable).values(submissions);
    console.log(`✅ Seeded ${submissions.length} submissions!`);
  }

  if (rewards.length) {
    await db.insert(rewardsTable).values(rewards);
    console.log(`✅ Seeded ${rewards.length} rewards!`);
  }
}

async function runSeed() {
  try {
    await seedUsers();
    await seedQuests();
    await seedQuestSubmissionsAndRewards();
    console.log("🌱 Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding", err);
    process.exit(1);
  }
}

runSeed();

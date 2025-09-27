import { createUser, getUserByAddress, getUserByUsername } from "../../db/queries/users";
import { UserSelectSchema } from "../../db/zodSchemaAndTypes";


export const registerUserService = async (data: {
  address: string;
  username: string;
  email?: string;
}): Promise<{
  data: {
    user: UserSelectSchema;
  } | null;
  message: string;
  error: any;
}> => {
  try {
    const { address, username, email } = data;

    // Check if user already exists


    const [ existingUser, existingUsername] = await Promise.all([
      getUserByAddress(address),
      getUserByUsername(username)
    ]);

    if (existingUser || existingUsername) {
      return { data: null, message: "User already exists", error: null };
    }




    // Create new user
    const newUser = await createUser({
      userAddress: address,
      username: username,
      email: email,
      level: 1,
      distanceTravelled: "0",
      checkpointsConquered: 0,
      currentAvatarId: 1,
      purchasedAvatarIds: ["1"],
      currentLocation: "",
      subDomainName: "",
      userType: "User",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!newUser) {
      return { data: null, message: "Failed to create user", error: null };
    }


    return {
      data: {
        user: newUser as UserSelectSchema,

      },
      message: "User created successfully",
      error: null,
    };
  } catch (error) {
    return { data: null, message: "Error registering user", error };
  }
};

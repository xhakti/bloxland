import { getUserById } from "../../db/queries/users";
import type { UserSelectSchema } from "../../db/zodSchemaAndTypes";

export const getUserByIdService = async (id: string): Promise<{
  data: UserSelectSchema | null;
  message: string;
  error: any;
}> => {
  try {
    const user = await getUserById(id);

    if (!user) {
      return {
        data: null,
        message: "User not found",
        error: null,
      };
    }

    return {
      data: user,
      message: "User fetched successfully",
      error: null,
    };
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return {
      data: null,
      message: "Failed to fetch user",
      error: error,
    };
  }
};

export default getUserByIdService;

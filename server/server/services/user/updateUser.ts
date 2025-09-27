import { updateUser, getUserByAddress } from "../../db/queries/users";
import type { UserSelectSchema, UserUpdateSchema } from "../../db/zodSchemaAndTypes";

export const updateUserService = async (
  userAddress: string,
  updateData: UserUpdateSchema
): Promise<{
  data: UserSelectSchema | null;
  message: string;
  error: any;
}> => {
  try {
    // Check if user exists
    const existingUser = await getUserByAddress(userAddress);
    if (!existingUser) {
      return {
        data: null,
        message: "User not found",
        error: null,
      };
    }

    // Update the user
    const updatedUser = await updateUser(userAddress, updateData);
    
    if (!updatedUser) {
      return {
        data: null,
        message: "Failed to update user",
        error: null,
      };
    }

    return {
      data: updatedUser,
      message: "User updated successfully",
      error: null,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      data: null,
      message: "Failed to update user",
      error: error,
    };
  }
};

export default updateUserService;

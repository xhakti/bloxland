import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { apiClient } from "../lib/api";
import type {
  ApiResponse,
  ApiError,
  User,
  RegisterUserRequest,
  RegisterUserResponse,
  Quest,
  QuestSubmission,
  Reward,
  PaginationParams,
  PaginationResponse,
} from "../lib/api";

// Query Keys - centralized for cache management
export const QUERY_KEYS = {
  health: ["health"] as const,
  users: {
    all: ["users"] as const,
    byId: (id: string) => [...QUERY_KEYS.users.all, "byId", id] as const,
    byAddress: (address: string) =>
      [...QUERY_KEYS.users.all, "byAddress", address] as const,
    leaderboard: (params?: PaginationParams) =>
      [...QUERY_KEYS.users.all, "leaderboard", params] as const,
  },
  quests: {
    all: ["quests"] as const,
    partner: (partnerAddress: string, params?: PaginationParams) =>
      [...QUERY_KEYS.quests.all, "partner", partnerAddress, params] as const,
    submissions: (questId: string, params?: any) =>
      [...QUERY_KEYS.quests.all, "submissions", questId, params] as const,
  },
  rewards: {
    all: ["rewards"] as const,
    byUser: (userAddress: string) =>
      [...QUERY_KEYS.rewards.all, "byUser", userAddress] as const,
  },
} as const;

// =============================================================================
// USER HOOKS
// =============================================================================

// Register User Mutation
export const useRegisterUser = (
  options?: UseMutationOptions<
    ApiResponse<RegisterUserResponse>,
    ApiError,
    RegisterUserRequest
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: RegisterUserRequest) =>
      apiClient.registerUser(userData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch user-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });

      // Optionally cache the new user data
      if (data.data.user) {
        queryClient.setQueryData(
          QUERY_KEYS.users.byId(data.data.user.id),
          data
        );
      }
    },
    ...options,
  });
};

// Get User by ID Query
export const useGetUser = (
  userId: string,
  options?: UseQueryOptions<ApiResponse<User>, ApiError>
) => {
  return useQuery({
    queryKey: QUERY_KEYS.users.byId(userId),
    queryFn: () => apiClient.getUserById(userId),
    enabled: !!userId,
    ...options,
  });
};

export const useGetUserByAddress = (
  address: string,
  options?: UseQueryOptions<ApiResponse<User>, ApiError>
) => {
  const enabled = options?.enabled ?? false;
  const retry = options?.retry ?? 0;

  return useQuery({
    queryKey: QUERY_KEYS.users.byAddress(address),
    queryFn: () => apiClient.getUserByAddress(address),
    ...options,
    retry,
    enabled: !!address && enabled,
  });
};

// Update User Mutation
export const useUpdateUser = (
  options?: UseMutationOptions<
    ApiResponse<User>,
    ApiError,
    { address: string; userData: Partial<User> }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ address, userData }) =>
      apiClient.updateUser(address, userData),
    onSuccess: (data, { address }) => {
      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });

      // Update cached user data if available
      if (data.data) {
        queryClient.setQueryData(QUERY_KEYS.users.byId(data.data.id), data);
      }
    },
    ...options,
  });
};

// Leaderboard Query
export const useLeaderboard = (
  params?: PaginationParams,
  options?: UseQueryOptions<
    ApiResponse<{
      users: User[];
      pagination: PaginationResponse;
    }>,
    ApiError
  >
) => {
  return useQuery({
    queryKey: QUERY_KEYS.users.leaderboard(params),
    queryFn: () => apiClient.getLeaderboard(params),
    ...options,
  });
};

// =============================================================================
// QUEST HOOKS
// =============================================================================

// Submit Quest Mutation
export const useSubmitQuest = (
  options?: UseMutationOptions<
    ApiResponse<QuestSubmission>,
    ApiError,
    {
      questId: string;
      submissionData: { userAddress: string; submissionLink: string };
    }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questId, submissionData }) =>
      apiClient.submitQuest(questId, submissionData),
    onSuccess: () => {
      // Invalidate quest-related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quests.all });
    },
    ...options,
  });
};

// Create Social Quest Mutation (Partner)
export const useCreateSocialQuest = (
  options?: UseMutationOptions<
    ApiResponse<Quest>,
    ApiError,
    {
      partnerAddress: string;
      rewardToken: string;
      rewardAmount: string;
      rewardSymbol: string;
      questLocation: string;
      energyToBeBurned: string;
      questName: string;
      questDescription: string;
      partnerName: string;
    }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questData) => apiClient.createSocialQuest(questData),
    onSuccess: () => {
      // Invalidate quest queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quests.all });
    },
    ...options,
  });
};

// Get Partner Quests Query
export const usePartnerQuests = (
  partnerAddress: string,
  params?: PaginationParams,
  options?: UseQueryOptions<
    ApiResponse<{
      quests: Quest[];
      pagination: PaginationResponse;
    }>,
    ApiError
  >
) => {
  return useQuery({
    queryKey: QUERY_KEYS.quests.partner(partnerAddress, params),
    queryFn: () => apiClient.getPartnerQuests(partnerAddress, params),
    enabled: !!partnerAddress,
    ...options,
  });
};

// Get Quest Submissions Query
export const useQuestSubmissions = (
  questId: string,
  params?: PaginationParams & { partnerAddress: string },
  options?: UseQueryOptions<
    ApiResponse<{
      submissions: QuestSubmission[];
      pagination: PaginationResponse;
    }>,
    ApiError
  >
) => {
  return useQuery({
    queryKey: QUERY_KEYS.quests.submissions(questId, params),
    queryFn: () => apiClient.getQuestSubmissions(questId, params),
    enabled: !!questId && !!params?.partnerAddress,
    ...options,
  });
};

// =============================================================================
// REWARD HOOKS
// =============================================================================

// Add Claimed Reward Mutation
export const useAddClaimedReward = (
  options?: UseMutationOptions<
    ApiResponse<Reward>,
    ApiError,
    {
      userAddress: string;
      tokenAddress: string;
      tokenSymbol: string;
      tokenAmount: string;
      eventType: string;
    }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rewardData) => apiClient.addClaimedReward(rewardData),
    onSuccess: () => {
      // Invalidate reward queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rewards.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
    },
    ...options,
  });
};

// =============================================================================
// HEALTH CHECK HOOK
// =============================================================================

export const useHealthCheck = (
  options?: UseQueryOptions<ApiResponse<{ status: string }>, ApiError>
) => {
  return useQuery({
    queryKey: QUERY_KEYS.health,
    queryFn: () => apiClient.healthCheck(),
    refetchInterval: 30000, // Check every 30 seconds
    ...options,
  });
};

// =============================================================================
// CUSTOM HOOKS FOR COMMON PATTERNS
// =============================================================================

// Hook to check if username is available (you can implement this endpoint later)
export const useCheckUsername = () => {
  const checkUsernameAvailability = async (
    username: string
  ): Promise<boolean> => {
    // This is a placeholder - you can implement the actual API call later
    // For now, simulate the check
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock some taken usernames for demo
    const takenUsernames = ["admin", "test", "user", "player1", "gamer"];
    return !takenUsernames.includes(username.toLowerCase());
  };

  return { checkUsernameAvailability };
};

// Hook for user registration with authentication flow
export const useUserRegistrationFlow = () => {
  const registerMutation = useRegisterUser();
  const { checkUsernameAvailability } = useCheckUsername();

  const registerUser = async (userData: RegisterUserRequest) => {
    // Check username availability first
    const isAvailable = await checkUsernameAvailability(userData.username);

    if (!isAvailable) {
      throw new Error("Username is already taken. Please try another.");
    }

    // Register the user
    return registerMutation.mutateAsync(userData);
  };

  return {
    registerUser,
    isLoading: registerMutation.isPending,
    error: registerMutation.error,
    data: registerMutation.data,
    isSuccess: registerMutation.isSuccess,
    reset: registerMutation.reset,
  };
};

// =============================================================================
// ERROR HELPERS
// =============================================================================

export const getErrorMessage = (error: ApiError | null): string => {
  if (!error) return "";

  if (error.message) return error.message;
  if (error.status === 0) return "Network error. Please check your connection.";
  if (error.status >= 500) return "Server error. Please try again later.";
  if (error.status === 404) return "Resource not found.";
  if (error.status === 401)
    return "Unauthorized. Please check your credentials.";
  if (error.status === 403) return "Access denied.";

  return "An unexpected error occurred.";
};

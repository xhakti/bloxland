// API Response types based on your unified format
export interface ApiResponse      <T = any> {
  data: T;
  message: string;
  error: null | string;
}

export interface ApiError {
  message: string;
  status: number;
  data?: any;
}

// User types
export interface User {
  id: string;
  userAddress: string;
  username: string;
  email?: string | null;
  level?: number;
  distanceTravelled?: string;
  checkpointsConquered?: number;
  currentAvatarId?: number;
  purchasedAvatarIds?: string[];
  currentLocation?: string;
  subDomainName?: string | null;
  userType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterUserRequest {
  address: string;
  username: string;
  email?: string;
  referrer?: string;
}

export interface RegisterUserResponse {
  user: User;
  referrerRewardGranted: boolean;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

// Quest types
export interface Quest {
  questId: string;
  questName: string;
  questDescription?: string;
  rewardAmount?: string;
  rewardSymbol?: string;
  questLocation?: string;
  energyToBeBurned?: string;
  partnerName?: string;
  createdAt?: string;
}

export interface QuestSubmission {
  id: string;
  questId: string;
  userAddress: string;
  submissionLink: string;
  status: "pending" | "approved" | "rejected";
  createdAt?: string;
}

// Reward types
export interface Reward {
  id: string;
  userAddress: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenAmount: string;
  eventType: string;
  claimedAt?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = import.meta.env.VITE_API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default error message
        }

        throw {
          message: errorMessage,
          status: response.status,
          data: null,
        } as ApiError;
      }

      const data: ApiResponse<T> = await response.json();

      // Check if the API returned an error in the unified format
      if (data.error) {
        throw {
          message: data.error,
          status: response.status,
          data: data.data,
        } as ApiError;
      }

      return data;
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        throw error as ApiError;
      }

      // Network or other errors
      throw {
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        status: 0,
        data: null,
      } as ApiError;
    }
  }

  // GET request
  async get<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const searchParams = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return this.request<T>(`${endpoint}${searchParams}`);
  }

  // POST request
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "DELETE",
    });
  }

  // User API methods
  async registerUser(
    userData: RegisterUserRequest
  ): Promise<ApiResponse<RegisterUserResponse>> {
    return this.post<RegisterUserResponse>("/user/register", userData);
  }

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return this.get<User>(`/user/${userId}`);
  }

  async getUserByAddress(address: string): Promise<ApiResponse<User>> {
    return this.get<User>(`/user/${address}`);
  }

  async updateUser(
    address: string,
    userData: Partial<User>
  ): Promise<ApiResponse<User>> {
    return this.put<User>(`/user/${address}`, userData);
  }

  async getLeaderboard(params?: PaginationParams): Promise<
    ApiResponse<{
      users: User[];
      pagination: PaginationResponse;
    }>
  > {
    return this.get("/user/leaderboard", params);
  }

  async submitQuest(
    questId: string,
    submissionData: {
      userAddress: string;
      submissionLink: string;
    }
  ): Promise<ApiResponse<QuestSubmission>> {
    return this.post<QuestSubmission>(
      `/user/submit-quest/${questId}`,
      submissionData
    );
  }

  async addClaimedReward(rewardData: {
    userAddress: string;
    tokenAddress: string;
    tokenSymbol: string;
    tokenAmount: string;
    eventType: string;
  }): Promise<ApiResponse<Reward>> {
    return this.post<Reward>("/user/add-claimed-rewards", rewardData);
  }

  // Partner API methods
  async createSocialQuest(questData: {
    partnerAddress: string;
    rewardToken: string;
    rewardAmount: string;
    rewardSymbol: string;
    questLocation: string;
    energyToBeBurned: string;
    questName: string;
    questDescription: string;
    partnerName: string;
  }): Promise<ApiResponse<Quest>> {
    return this.post<Quest>("/partner/add-social-quest", questData);
  }

  async getPartnerQuests(
    partnerAddress: string,
    params?: PaginationParams
  ): Promise<
    ApiResponse<{
      quests: Quest[];
      pagination: PaginationResponse;
    }>
  > {
    return this.get(`/partner/quests/${partnerAddress}`, params);
  }

  async getQuestSubmissions(
    questId: string,
    params?: PaginationParams & {
      partnerAddress: string;
    }
  ): Promise<
    ApiResponse<{
      submissions: QuestSubmission[];
      pagination: PaginationResponse;
    }>
  > {
    return this.get(`/partner/submissions/${questId}`, params);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.get<{ status: string }>("/health");
  }

  // Signatures API
  async getEnergizeSignature(body: {
    player: string;
    amount: string; // bigint string in wei
  }): Promise<ApiResponse<{ signature: string }>> {
    return this.post("/user/signatures/energize", body);
  }

  async getPlayAnswerSignature(body: {
    playId: string; // bigint string
    player: string;
    answer: string; // int64 string
  }): Promise<ApiResponse<{ signature: string }>> {
    return this.post("/user/signatures/play-answer", body);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or custom instances
export default ApiClient;

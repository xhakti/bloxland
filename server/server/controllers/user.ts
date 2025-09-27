import { RequestHandler } from "express";

import { ControllerHelper } from "../utils/controllerHelper";
import { SCOPE } from "../utils/enums";
import {
  getUserByIdSchema,
  getLeaderboardSchema,
  submitQuestSchema,
  addClaimedRewardsSchema,
  updateUserSchema,
  questIdParamSchema,
  userAddressParamSchema,
  registerUserSchema,
  getUserByAddressSchema,
} from "../utils/validationSchemas";

import * as UserService from "../services/user/index";

// Get user by ID
export const getUserByIdController: RequestHandler = async (req, res) => {
  await ControllerHelper({
    res,
    logMessage: "Get User By ID",
    validationSchema: getUserByIdSchema,
    validationData: { id: req.params.id },
    serviceMethod: async (data: any) =>
      await UserService.getUserByIdService(data.id),
    scope: SCOPE.USER,
  });
};

// Get leaderboard
export const getLeaderboardController: RequestHandler = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

  await ControllerHelper({
    res,
    logMessage: "Get Leaderboard",
    validationSchema: getLeaderboardSchema,
    validationData: { page, limit },
    serviceMethod: async (data: any) =>
      await UserService.getLeaderboardService({
        page: data.page,
        limit: data.limit,
      }),
    scope: SCOPE.USER,
  });
};

// Submit quest
export const submitQuestController: RequestHandler = async (req, res) => {
  await ControllerHelper({
    res,
    logMessage: "Submit Quest",
    validationSchema: submitQuestSchema.merge(questIdParamSchema),
    validationData: { ...req.body, questId: req.params.questId },
    serviceMethod: async (data: any) =>
      await UserService.submitQuestService({
        questId: data.questId,
        userAddress: data.userAddress,
        submissionLink: data.submissionLink,
      }),
    scope: SCOPE.USER,
  });
};

// Add claimed rewards
export const addClaimedRewardsController: RequestHandler = async (req, res) => {
  await ControllerHelper({
    res,
    logMessage: "Add Claimed Rewards",
    validationSchema: addClaimedRewardsSchema,
    validationData: req.body,
    serviceMethod: async (data: any) =>
      await UserService.addClaimedRewardsService(data),
    scope: SCOPE.USER,
  });
};

// Update user
export const updateUserController: RequestHandler = async (req, res) => {
  await ControllerHelper({
    res,
    logMessage: "Update User",
    validationSchema: updateUserSchema.merge(userAddressParamSchema),
    validationData: { ...req.body, address: req.params.address },
    serviceMethod: async (data: any) => {
      const { address, ...updateData } = data;
      return await UserService.updateUserService(address, updateData);
    },
    scope: SCOPE.USER,
  });
};

// Register user
export const registerUserController: RequestHandler = async (req, res) => {
  await ControllerHelper({
    res,
    logMessage: "Register User",
    validationSchema: registerUserSchema,
    validationData: req.body,
    serviceMethod: async (data: any) =>
      await UserService.registerUserService(data),
    scope: SCOPE.USER,
  });
};

// Get user by address
export const getUserByAddressController: RequestHandler = async (req, res) => {
  await ControllerHelper({
    res,
    logMessage: "Get User By Address",
    validationSchema: getUserByAddressSchema,
    validationData: { address: req.params.address },
    serviceMethod: async (data: any) => {
      const user = await UserService.getUserByAddress(data.address);
      return {
        data: user,
        message: "User retrieved successfully",
        error: null,
      };
    },
    scope: SCOPE.USER,
  });
};

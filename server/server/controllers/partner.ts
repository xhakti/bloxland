import { RequestHandler } from "express";

import { ControllerHelper } from "../utils/controllerHelper";
import { SCOPE } from "../utils/enums";
import {
  addSocialQuestSchema,
  getQuestSubmissionsSchema,
  addQuestWinnersSchema,
  getPartnerQuestsSchema,
  questIdParamSchema,
  partnerAddressParamSchema,
} from "../utils/validationSchemas";

import * as PartnerService from "../services/partner/index";

// Add social quest
export const addSocialQuestController: RequestHandler = async (req, res) => {
  await ControllerHelper({
    res,
    logMessage: "Add Social Quest",
    validationSchema: addSocialQuestSchema,
    validationData: req.body,
    serviceMethod: async (data: any) => await PartnerService.addSocialQuestService(data),
    scope: SCOPE.USER, // Using USER scope as we don't have a separate PARTNER scope
  });
};

// Get quest submissions
export const getQuestSubmissionsController: RequestHandler = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
  
  await ControllerHelper({
    res,
    logMessage: "Get Quest Submissions",
    validationSchema: getQuestSubmissionsSchema.merge(questIdParamSchema),
    validationData: { ...req.body, questId: req.params.questId, page, limit },
    serviceMethod: async (data: any) => await PartnerService.getQuestSubmissionsService(
      data.questId,
      data.partnerAddress,
      { page: data.page, limit: data.limit }
    ),
    scope: SCOPE.USER,
  });
};

// Add quest winners
export const addQuestWinnersController: RequestHandler = async (req, res) => {
  await ControllerHelper({
    res,
    logMessage: "Add Quest Winners",
    validationSchema: addQuestWinnersSchema.merge(questIdParamSchema),
    validationData: { ...req.body, questId: req.params.questId },
    serviceMethod: async (data: any) => await PartnerService.addQuestWinnersService({
      questId: data.questId,
      partnerAddress: data.partnerAddress,
      winnerAddresses: data.winnerAddresses,
    }),
    scope: SCOPE.USER,
  });
};

// Get partner quests
export const getPartnerQuestsController: RequestHandler = async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
  
  await ControllerHelper({
    res,
    logMessage: "Get Partner Quests",
    validationSchema: getPartnerQuestsSchema.merge(partnerAddressParamSchema),
    validationData: { partnerAddress: req.params.partnerAddress, page, limit },
    serviceMethod: async (data: any) => await PartnerService.getPartnerQuestsService(
      data.partnerAddress,
      { page: data.page, limit: data.limit }
    ),
    scope: SCOPE.USER,
  });
};

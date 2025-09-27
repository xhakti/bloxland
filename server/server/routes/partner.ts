import express from "express";

const router = express.Router();

import * as partnerController from "../controllers/partner";
import { addClaimedRewardsSchema } from "../utils/validationSchemas";
import { questSubmissionInsertSchema } from "../db/schema";

// Partner quest management routes
router.post("/add-social-quest", partnerController.addSocialQuestController);
router.get("/submissions/:questId", partnerController.getQuestSubmissionsController);
router.put("/add-winner/:questId", partnerController.addQuestWinnersController);
router.get("/quests/:partnerAddress", partnerController.getPartnerQuestsController);

export default router;


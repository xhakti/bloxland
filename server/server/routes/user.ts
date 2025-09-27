import express from "express";

const router = express.Router();

import * as userController from "../controllers/user";

// New user routes (specific routes first to avoid conflicts)
router.get("/leaderboard", userController.getLeaderboardController);
router.post("/submit-quest/:questId", userController.submitQuestController);
router.post("/add-claimed-rewards", userController.addClaimedRewardsController);
router.get("/:address", userController.getUserByAddressController);
router.put("/:address", userController.updateUserController);
router.post("/register", userController.registerUserController);
export default router;

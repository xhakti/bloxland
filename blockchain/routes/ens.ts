import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

// Initialize Supabase client

/**
 * POST /ens
 * Save ENS off-chain mapping
 * Body: { domain: string, contentHash: string, deployedBy: string }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { domain, contentHash, deployedBy } = req.body;

    if (!domain || !contentHash || !deployedBy) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await db
      .from("ens_mappings")
      .insert([
        {
          domain,
          content_hash: contentHash,
          deployed_by: deployedBy,
        },
      ])
      .select();

    if (error) throw error;

    return res.status(200).json({ message: "ENS mapping saved!", data });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;

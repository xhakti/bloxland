import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("Bloxland", async function () {
  const { viem } = await network.connect();

  it("Deployed", async function () {
    const blocklan = await viem.deployContract("Bloxland");
  });
});

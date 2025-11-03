// File: scripts/deploy.ts

import { ethers } from "hardhat";

async function main() {
  // --- 1. Configuration ---
  // ! IMPORTANT: Set these addresses before deploying!
  // These are addresses of PRE-EXISTING ERC20 tokens on the target network (e.g., Base Mainnet).

  // Address for the BONK token (or similar) used by Swap, Lump, and LumpStaking
  const BONK_TOKEN_ADDRESS = "0xYOUR_BONK_TOKEN_ADDRESS_HERE"; [cite_start]// [cite: 43, 62, 85]

  // Address for the second reward token used by CHGame (e.g., DEGEN)
  const TOKEN2_ADDRESS = "0xYOUR_TOKEN2_ADDRESS_HERE"; [cite_start]// [cite: 7]

  // Address for the third reward token used by CHGame (e.g., WCT)
  const TOKEN3_ADDRESS = "0xYOUR_TOKEN3_ADDRESS_HERE"; [cite_start]// [cite: 7]

  // --- 2. Get Signer Accounts ---
  [cite_start]// Make sure you have at least two private keys in your .env file or hardhat config [cite: 38]
  const [deployer, superSigner] = await ethers.getSigners();
  const initialOwner = deployer.address;
  
  [cite_start]// A Super Signer address is required for CHGame [cite: 8, 19]
  if (!superSigner) {
    throw new Error("Missing a second signer for the 'superSigner'. Please add another PRIVATE_KEY to your .env file or hardhat config.");
  }
  const superSignerAddress = superSigner.address;

  console.log("Deploying contracts with the account:", initialOwner);
  console.log("Using Super Signer (for CHGame):", superSignerAddress);
  console.log("-------------------------------------------------");

  // --- 3. Deploy CritterHolesPoints (CHP) ---
  // This is the ERC20 points token
  const CHPFactory = await ethers.getContractFactory("CritterHolesPoints");
  const chp = await CHPFactory.deploy(initialOwner); [cite_start]// [cite: 31]
  await chp.waitForDeployment();
  const chpAddress = await chp.getAddress();
  console.log(`✅ CritterHolesPoints (CHP) deployed to: ${chpAddress}`);

  // --- 4. Deploy CritterHolesHammer (HAMMER) ---
  // This is the ERC1155 NFT for minting
  const HammerFactory = await ethers.getContractFactory("CritterHolesHammer");
  const hammer = await HammerFactory.deploy(initialOwner); [cite_start]// [cite: 103]
  await hammer.waitForDeployment();
  const hammerAddress = await hammer.getAddress();
  console.log(`✅ CritterHolesHammer (HAMMER) deployed to: ${hammerAddress}`);

  // --- 5. Deploy Lump (ERC1155) ---
  // This is the ERC1155 NFT for staking, it depends on the BONK token
  const LumpFactory = await ethers.getContractFactory("Lump");
  const lump = await LumpFactory.deploy(initialOwner, BONK_TOKEN_ADDRESS); [cite_start]// [cite: 85]
  await lump.waitForDeployment();
  const lumpAddress = await lump.getAddress();
  console.log(`✅ Lump (ERC1155) deployed to: ${lumpAddress}`);

  // --- 6. Deploy Swap ---
  // This contract swaps BONK for ETH
  const SwapFactory = await ethers.getContractFactory("Swap");
  const swap = await SwapFactory.deploy(initialOwner, BONK_TOKEN_ADDRESS); [cite_start]// [cite: 46]
  await swap.waitForDeployment();
  const swapAddress = await swap.getAddress();
  console.log(`✅ Swap deployed to: ${swapAddress}`);

  // --- 7. Deploy LumpStaking ---
  // This contract stakes Lump (ERC1155) to earn BONK (ERC20)
  const LumpStakingFactory = await ethers.getContractFactory("LumpStaking");
  const lumpStaking = await LumpStakingFactory.deploy(initialOwner, lumpAddress, BONK_TOKEN_ADDRESS); [cite_start]// [cite: 61]
  await lumpStaking.waitForDeployment();
  const lumpStakingAddress = await lumpStaking.getAddress();
  console.log(`✅ LumpStaking deployed to: ${lumpStakingAddress}`);

  // --- 8. Deploy CHGame ---
  // This is the main game contract
  // It depends on CHP (Points), Token2, Token3, and the SuperSigner
  const CHGameFactory = await ethers.getContractFactory("CHGame");
  const chGame = await CHGameFactory.deploy(
    initialOwner,
    chpAddress,
    TOKEN2_ADDRESS,
    TOKEN3_ADDRESS,
    superSignerAddress
  ); [cite_start]// [cite: 7]
  await chGame.waitForDeployment();
  const chGameAddress = await chGame.getAddress();
  console.log(`✅ CHGame deployed to: ${chGameAddress}`);

  console.log("\n--- Deployment Summary ---");
  console.log(`CritterHolesPoints (CHP) = "${chpAddress}"`);
  console.log(`CritterHolesHammer (HAMMER) = "${hammerAddress}"`);
  console.log(`Lump (ERC1155) = "${lumpAddress}"`);
  console.log(`Swap = "${swapAddress}"`);
  console.log(`LumpStaking = "${lumpStakingAddress}"`);
  console.log(`CHGame = "${chGameAddress}"`);
  console.log("-------------------------------------------------");
  console.log("Deployment complete! 🎉");
  console.log("Please verify these contracts on Basescan.");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
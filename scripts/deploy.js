// scripts/deploy.js
import pkg from "hardhat";

const { ethers } = pkg;

async function main() {
    // Get the contract factories
    const EscrowFactory = await ethers.getContractFactory("Escrow");

    // Deploy the contract
    const escrow = await EscrowFactory.deploy();

    await escrow.deployed();

    console.log("Escrow contract deployed to:", escrow.address);
    console.log("Contract deployed by " + JSON.stringify(escrow.signer) + " signer");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
});

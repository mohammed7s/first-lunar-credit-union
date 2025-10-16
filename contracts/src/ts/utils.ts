import {
  waitForPXE,
  createPXEClient,
  AccountWallet,
  Contract,
  AztecAddress,
} from "@aztec/aztec.js";
import {
  IncomeVaultContract,
  IncomeVaultContractArtifact,
} from "../artifacts/IncomeVault.js";

export const createPXE = async (id: number = 0) => {
  const { BASE_PXE_URL = `http://localhost` } = process.env;
  const url = `${BASE_PXE_URL}:${8080 + id}`;
  const pxe = createPXEClient(url);
  await waitForPXE(pxe);
  return pxe;
};

export const setupSandbox = async () => {
  return createPXE();
};

/**
 * Deploys the IncomeVault contract.
 * @param deployer - The wallet to deploy the contract with.
 * @param owner - The address of the owner (employee) of the vault.
 * @returns A deployed contract instance.
 */
export async function deployIncomeVault(
  deployer: AccountWallet,
  owner: AztecAddress,
): Promise<IncomeVaultContract> {
  const contract = await Contract.deploy(
    deployer,
    IncomeVaultContractArtifact,
    [owner],
    "constructor",
  )
    .send({
      from: deployer.getAddress(),
    })
    .deployed();
  return contract as IncomeVaultContract;
}

import { ethers } from "ethers";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import {
  MetaTransactionData,
  MetaTransactionOptions,
  OperationType,
} from "@safe-global/safe-core-sdk-types";

import AccountAbstraction, {
  AccountAbstractionConfig,
} from "@safe-global/account-abstraction-kit-poc";

import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

console.log(__dirname);

import ContractInfo from "../ABI.json";
const ALCHEMY_KEY = process.env.ALCHEMY_KEY;
const RPC_URL = `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_KEY}`;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const relayPack = new GelatoRelayPack();

const chainId = 5;
const targetAddress = ContractInfo.address;

const nftContract = new ethers.Contract(
  targetAddress,
  ContractInfo.abi,
  signer
);

const gasLimit = "10000000";
// Create a transaction object

const safeTransactionData: MetaTransactionData = {
  to: targetAddress,
  data: nftContract.interface.encodeFunctionData("increment", []),
  value: "0",
  operation: OperationType.Call,
};

async function relayTransaction() {
  const safeAccountAbstraction = new AccountAbstraction(signer);
  const sdkConfig: AccountAbstractionConfig = {
    relayPack,
  };
  await safeAccountAbstraction.init(sdkConfig);

  const txConfig = {
    TO: targetAddress,
    DATA: safeTransactionData.data,
    VALUE: "0",
    // Options:
    GAS_LIMIT: gasLimit,
    GAS_TOKEN: ethers.constants.AddressZero,
  };

  const predictedSafeAddress = await safeAccountAbstraction.getSafeAddress();
  console.log({ predictedSafeAddress });

  const isSafeDeployed = await safeAccountAbstraction.isSafeDeployed();
  console.log({ isSafeDeployed });

  const safeTransactions: MetaTransactionData[] = [
    {
      to: txConfig.TO,
      data: txConfig.DATA,
      value: txConfig.VALUE,
      operation: OperationType.Call,
    },
  ];
  const options: MetaTransactionOptions = {
    gasLimit: txConfig.GAS_LIMIT,
    gasToken: txConfig.GAS_TOKEN,
    isSponsored: false,
  };

  const response = await safeAccountAbstraction.relayTransaction(
    safeTransactions,
    options
  );
  console.log(`https://relay.gelato.digital/tasks/status/${response} `);
}
relayTransaction();

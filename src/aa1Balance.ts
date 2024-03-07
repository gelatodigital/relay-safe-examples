import { ethers } from "ethers";
import {
  EthAdapter,
  MetaTransactionData,
  MetaTransactionOptions,
  OperationType,
} from "@safe-global/safe-core-sdk-types";

import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

import { GelatoRelayPack } from "@safe-global/relay-kit";
import AccountAbstraction from "@safe-global/account-abstraction-kit-poc";

import ContractInfo from "../ABI.json";
import { EthersAdapter } from "@safe-global/protocol-kit";

const ALCHEMY_KEY = process.env.ALCHEMY_KEY;
let RPC_URL = `https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const targetAddress = "0x00172f67db60E5fA346e599cdE675f0ca213b47b";

const counterContract = new ethers.Contract(
  targetAddress,
  ContractInfo.abi,
  signer
);

async function relayTransaction() {
  const gasLimit = "1000000000";

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  }) ;

  const safeAccountAbstraction = new AccountAbstraction(ethAdapter);

  await safeAccountAbstraction.init();

  const protocolKit = safeAccountAbstraction.protocolKit;
  const relayPack = new GelatoRelayPack({
    apiKey: process.env.GELATO_RELAY_API_KEY!,
    protocolKit,
  });

  await safeAccountAbstraction.setRelayKit(relayPack);

  // Create a transaction object
  const txConfig = {
    TO: targetAddress,
    DATA: counterContract.interface.encodeFunctionData("increment", []),
    // Options:
    GAS_LIMIT: gasLimit,
    VALUE: "0",
  };

  const predictedSafeAddress =
    await safeAccountAbstraction.protocolKit.getAddress();
  console.log({ predictedSafeAddress });

  const isSafeDeployed =
    await safeAccountAbstraction.protocolKit.isSafeDeployed();
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
    isSponsored: true,
  };

  const response = (await safeAccountAbstraction.relayTransaction(
    safeTransactions,
    options
  )) as { taskId: string };

  console.log(`https://relay.gelato.digital/tasks/status/${response.taskId} `);
}
relayTransaction();

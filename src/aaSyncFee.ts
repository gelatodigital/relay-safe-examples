import { ethers } from "ethers";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import {
  EthAdapter,
  MetaTransactionData,
  MetaTransactionOptions,
  OperationType,
} from "@safe-global/safe-core-sdk-types";

import AccountAbstraction from "@safe-global/account-abstraction-kit-poc";

import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

import ContractInfo from "../ABI.json";
import { EthersAdapter } from "@safe-global/protocol-kit";


const ALCHEMY_KEY = process.env.ALCHEMY_KEY;
let RPC_URL = `https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider)




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

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer
  }) as unknown as EthAdapter

  const safeAccountAbstraction = new AccountAbstraction(ethAdapter);

  await safeAccountAbstraction.init();

  const protocolKit = safeAccountAbstraction.protocolKit;
  const relayPack = new GelatoRelayPack(({ apiKey: process.env.GELATO_RELAY_API_KEY!,protocolKit}));
  
    await safeAccountAbstraction.setRelayKit(relayPack)

  const txConfig = {
    TO: targetAddress,
    DATA: safeTransactionData.data,
    VALUE: "0",
    // Options:
    GAS_LIMIT: gasLimit,
    GAS_TOKEN: ethers.ZeroAddress
  };

  const predictedSafeAddress = await safeAccountAbstraction.protocolKit.getAddress();
  console.log({ predictedSafeAddress });

  const isSafeDeployed = await safeAccountAbstraction.protocolKit.isSafeDeployed()
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
  ) as { taskId:string};

  console.log(`https://relay.gelato.digital/tasks/status/${response.taskId} `);

}
relayTransaction();

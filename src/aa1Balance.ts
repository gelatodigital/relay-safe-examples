import { ethers } from "ethers";
import {
  MetaTransactionData,
  MetaTransactionOptions,
  OperationType,
} from "@safe-global/safe-core-sdk-types";



import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

console.log(__dirname);

import ContractInfo from "../ABI.json";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import AccountAbstraction, { AccountAbstractionConfig } from "@safe-global/account-abstraction-kit-poc";
const ALCHEMY_KEY  = process.env.ALCHEMY_KEY;
let RPC_URL = `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_KEY}`;


const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// const RPC_URL = "http://::1:8545/"//`https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_KEY}`;
// const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
// const signer = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);


const GELATO_RELAY_API_KEY = process.env.GELATO_RELAY_API_KEY;



const relayPack = new GelatoRelayPack(GELATO_RELAY_API_KEY);

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
    isSponsored: true,
  };

  const response = await safeAccountAbstraction.relayTransaction(
    safeTransactions,
    options
  );
  console.log(`https://relay.gelato.digital/tasks/status/${response} `);
}
relayTransaction();

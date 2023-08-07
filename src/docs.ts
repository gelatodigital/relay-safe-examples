import { ethers } from "ethers";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import Safe, {
  EthersAdapter,
  getSafeContract,
} from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  MetaTransactionOptions,
  OperationType,
  RelayTransaction
} from "@safe-global/safe-core-sdk-types";


import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

import ContractInfo from "../ABI.json";

const ALCHEMY_KEY = process.env.ALCHEMY_KEY;
const RPC_URL = `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_KEY}`;

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(
 process.env.PRIVATE_KEY,
  provider
);

const safeAddress = "YOUR SAFE ADDRESS";
const chainId = 5;
const targetAddress = ContractInfo.address;
const GELATO_RELAY_API_KEY = process.env.GELATO_RELAY_API_KEY;
const nftContract = new ethers.Contract(
  targetAddress,
  ContractInfo.abi,
  signer
);


const gasLimit = "8000000";


async function relayTransaction() {

  // Create a transaction object
const relayKit = new GelatoRelayPack();

const gasToken = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
const ethAdapter = new EthersAdapter({
  ethers,
  signerOrProvider: signer,
});


const safeSDK = await Safe.create({
  ethAdapter,
  safeAddress,
});


const safeTransactionData: MetaTransactionData = {
  to: targetAddress,
  data: nftContract.interface.encodeFunctionData("increment", []),
  value: "0",
  operation: OperationType.Call,
  
};
const options: MetaTransactionOptions = {
  gasLimit,
  isSponsored: false,
};


const standardizedSafeTx = await relayKit.createRelayedTransaction(
  safeSDK,
  [safeTransactionData],
  options
)

const safeSingletonContract = await getSafeContract({
  ethAdapter: ethAdapter,
  safeVersion: await safeSDK.getContractVersion()
})

const signedSafeTx = await safeSDK.signTransaction(standardizedSafeTx)


  const encodedTx = safeSingletonContract.encode("execTransaction", [
    signedSafeTx.data.to,
    signedSafeTx.data.value,
    signedSafeTx.data.data,
    signedSafeTx.data.operation,
    signedSafeTx.data.safeTxGas,
    signedSafeTx.data.baseGas,
    signedSafeTx.data.gasPrice,
    signedSafeTx.data.gasToken,
    signedSafeTx.data.refundReceiver,
    signedSafeTx.encodedSignatures(),
  ]);


  const relayTransaction: RelayTransaction = {
    target: safeAddress,
    encodedTransaction: encodedTx,
    chainId: chainId,
    options,
  };

  const response = await relayKit.relayTransaction(relayTransaction);
  console.log(
    `Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`
  );
}
relayTransaction();

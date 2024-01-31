import { ethers } from "ethers";
// import { GelatoRelayPack } from "gelato-relay-kit";
import Safe, {
  EthersAdapter,
  getSafeContract,
  SafeFactory,
  SafeAccountConfig,
} from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  MetaTransactionOptions,
  OperationType,
  RelayTransaction,
} from "@safe-global/safe-core-sdk-types";


import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

import ContractInfo from "../ABI.json";

const ALCHEMY_KEY = process.env.ALCHEMY_KEY;
let  RPC_URL = `https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_KEY}`;


const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);


const safeAddress =  "0xde80C1a5A01f9C8d81E13405d949eB165e1F4191";

const targetAddress = ContractInfo.address;
const GELATO_RELAY_API_KEY = process.env.GELATO_RELAY_API_KEY;
const nftContract = new ethers.Contract(
  targetAddress,
  ContractInfo.abi,
  signer
);
  console.log(signer.address)
const gasLimit = "8000000";

async function relayTransaction() {
  // Create a transaction object
  //const relayKit = new GelatoRelayPack(GELATO_RELAY_API_KEY);
  console.log(await provider.getNetwork());

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  });

  const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapter })

  const safeAccountConfig: SafeAccountConfig = {
    owners: [
      await signer.getAddress(),
    ],
    threshold: 1,
    // ... (Optional params)
  }
  
  /* This Safe is tied to owner 1 because the factory was initialized with
  an adapter that had owner 1 as the signer. */
  console.log(68)
    const safeSdkOwner1 = await safeFactory.deploySafe({ safeAccountConfig })
    console.log(71)
  const safeAddress = await safeSdkOwner1.getAddress()

 console.log(72,safeAddress)

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
    isSponsored: true,
  };


  const safeSingletonContract = await getSafeContract({
    ethAdapter: ethAdapter,
    safeVersion: await safeSDK.getContractVersion(),
  });


  // const standardizedSafeTx = await relayKit.createRelayedTransaction(
  //   {safe:safeSDK,
  //    transactions:[safeTransactionData],
  //   options}
  // );



  // const signedSafeTx = await safeSDK.signTransaction(standardizedSafeTx);

  // const encodedTx = safeSingletonContract.encode("execTransaction", [
  //   signedSafeTx.data.to,
  //   signedSafeTx.data.value,
  //   signedSafeTx.data.data,
  //   signedSafeTx.data.operation,
  //   signedSafeTx.data.safeTxGas,
  //   signedSafeTx.data.baseGas,
  //   signedSafeTx.data.gasPrice,
  //   signedSafeTx.data.gasToken,
  //   signedSafeTx.data.refundReceiver,
  //   signedSafeTx.encodedSignatures(),
  // ]);

  // const relayTransaction: RelayTransaction = {
  //   target: safeAddress,
  //   encodedTransaction: encodedTx,
  //   chainId: 5,
  //   options,
  // };

  // const response = await relayKit.relayTransaction(relayTransaction);
  // console.log(
  //   `Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`
  // );
}
relayTransaction();

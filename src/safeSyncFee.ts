import { ethers } from "ethers";
import { GelatoRelayPack } from "@safe-global/relay-kit";
import Safe, {
  EthersAdapter,
  SafeAccountConfig,
  SafeFactory,
  getSafeContract,
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
let RPC_URL = `https://opt-sepolia.g.alchemy.com/v2/gx1KIKr7LNYvg3XvRnsJoI0mQBTlGEei`;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const targetAddress = ContractInfo.address;
const nftContract = new ethers.Contract(
  targetAddress,
  ContractInfo.abi,
  signer
);

const gasLimit = "10000000";

async function relayTransaction() {



  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  });

  let safeAddress = "0xc3F738b7B4fb394093c35927C4b0e2a4134102d5";

  try {
    const safeFactory = await SafeFactory.create({ ethAdapter: ethAdapter });

    const safeAccountConfig: SafeAccountConfig = {
      owners: [await signer.getAddress()],
      threshold: 1,
    };

    /* This Safe is tied to owner 1 because the factory was initialized with
  an adapter that had owner 1 as the signer. */

    const safeSdkOwner1 = await safeFactory.deploySafe({ safeAccountConfig });

    safeAddress = await safeSdkOwner1.getAddress();
  } catch (error) {}


  const protocolKit= await Safe.create({
    ethAdapter,
    safeAddress,
  });
  const predictedSafeAddress =
    await protocolKit.getAddress();
  console.log({ predictedSafeAddress });

  const isSafeDeployed =
    await protocolKit.isSafeDeployed();
  console.log({ isSafeDeployed });

  const relayKit = new GelatoRelayPack({ apiKey: process.env.GELATO_RELAY_API_KEY!, protocolKit})

  const safeTransactionData: MetaTransactionData = {
    to: targetAddress,
    data: nftContract.interface.encodeFunctionData("increment", []),
    value: "0",
    operation: OperationType.Call,
  };
  const options: MetaTransactionOptions = {
    gasLimit,
    isSponsored: false
  };

  const standardizedSafeTx = await relayKit.createRelayedTransaction({

    transactions:[safeTransactionData],
    options
});

  const safeSingletonContract = await getSafeContract({
    ethAdapter: ethAdapter,
    safeVersion: await protocolKit.getContractVersion(),
  });

  const signedSafeTx = await protocolKit.signTransaction(standardizedSafeTx);


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
    chainId: BigInt(11155420),
    options,
  };


   const response = await relayKit.relayTransaction(relayTransaction);
  console.log(
    `Relay Transaction Task ID: https://relay.gelato.digital/tasks/status/${response.taskId}`
  );
}
relayTransaction();

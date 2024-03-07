# safe relay examples

Simple Safe-relay repo calling Counter on Goerli "0xEEeBe2F778AA186e88dCf2FEb8f8231565769C27"



### Test

Please copy the .env.example --> and add the PK, Alchemy key and Gelato SponsorKey (if you want to test sponsored calls with 1 Balance)  

#### Account Abstraction sdk
Example of using Gelato relay with the Safe Account Abstraction 

- Using SyncFee

Code can be found [here](src/aaSyncFee.ts)

```
yarn aaSyncFee
```

- Using 1Balance

Code can be found [here](src/aa1Balance.ts)

```
yarn aa1Balance
```


#### Safe sdk integration using relay-kit
Example of using Gelato relay with the the Safe sdk. In this example you can relay transactions through any Safe controlled by the signer passing the Safe address

- Using SyncFee

Code can be found [here](src/safeSyncFee.ts)

```
yarn safeSyncFee
```

- Using 1Balance

Code can be found [here](src/safe1Balance.ts)

```
yarn safe1Balance
```

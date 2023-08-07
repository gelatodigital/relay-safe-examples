# safe relay examples

Simple Safe-relay repo calling Counter on Goerli "0x763D37aB388C5cdd2Fb0849d6275802F959fbF30"



### Test

Please copy the .env.example --> and add the PK, Alchemy key and Gelato SponsorKey (if you want to test sponsored calls with 1 Balance)  

#### Account Abstraction sdk
Example of using Gelato relay with the Safe Account Abstraction 

Code can be found [here](src/account.ts)

```
yarn account
```

#### Safe sdk integration using relay-kit
Example of using Gelato relay with the the Safe sdk. In this example you can relay transactions through any Safe controlled by the signer passing the Safe address

Code can be found [here](src/docs.ts)

```
yarn docs
```

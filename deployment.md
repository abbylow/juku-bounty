# Deployment step 

## Init Database
Run the SQLs in the folder `sql` by the sequence to create tables, create default category data and setup the constraints. 
Set the DATABASE_URL in the env var file of this application

## Smart Contract 
Repository: https://github.com/abbylow/juku-bounty-escrow
Setup the private key in env vars (https://hardhat.org/hardhat-runner/docs/reference/environment-variables#setting-parameters-with-environment-variables)
Check the deployment code in ignition/modules/BountyEscrow.ts (set the owner of Escrow contract)
Then deploy to the chain (https://hardhat.org/hardhat-runner/docs/guides/deploying)


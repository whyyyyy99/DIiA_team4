# Getting Started
## Install Node.js
####installs fnm (Fast Node Manager)
winget install Schniz.fnm

##### configure fnm environment
fnm env --use-on-cd | Out-String | Invoke-Expression

##### download and install Node.js
fnm use --install-if-missing 22

##### verifies the right Node.js version is in the environment
node -v # should print `v22.11.0`

##### verifies the right npm version is in the environment
npm -v # should print `10.9.0`

OR
https://nodejs.org/en/download/prebuilt-installer

## Install dependencies
TBA

## Run the platform
npm run dev


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

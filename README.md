## Getting Started

First, install the npm in a terminal of your IDE:

# installs fnm (Fast Node Manager)
winget install Schniz.fnm

# configure fnm environment
fnm env --use-on-cd | Out-String | Invoke-Expression

# download and install Node.js
fnm use --install-if-missing 20

# verifies the right Node.js version is in the environment
node -v # should print `v20.18.0`

# verifies the right npm version is in the environment
npm -v # should print `10.8.2`

Then, run the development server in the terminal:

npm run dev


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


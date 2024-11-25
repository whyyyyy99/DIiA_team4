# Getting Started
## Login details
### Tenant logins
1. t1@kw.com pass1
2. t2@kw.com pass2
3. t3@kw.com pass3

Old one:
tenant@gmail.com

qwerty123

### Employee-side
employeeu@kw.com

employee

### Admin-side
kevin@kw.com

admin

## Clone the repository
git clone https://github.com/patrykslomka/DIiA_team4

## Install Node.js
#### installs fnm (Fast Node Manager)
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

## Install dependencies so everything runs smoothly
The requirements to install are in package.json. In your IDE terminal, run "npm install" to install it all

## Run the platform
npm run dev


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

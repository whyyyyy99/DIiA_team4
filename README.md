# Getting Started
## Login details
### Tenant-side
tenant@gmail.com

qwerty123

### Employee-side
kevinweloveyou@kw.com

employee

### Admin-side
kevin@kw.com

kleurrijkwonen

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
The requirements to install are in package.json. In your IDE terminal, run "npm install" to install it all OR "npm install @radix-ui/react-dialog @radix-ui/react-icons @radix-ui/react-label @radix-ui/react-progress @radix-ui/react-select @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-toast class-variance-authority clsx lucide-react next react react-dom tailwind-merge tailwindcss-animate @types/node @types/react @types/react-dom @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-next postcss tailwindcss typescript"

## Run the platform
npm run dev


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

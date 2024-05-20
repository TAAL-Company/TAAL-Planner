// // set-env.js
// const { execSync } = require('child_process');
// const fs = require('fs');
// const path = require('path');

// try {
//     // Retrieve the current git commit hash
//     const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

//     // Create the .env file if it doesn't exist
//     const envFilePath = path.resolve(__dirname,  'src', '.env');
//     if (!fs.existsSync(envFilePath)) {
//         fs.writeFileSync(envFilePath, '');
//     }

//     // Append the commit hash to the .env file
//     fs.appendFileSync(envFilePath, `REACT_APP_VERSION=${commitHash}\n`);
//     console.log(`Set REACT_APP_VERSION to ${commitHash}`);
// } catch (error) {
//     console.error('Error setting environment variable:', error.message);
//     process.exit(1);
// }

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();
const envFilePath = path.resolve(__dirname,'.env');
fs.writeFileSync(envFilePath, `REACT_APP_VERSION=${commitHash}\n`);
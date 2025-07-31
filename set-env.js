const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const dotenv = require("dotenv");

const env = process.env.NODE_ENV || "development";
const envFileName = `.env.${env}`;
const envFilePath = path.resolve(__dirname, envFileName);
const baseEnvFile = path.resolve(__dirname, ".env");

// Load variables from .env.{env}
if (fs.existsSync(envFilePath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envFilePath));

  // Write merged config into .env (used by CRA)
  let output = "";
  for (const key in envConfig) {
    output += `${key}=${envConfig[key]}\n`;
    process.env[key] = envConfig[key]; // Also inject for use in Node
  }

  // Get short commit hash
  try {
    const commitHash = execSync("git rev-parse --short HEAD").toString().trim();
    output += `REACT_APP_VERSION=${commitHash}\n`;
  } catch (err) {
    console.warn("⚠️ Failed to get git commit hash:", err.message);
  }

  fs.writeFileSync(baseEnvFile, output);
  console.log(`✅ Environment variables written to .env from ${envFileName}`);
} else {
  console.warn(`⚠️ ${envFileName} not found. Skipping environment loading.`);
}
const fs = require("fs");
const path = require("path");

const envCode = String(process.env.HOST_ACCESS_CODE || "").trim();
if (!envCode) {
  console.log("HOST_ACCESS_CODE not set; keeping host-config.js from the repo.");
  process.exit(0);
}

const code = envCode;
const enabled = process.env.HOST_ACCESS_ENABLED !== "false";

const config = {
  enabled: enabled && code.length > 0,
  code,
};

const outputPath = path.join(__dirname, "..", "host-config.js");
const content = `window.HOST_ACCESS_CONFIG = ${JSON.stringify(config, null, 2)};\n`;

fs.writeFileSync(outputPath, content, "utf8");
console.log(`Wrote ${outputPath} (enabled: ${config.enabled})`);

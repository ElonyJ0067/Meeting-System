const fs = require("fs");
const path = require("path");

const code = (process.env.HOST_ACCESS_CODE || "aster-ridge-host").trim();
const enabled = process.env.HOST_ACCESS_ENABLED !== "false";

const config = {
  enabled: enabled && code.length > 0,
  code,
};

const outputPath = path.join(__dirname, "..", "host-config.js");
const content = `window.HOST_ACCESS_CONFIG = ${JSON.stringify(config, null, 2)};\n`;

fs.writeFileSync(outputPath, content, "utf8");
console.log(`Wrote ${outputPath} (enabled: ${config.enabled})`);

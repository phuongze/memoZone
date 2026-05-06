const fs = require("fs/promises");

async function readJson(path, fallbackValue) {
  try {
    const raw = await fs.readFile(path, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeJson(path, fallbackValue);
      return fallbackValue;
    }
    throw error;
  }
}

async function writeJson(path, data) {
  const serialized = JSON.stringify(data, null, 2);
  await fs.writeFile(path, serialized, "utf8");
}

module.exports = {
  readJson,
  writeJson,
};

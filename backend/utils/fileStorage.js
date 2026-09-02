const fs = require("fs");
const path = require("path");

const removeFileIfPresent = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
};

const removeStoredUpload = async (fileUrl, directory) => {
  if (!fileUrl) return;
  await removeFileIfPresent(path.join(directory, path.basename(fileUrl)));
};

module.exports = { removeFileIfPresent, removeStoredUpload };

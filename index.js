import fs from "fs/promises";
import path from "path";

import { updateVideosMetadata } from "./src/updateVideos.js";
import { updateImages } from "./src/updateImages.js";
import { displaySummary } from "./utils/showInfo.js";

const processFiles = async (folderPath) => {
  let updatedFiles = [];
  let failedFiles = [];

  try {
    const files = await fs.readdir(folderPath);

    const jpgFiles = files.filter(
      (file) => path.extname(file).toLowerCase() === ".jpg"
    );

    const videoFiles = files.filter(
      (file) =>
        path.extname(file).toLowerCase() === ".mp4" ||
        path.extname(file).toLowerCase() === ".mov" ||
        path.extname(file).toLowerCase() === ".avi"
    );

    await updateVideosMetadata(
      folderPath,
      videoFiles,
      updatedFiles,
      failedFiles
    );
    await updateImages(folderPath, jpgFiles, updatedFiles, failedFiles);

    displaySummary(jpgFiles, videoFiles, updatedFiles, failedFiles);
  } catch (err) {
    console.error("Error:", err);
  }
};

processFiles("./files");

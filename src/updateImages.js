import path from "path";
import chalk from "chalk";
import { getExifFromJpegFile } from "../utils/helpers.js";
import { showTargetExifData } from "../utils/showInfo.js";
import { updateExif } from "./updateExif.js";

export const updateImages = async (
  folderPath,
  jpgFiles,
  updatedFiles,
  failedFiles
) => {
  for (const jpgFile of jpgFiles) {
    const filePath = path.join(folderPath, jpgFile);
    console.log(chalk.blue(`Processing image file: ${jpgFile}\n`));
    const exifData = getExifFromJpegFile(filePath);
    showTargetExifData(exifData, "yellow");
    const successfullyUpdated = await updateExif(filePath);
    if (successfullyUpdated) {
      updatedFiles.push(filePath);
      const updatedExif = getExifFromJpegFile(filePath);
      showTargetExifData(updatedExif, "green");
    } else {
      failedFiles.push(filePath);
    }
  }
};

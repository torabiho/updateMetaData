import fs from "fs/promises";
import path from "path";
import readline from "readline";

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

const getUserInput = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

const validateFolderPath = async (folderPath) => {
  try {
    const folderStats = await fs.stat(folderPath);

    if (!folderStats.isDirectory()) {
      throw new Error("Provided path is not a directory.");
    }

    return folderPath;
  } catch (error) {
    throw new Error(
      "Invalid folder path. Please provide a valid directory path."
    );
  }
};

const removeQuotes = (str) => {
  return str.replace(/^'|'$/g, "");
};

const main = async () => {
  console.log("Hello! Please provide the folder path:");

  let folderPath;
  let validPath = false;

  while (!validPath) {
    try {
      folderPath = await getUserInput("> ");
      folderPath = folderPath.trim();

      if (!folderPath) {
        throw new Error(
          "Folder path cannot be empty. Please provide a valid directory path."
        );
      }

      folderPath = removeQuotes(folderPath); // Remove single quotes if present
      folderPath = path.resolve(folderPath);
      folderPath = await validateFolderPath(folderPath);

      validPath = true;
    } catch (error) {
      console.error(error.message);
    }
  }

  processFiles(folderPath);
};

main();

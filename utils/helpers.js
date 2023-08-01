import { readFileSync } from "fs";
import piexif from "piexifjs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { exiftool } from "exiftool-vendored";
import chalk from "chalk";

// Handy utility functions
export const getBase64DataFromJpegFile = (filename) =>
  readFileSync(filename).toString("binary");

export const getExifFromJpegFile = (filename) =>
  piexif.load(getBase64DataFromJpegFile(filename));

// Function to convert degrees to decimal
export const degreesToDecimal = (degrees, minutes, seconds) =>
  degrees + minutes / 60 + seconds / 3600;

// Function to convert timestamp to EXIF date format
export const getExifDate = (timestamp) => {
  const date = new Date(timestamp * 1000); // Convert UNIX timestamp to milliseconds
  return date.toISOString().slice(0, 19).replace(/-/g, ":").replace("T", " ");
};

// Function to convert mp4 video files to mov
export const convertMP4ToMOV = async (filePath) => {
  const outputFileName =
    path.basename(filePath, path.extname(filePath)) + ".mov";
  const outputFilePath = path.join(path.dirname(filePath), outputFileName);
  await new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .outputOptions(["-c:v", "copy", "-c:a", "copy"])
      .output(outputFilePath) // Specify the output file path here
      .on("end", () => resolve(outputFilePath)) // Resolve with the output file path
      .on("error", (err) => reject(err))
      .run();
  });
  return outputFilePath;
};

// Function that takes latitude or longitude to calculate gpsCoordinates
export const convertToDMS = (coord) => {
  const absCoord = Math.abs(coord);
  const deg = Math.floor(absCoord);
  const min = Math.floor((absCoord - deg) * 60);
  const sec = ((absCoord - deg - min / 60) * 3600).toFixed(2);

  return `${deg}° ${min}' ${sec}"`;
};

// Function to format ExifDate for video files
export const formatExifDate = (utcTimestamp) => {
  const dateObj = new Date(utcTimestamp * 1000); // Convert seconds to milliseconds
  const formattedDate = dateObj.toISOString().slice(0, 19).replace("T", " "); // Format to EXIF date
  return formattedDate;
};

// Function to read and display CreationDate and GPSCoordinates for the target file
export const displayTargetMetaData = async (filePath, color = "white") => {
  const existingMetadata = await exiftool.read(filePath);

  const existingTargetMetaData = {
    // @ts-ignore
    CreationDate: existingMetadata.CreateDate?.rawValue,
    // @ts-ignore
    GPSCoordinates: existingMetadata.GPSCoordinates,
  };

  for (const [key, value] of Object.entries(existingTargetMetaData)) {
    console.log(chalk[color](`${key}: ${value}`));
  }
};

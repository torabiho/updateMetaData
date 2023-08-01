import { readFileSync } from "fs";
import path from "path";
import { exiftool } from "exiftool-vendored";

import fsExtra from "fs-extra";
import {
  convertMP4ToMOV,
  convertToDMS,
  displayTargetMetaData,
  formatExifDate,
} from "../utils/helpers.js";
import chalk from "chalk";

export const updateVideosMetadata = async (
  folderPath,
  videoFiles,
  updatedFiles,
  failedFiles
) => {
  for (const file of videoFiles) {
    try {
      let filePath = path.join(folderPath, file);
      const extname = path.extname(file).toLowerCase();

      console.log(chalk.blue(`\nProcessing video file: ${file}`));

      displayTargetMetaData(filePath, "yellow");

      if (extname === ".mp4" || extname === ".avi") {
        console.log(chalk.blue(`converting video format to mov...`));
        const oldFilePath = filePath;
        filePath = await convertMP4ToMOV(filePath);

        const oldJsonFilePath = `${oldFilePath}.json`;

        // Rename the JSON file to reflect the new extension
        const newJsonFilePath = `${filePath}.json`;

        await fsExtra.rename(oldJsonFilePath, newJsonFilePath);
        // delete the original MP4 file
        await fsExtra.remove(oldFilePath);
        console.log(chalk.blue(`Conversion completed`));
      }

      // Read the JSON file to get the location data
      const jsonData = readFileSync(`${filePath}.json`);
      const parsedJsonData = JSON.parse(jsonData.toString());
      const { photoTakenTime, geoData } = parsedJsonData;
      const { timestamp: dateTime } = photoTakenTime;

      const exifDate = formatExifDate(dateTime);

      const { latitude, longitude } = geoData;
      const latRef = latitude >= 0 ? "N" : "S";
      const lonRef = longitude >= 0 ? "E" : "W";

      const gpsCoordinates = `${convertToDMS(latitude)}, ${convertToDMS(
        longitude
      )}`;

      const metaDataPayload = {
        AllDates: exifDate,
        GPSLatitude: latitude,
        GPSLongitude: longitude,
        GPSLatitudeRef: latRef,
        GPSLongitudeRef: lonRef,
        GPSCoordinates: gpsCoordinates,
      };

      await exiftool.write(filePath, metaDataPayload, ["-overwrite_original"]);
      updatedFiles.push(file);
      console.log(chalk.blue(`\nUpdated data:`));
      await displayTargetMetaData(filePath, "green");
    } catch (err) {
      console.error(`Error updating metadata for ${file}: ${err.message}`);
      failedFiles.push(file);
    }
  }

  exiftool.end();
};

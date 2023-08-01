import { readFileSync, writeFileSync } from "fs";
import piexif from "piexifjs";
import { Buffer } from "buffer";

import {
  degreesToDecimal,
  getBase64DataFromJpegFile,
  getExifDate,
  getExifFromJpegFile,
} from "../utils/helpers.js";
import chalk from "chalk";
import path from "path";

export const updateExif = async (imagePath) => {
  const { GPSHelper, GPSIFD, ExifIFD, dump, insert } = piexif;

  try {
    // Read the JSON file to get the location data
    const jsonData = readFileSync(`${imagePath}.json`);
    const parsedJsonData = JSON.parse(jsonData.toString());

    // Get latitude and longitude from geoData
    const latitude = parsedJsonData.geoData.latitude;
    const longitude = parsedJsonData.geoData.longitude;

    // Determine latitude reference (N or S) based on latitudeSpan
    const latitudeRef = latitude >= 0 ? "N" : "S";
    // Determine longitude reference (E or W) based on longitudeSpan
    const longitudeRef = longitude >= 0 ? "E" : "W";

    const imageData = getBase64DataFromJpegFile(imagePath);
    const newExif = getExifFromJpegFile(imagePath);

    newExif["GPS"][GPSIFD.GPSLatitude] = GPSHelper.degToDmsRational(
      degreesToDecimal(Math.abs(latitude), 0, 0)
    );
    newExif["GPS"][GPSIFD.GPSLatitudeRef] = latitudeRef;

    newExif["GPS"][GPSIFD.GPSLongitude] = GPSHelper.degToDmsRational(
      degreesToDecimal(Math.abs(longitude), 0, 0)
    );
    newExif["GPS"][GPSIFD.GPSLongitudeRef] = longitudeRef;

    // Update the date and time of the photo
    const photoTakenTimestamp = parseInt(
      parsedJsonData.photoTakenTime.timestamp
    );
    const exifDate = getExifDate(photoTakenTimestamp);
    newExif["Exif"][ExifIFD.DateTimeOriginal] = exifDate;
    newExif["Exif"][ExifIFD.DateTimeDigitized] = exifDate;

    // Convert the new Exif object into binary form
    const newExifBinary = dump(newExif);

    // Embed the Exif data into the image data
    const newPhotoData = insert(newExifBinary, imageData);

    // Save the new photo to a file
    let fileBuffer = Buffer.from(newPhotoData, "binary");
    writeFileSync(imagePath, fileBuffer);
    return true;
  } catch (error) {
    const fileName = path.basename(imagePath); // Get the file name
    console.log(chalk.red("Could not update exif data for", fileName));
    console.log(chalk.red(error));
    console.log("\n");
    return false;
  }
};

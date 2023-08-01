import piexif from "piexifjs";
import chalk from "chalk";

// Show the latitudes and longitudes of where the photos were taken
export const showTargetExifData = (exif, color = "white") => {
  const { GPSIFD, ImageIFD, ExifIFD } = piexif;

  const dateTime = exif["0th"][ImageIFD.DateTime];
  const dateTimeOriginal = exif["Exif"][ExifIFD.DateTimeOriginal];

  const latitude = exif["GPS"][GPSIFD.GPSLatitude];
  const latitudeRef = exif["GPS"][GPSIFD.GPSLatitudeRef];
  const longitude = exif["GPS"][GPSIFD.GPSLongitude];
  const longitudeRef = exif["GPS"][GPSIFD.GPSLongitudeRef];

  console.log(chalk[color](`DateTime: ${dateTime}`));
  console.log(chalk[color](`DateTimeOriginal: ${dateTimeOriginal}`));
  console.log(chalk[color](`Latitude: ${latitude} ${latitudeRef}`));
  console.log(chalk[color](`Longitude: ${longitude} ${longitudeRef}\n`));
};

export const displaySummary = (
  jpgFiles,
  videoFiles,
  updatedFiles,
  failedFiles
) => {
  console.log("---------------------------");
  console.log(`Total number of files: ${jpgFiles.length + videoFiles.length}`);
  console.log(`Number of images: ${jpgFiles.length}`);
  console.log(`Number of videos: ${videoFiles.length}`);
  console.log(`Successfull updates: ${updatedFiles.length}`);
  console.log(`Failed updates: ${failedFiles.length}`);
  if (failedFiles.length > 0) {
    console.log("Failed updates:");
    failedFiles.forEach((filePath) => {
      console.log(chalk.red(`\t ${filePath}`));
    });
  }
};

export const debugExif = (exif) => {
  for (const ifd in exif) {
    if (ifd == "thumbnail") {
      const thumbnailData = exif[ifd] === null ? "null" : exif[ifd];
      console.log(`- thumbnail: ${thumbnailData}`);
    } else {
      console.log(`- ${ifd}`);
      for (const tag in exif[ifd]) {
        console.log(
          `    - ${piexif.TAGS[ifd][tag]["name"]}: ${exif[ifd][tag]}`
        );
      }
    }
  }
};

const fs     = require('fs-extra');
const _      = require("lodash");
const moment = require('moment');

function incrementVersion(packageFileName, writeVersionToFile = true) {
  let packageFile = fs.readFileSync(packageFileName, "utf8");
  if (!packageFile) return undefined;

  packageFile = JSON.parse(packageFile);

  let packageVersion = packageFile.version;
  let version        = packageFile.build || {};

  version.major    = _.toString(packageVersion.split(".")[0]);
  version.minor    = _.toString(packageVersion.split(".")[1]);
  version.revision = _.toString(packageVersion.split(".")[2]);
  version.build    = _.padStart((_.toNumber(version.build) || 0) + 1, 4, "0");
  version.year     = _.toString(moment().format("YYYY"));
  version.month    = _.toString(moment().format("MM"));
  version.day      = _.toString(moment().format("DD"));
  version.hour     = _.toString(moment().format("HH"));
  version.minute   = _.toString(moment().format("mm"));

  packageFile.build = version;
  fs.writeFileSync(packageFileName, JSON.stringify(packageFile, null, 2), "utf8");
  if (writeVersionToFile) fs.writeFileSync(packageFileName.replace("package.json", "version.json"), JSON.stringify(version, null, 2), "utf8");
  return version;
}

function buildObjectToVersionString(buildObject) {
  return `${buildObject.major}.${buildObject.minor}.${buildObject.revision}.${buildObject.build}   ${buildObject.year}/${buildObject.month}/${buildObject.day} ${buildObject.hour}:${buildObject.minute}`;
}

function addVersionScriptTagToIndex(indexFilename, versionString) {
  let indexFile = fs.readFileSync(indexFilename, "utf8");
  if (indexFile) {
    if (indexFile.indexOf("const CURRENTVERSION") < 0) {
      indexFile = indexFile.replace(/<\/head>/, `<script>const CURRENTVERSION = "${versionString}";</script>${"\n"}</head>`);
    }
    else {
      indexFile = indexFile.replace(/<script>const CURRENTVERSION = (.*)?;<\/script>/, `<script>const CURRENTVERSION = "${versionString}";</script>`);
    }
    fs.writeFileSync(indexFilename, indexFile, "utf8");
  }
}

function getVersion(packageFilename) {
  let packageFile = fs.readFileSync(packageFilename, "utf8");
  if (!packageFile) return undefined;
  packageFile = JSON.parse(packageFile);
  return packageFile.build || {};
  // return `${version.major}.${version.minor}.${version.revision}.${version.build}   ${version.year}/${version.month}/${version.day} ${version.hour}:${version.minute}`;
}

module.exports = {incrementVersion, getVersion, buildObjectToVersionString, addVersionScriptTagToIndex};

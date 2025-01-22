const fs = require("fs");

const readJsonFile = (path, callback) => {
  fs.readFile(path, "utf8", (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      try {
        const jsonData = JSON.parse(data);
        callback(null, jsonData);
      } catch (parseError) {
        callback(parseError, null);
      }
    }
  });
};

const writeJsonFile = (path, data, callback) => {
  fs.writeFile(path, JSON.stringify(data, null, 2), "utf8", (err) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};

module.exports = { readJsonFile, writeJsonFile };

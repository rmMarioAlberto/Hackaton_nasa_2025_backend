const { parse } = require('csv-parse');

const parseCSV = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    parse(fileBuffer, { columns: true, trim: true }, (err, records) => {
      if (err) return reject(err);
      resolve(records);
    });
  });
};

module.exports = { parseCSV };
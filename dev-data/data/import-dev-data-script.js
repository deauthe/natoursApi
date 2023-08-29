const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('./../../models/tourModel');

dotenv.config({
  path: `${__dirname}/../../config.env`,
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() =>
    console.log('db connected to import files'),
  );

const toursRaw = fs.readFileSync(
  `${__dirname}/tours-simple.json`,
  'utf-8',
);

const tours = JSON.parse(
  fs.readFileSync(
    `${__dirname}/tours-simple.json`,
    'utf-8',
  ),
);

//import data script;

const importData = async () => {
  try {
    const toursImp = await Tour.create(tours);
    console.log('data succesfully loaded');
    console.log(toursImp[1]);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//delete data from collection

const DeleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data sucessfully deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  DeleteData();
}

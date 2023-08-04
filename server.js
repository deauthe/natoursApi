const mongoose = require('mongoose');
const dotenv = require('dotenv'); //external module to define .env files
dotenv.config({ path: './config.env' }); //reading env variables has to be on top if you wanna access them anywhere else
//reading the app file before this will return undefined if any variables from this env file are used in app
const app = require('./app');

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
  .then(() => {
    console.log('connection to db succesfull');
  });

// console.log(process.env);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    `started listening on port ${port}`,
  );
});

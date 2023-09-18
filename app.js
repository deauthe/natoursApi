const express = require('express');
const app = express();
const morgan = require('morgan'); //dev tool to get requests made displayed in the console
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const AppError = require('./utils/appError');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const reviewRouter = require('./routes/reviewRouter');

//GLOBAL MIDDLEWARES
//SECURITY HTTP HEADERS
app.use(helmet());

//DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //middleware to see requests made, in the console
}

//LIMITTING REQUESTS
const limiter = rateLimit({
  //prevents the same IP to do 'max' number of req in windowMs of reset time
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests form this ip, try again in an hour',
});

app.use('/api', limiter); //uses the limiter middleware only on the routes that start with /api

//BODY PARSER,READING DATA FROM BODY INTO REQ.BODY
app.use(express.json({ LIMIT: '10KB' })); //this is middleware, to modify req content

//DATA SANITIZATION AGAINST NoSQL QUERY INJECTION
app.use(mongoSanitize());

//DATA SANITIZATION AGAINST XSS
app.use(xssClean());

//PREVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price', //whitelisting all the parameters where pollution is allowed
    ],
  }),
);

//SERVING STATIC FILES
app.use(express.static(`${__dirname}/public/`));

//TEST MIDDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); //we can use this variable anywhere now
  //console.log(req.headers)
  next();
});

//ROUTEHANDLERS

//ROUTES
//all routes are inside individual router files now

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', CreateNewTour);
// app.get('/api/v1/tours/:id', getReqTour);
// app.patch('/api/v1/tours/:id', UpdateTour);
// app.delete('api/v1/tours/:id', DeleteTour);

app.use('/api/v1/tours', tourRouter); //this is called mounting the router
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  //error handling for all other routes, should be defined after all other valid routers like above
  // res.status(404),
  //   json({
  //     status: 'fail',
  //     message: `can't find ${req.originalUrl} on this server`,
  //   });

  next(new AppError(`can't find ${req.originalUrl} on this server`, 404)); //wnv we pass an arg into a next function, express knows that it's an error, so it skips all the other middleWare and jumps straight
  //into our global error handling middleWare
});

app.use(globalErrorHandler);

module.exports = app;

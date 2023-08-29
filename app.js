const express = require('express');
const app = express();
const morgan = require('morgan'); //dev tool to get requests made displayed in the console
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const AppError = require('./utils/appError');

//MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //middleware to see requests made, in the console
}

app.use(express.json()); //this is middleware, to modify req content
app.use(express.static(`${__dirname}/public/`));
app.use((req, res, next) => {
  //this is middleWare
  //by default applies to all the req made in the server
  //specify route to handle individual req with specified middleWare
  //app.route is in itself a middleWare for a specific route
  //but when res.json has been sent from another middleware, this mean the req/res cycle has ended and the next middleWare will not be called
  //the order of middleWare is very important as to what will be executed
  // console.log('hello from middleWare');
  next(); //without next function the req/res cycle ends, and it's basically an error
  //so either do a res.send or res.json to end the cycle manually or let the next middleWare run
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); //we can use this variable anywhere now
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

app.all('*', (req, res, next) => {
  //error handling for all other routes, should be defined after all other valid routers like above
  // res.status(404),
  //   json({
  //     status: 'fail',
  //     message: `can't find ${req.originalUrl} on this server`,
  //   });

  next(
    new AppError(
      `can't find ${req.originalUrl} on this server`,
      404,
    ),
  ); //wnv we pass an arg into a next function, express knows that it's an error, so it skips all the other middleWare and jumps straight
  //into our global error handling middleWare
});

app.use(globalErrorHandler);

module.exports = app;

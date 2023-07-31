const express = require('express');
const fs = require('fs');
const app = express();
const morgan = require('morgan');

//MIDDLEWARES
app.use(morgan('dev')); //middleware to see requests made, in the console
app.use(express.json()); //this is middleware, to modify req content
app.use((req, res, next) => {
  //this is middleWare
  //by default applies to all the req made in the server
  //specify route to handle individual req with specified middleWare
  //app.route is in itself a middleWare for a specific route
  //but when res.json has been sent from another middleware, this mean the req/res cycle has ended and the next middleWare will not be called
  //the order of middleWare is very important as to what will be executed
  console.log('hello from middleWare');
  next(); //without next function the req/res cycle ends, and it's basically an error
  //so either do a res.send or res.json to end the cycle manually or let the next middleWare run
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); //we can use this variable anywhere now
  next();
});

const tours = JSON.parse(
  fs.readFileSync(
    `${__dirname}/dev-data/data/tours-simple.json`
  )
);

//ROUTEHANDLERS
const getAllTours = (req, res) => {
  //route handler: to be called when a req is made at a route
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

const getReqTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1; //multiplying by 1 makes the string into a number if it is one
  if (id > tours.length) {
    //id exceeds total tours
    return res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }

  const reqTour = tours.find(
    (el) => el.id === id
  );

  console.log(id);
  console.log(reqTour);

  res.status(200).json({
    status: 'success',
    data: {
      tours: reqTour,
    },
  });
};

const CreateNewTour = (req, res) => {
  console.log(req.body);
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign(
    { id: newId },
    req.body
  ); //object.assign keeps the old properties and modifies or creates the mentioned ones
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours), //because tours is just a normal js object for now
    (err) => {
      res.status(201).json({
        //this also sends a res so no need to use res.send after it
        status: 'success',
        data: {
          tour: newTour,
        },
      }); //creation
    }
  ); //using the sync method will block the event loop as were in a callback function
  res.send('done'); //always send something to complete the req (but .json also sends a response, and we cant use 2 in 1, so use either or)
};

const UpdateTour = (req, res) => {
  //method doesn't really delete patch, just an example
  if (req.params.id * 1 > tours.length) {
    res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<..updataed tour here..>',
    },
  });
};

const DeleteTour = (req, res) => {
  //method doesn't really delete shit, just an example
  if (req.params.id * 1 > tours.length) {
    res.status(404).json({
      status: 'fail',
      message: 'invalid id',
    });
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const getAllusers = (req, res) => {
  res.status(500).json({
    status: 'error',
    messsage: 'this path is not yet defined',
  });
};
const createNewUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messsage: 'this path is not yet defined',
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messsage: 'this path is not yet defined',
  });
};
const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messsage: 'this path is not yet defined',
  });
};
const getReqUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    messsage: 'this path is not yet defined',
  });
};

//ROUTE HANDLERS

// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', CreateNewTour);
// app.get('/api/v1/tours/:id', getReqTour);
// app.patch('/api/v1/tours/:id', UpdateTour);
// app.delete('api/v1/tours/:id', DeleteTour);

const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter //instead of using "app", we use a mounted route, this makes it like the children route
  .route('/')
  .get(getAllTours)
  .post(CreateNewTour);

tourRouter
  .route('/:id')
  .get(getReqTour)
  .patch(UpdateTour)
  .delete(DeleteTour);

userRouter
  .route('/')
  .get(getAllusers)
  .post(createNewUser);

userRouter
  .route('/:id')
  .get(getReqUser)
  .patch(updateUser)
  .delete(deleteUser);

//mounting the routers has to be done after they are declared

app.use('/api/v1/tours', tourRouter); //this is called mounting the router
app.use('/api/v1/users', userRouter);

//SERVER START
const port = 3000;
app.listen(port, () => {
  console.log(`app running on port : ${port}`);
});

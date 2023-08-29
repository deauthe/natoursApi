module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
//catch(next) passes the wtv catch() catches and then passes it as an argument to next() which then basically tells it that it's an error
//it then calls the global error handler
//wtv func that we wanted to be cleaner and free of try catch would be written inside this function for eg:
// createNewTour = catchAsync(async (req,res)=>{
//body of the function
// })
//difficult to understand but this is actually about async codes more than express or node

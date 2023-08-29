class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString }; //hard copy
    //Filtering
    const excludedFields = [
      //to narrow the queryObj
      'page',
      'sort',
      'limit',
      'fields',
    ];
    excludedFields.forEach((el) => {
      //deleting these fields from the query
      delete queryObj[el];
    });

    //Advanced Filtering
    let queryStr = JSON.stringify(queryObj); //we use let and const ,
    // so the replace method actually does shit
    queryStr = queryStr.replace(
      /\b(gte,gt,lte,lt)\b/g,
      (match) => `$${match}`,
    ); //added dollar sign after every match to match mongo db query
    //  techniques if not already taken care of when requesting with the api
    // /\b(gte,gt,lte,lt)\b/ is a regular expression in js. study more about regular expressions

    this.query = this.query.find(
      JSON.parse(queryStr),
    ); //did not await this
    // as we build it first(other methods like sorting) and then  await it
    //these methods will be mongoose methods so will happen on that end
    //hence we don't require the object before it's done with alterations
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort
        .split(',')
        .join(' '); // sort will have multiple parameters separated by commas as reqs don't support spaes
      //although mongo needs spaces in the .sort('price' 'requestedAt' 'ratings')
      //like that to sort wrt to all the params

      this.query = this.query.sort(sortBy);
      //req.query.sort is a part of the object query
      //so if the req has a query to sort,
      //it calls the sort method from mongoose
      //this.query is the output that wer'e sort of chaining with every method in apiFeatures
    } else {
      this.query = this.query.sort('-createdAt'); //negative sign means descending order
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fieldsVisible =
        this.queryString.fields
          .split(',')
          .join(' ');
      this.query = this.query.select(
        fieldsVisible,
      );
    } else {
      this.query = this.query.select('-__v'); //negative sign removes the field and sends everything else
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit =
      this.queryString.limit * 1 || 10;
    const skippedValues = (page - 1) * limit; //the results lying before the current page
    this.query = this.query
      .skip(skippedValues)
      .limit(limit); //skip and limit are mongoose methods
    return this;
  }
}
module.exports = APIFeatures;

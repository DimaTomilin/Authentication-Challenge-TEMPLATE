exports.unknownEndpoint = (req, res, next) => {
  // if i got to this middleware then i missed endpoint
  res.status(404).json({ error: 'unknown endpoint' });
  next();
};

exports.errorHandlerMiddleware = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status);
    res.send({ error: err.message });
  } else {
    res.status(500);
    res.send({ error: 'Internal Server Error' });
  }
};

const app = require('./app');

const port = process.env.PORT || 8080;


// starting the server
app.listen(port, () => {
  console.log(`listening on port: ${port}`);
});

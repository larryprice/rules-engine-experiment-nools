module.exports = {
  db: {
    production: process.env.MONGOLAB_URI,
    development: "mongodb://localhost/rules-engine-experiment-nools"
  }
};
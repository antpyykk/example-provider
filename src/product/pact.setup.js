const controller = require("./product.controller");
const Product = require("./product");

const baseOpts = {
  logLevel: "INFO",
  providerBaseUrl: "http://localhost:4042",
  providerVersion: process.env.GIT_COMMIT,
  providerVersionBranch: process.env.GIT_BRANCH, // the recommended way of publishing verification results with the branch property
  verbose: process.env.VERBOSE === "true",
};

// Setup provider server to verify

const setupServer = () => {
  const app = require("express")();
  const authMiddleware = require("../middleware/auth.middleware");
  app.use(authMiddleware);
  app.use(require("./product.routes"));
  const server = app.listen("4042");
  return server;
};

const stateHandlers = {
  "products exists": () => {
    controller.repository.products = new Map([
      ["10", new Product("10", "CREDIT_CARD", "28 Degrees", "v1","blue", "John Doe")],
    ]);
  },
  "products exist": () => {
    controller.repository.products = new Map([
      ["10", new Product("10", "CREDIT_CARD", "28 Degrees", "v1","blue", "Jane Doe")],
    ]);
  },
  "a product with ID 10 exists": () => {
    controller.repository.products = new Map([
      ["10", new Product("10", "CREDIT_CARD", "28 Degrees", "v1","blue", "Mr Foobar")],
    ]);
  },
  "a product with ID 11 does not exist": () => {
    controller.repository.products = new Map();
  },
};

const requestFilter = (req, res, next) => {
  if (!req.headers["authorization"]) {
    next();
    return;
  }
  req.headers["authorization"] = `Bearer ${new Date().toISOString()}`;
  next();
};

module.exports = {
  baseOpts,
  setupServer,
  stateHandlers,
  requestFilter,
};

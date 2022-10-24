const process = require("process");

const { Octokit } = require("@octokit/rest");
const { ClientError } = require("../common");
require("dotenv").config();

/**
 * Gets an environment variable value
 * @param {String} name the environment variable name
 */
function getProcessEnvVariable(name, mandatory = true) {
  const val = process.env[name];
  if (mandatory && (!val || !val.length)) {
    throw new ClientError(`environment variable ${name} not set!`);
  }
  return val;
}

function createOctokitInstance(token) {
  return token
    ? new Octokit({
        auth: `token ${token}`,
        userAgent: "kiegroup/github-build-chain-action"
      })
    : new Octokit({
        userAgent: "kiegroup/github-build-chain-action"
      });
}

module.exports = {
  createOctokitInstance,
  getProcessEnvVariable
};

const { processCracoConfig } = require("@craco/craco/lib/config");
const { getCraPaths } = require("@craco/craco/lib/cra");

const getCracoContext = (callerCracoConfig, env = process.env.NODE_ENV) => {
  const context = { env };
  const cracoConfig = processCracoConfig(callerCracoConfig, { env });
  context.paths = getCraPaths(cracoConfig);
  return context;
};

module.exports = {
  getCracoContext,
};

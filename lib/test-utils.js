const { processCracoConfig } = require("@craco/craco/dist/lib/config");
const { getCraPaths } = require("@craco/craco/dist/lib/cra");

const getCracoContext = (callerCracoConfig, env = process.env.NODE_ENV) => {
  const context = { env };
  const cracoConfig = processCracoConfig(callerCracoConfig, { env });
  context.paths = getCraPaths(cracoConfig);
  return context;
};

module.exports = {
  getCracoContext,
};

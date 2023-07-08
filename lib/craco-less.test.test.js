const { createJestConfig } = require("@craco/craco");
const { processCracoConfig } = require("@craco/craco/dist/lib/config");
const {
  applyJestConfigPlugins,
} = require("@craco/craco/dist/lib/features/plugins");
const clone = require("clone");
const CracoLessPlugin = require("./craco-less");
const { getCracoContext } = require("./test-utils");

process.env.NODE_ENV = "test";

const baseCracoConfig = {};
const cracoContext = getCracoContext(baseCracoConfig);
const originalJestConfig = createJestConfig(baseCracoConfig);

const overrideJestConfig = (callerCracoConfig, jestConfig) => {
  return applyJestConfigPlugins(
    processCracoConfig({
      ...baseCracoConfig,
      ...callerCracoConfig,
    }),
    jestConfig,
    cracoContext,
  );
};

let jestConfig;
beforeEach(() => {
  // deep clone the object before each test.
  jestConfig = clone(originalJestConfig);
});

test("the jest config is modified correctly", () => {
  jestConfig = overrideJestConfig(
    {
      plugins: [{ plugin: CracoLessPlugin }],
    },
    jestConfig,
  );

  const moduleNameMapper = jestConfig.moduleNameMapper;
  expect(moduleNameMapper["^.+\\.module\\.(css|sass|scss)$"]).toBeUndefined();
  expect(moduleNameMapper["^.+\\.module\\.(css|less|sass|scss)$"]).toEqual(
    "identity-obj-proxy",
  );

  const transformIgnorePatterns = jestConfig.transformIgnorePatterns;
  expect(transformIgnorePatterns[1]).toEqual(
    "^.+\\.module\\.(css|less|sass|scss)$",
  );
});

test("throws an error when we can't find CSS Modules pattern under moduleNameMapper in the jest config", () => {
  delete jestConfig.moduleNameMapper["^.+\\.module\\.(css|sass|scss)$"];

  const runTest = () => {
    overrideJestConfig(
      {
        plugins: [{ plugin: CracoLessPlugin }],
      },
      jestConfig,
    );
  };

  expect(runTest).toThrowError(
    /^Can't find CSS Modules pattern under moduleNameMapper in the test jest config!/,
  );
});

test("throws an error when we can't find CSS Modules pattern under transformIgnorePatterns in the jest config", () => {
  jestConfig.transformIgnorePatterns =
    jestConfig.transformIgnorePatterns.filter(
      (e) => e !== "^.+\\.module\\.(css|sass|scss)$",
    );

  const runTest = () => {
    overrideJestConfig(
      {
        plugins: [{ plugin: CracoLessPlugin }],
      },
      jestConfig,
    );
  };

  expect(runTest).toThrowError(
    /^Can't find CSS Modules pattern under transformIgnorePatterns in the test jest config!/,
  );
});

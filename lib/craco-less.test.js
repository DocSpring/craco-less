const CracoLessPlugin = require("./craco-less");
const { overrideWebpack } = require("@craco/craco/lib/features/webpack");
const {
  applyCracoConfigPlugins
} = require("@craco/craco/lib/features/plugins");

const clone = require("clone");

const { craPaths, loadWebpackDevConfig } = require("@craco/craco/lib/cra");

const context = { env: "development", paths: craPaths };

const originalWebpackConfig = loadWebpackDevConfig();
let webpackConfig;
beforeEach(() => {
  // loadWebpackDevConfig() caches the config internally, so we need to
  // deep clone the object before each test.
  webpackConfig = clone(originalWebpackConfig);
});

const applyCracoConfigAndOverrideWebpack = cracoConfig => {
  cracoConfig = applyCracoConfigPlugins(cracoConfig, context);
  overrideWebpack(cracoConfig, webpackConfig, () => {}, context);
};

test("the webpack config is modified correctly without less-loader options", () => {
  applyCracoConfigAndOverrideWebpack({
    plugins: [{ plugin: CracoLessPlugin }]
  });
  const oneOfRules = webpackConfig.module.rules.find(r => r.oneOf);
  expect(oneOfRules).not.toBeUndefined();
  const lessRule = oneOfRules.oneOf.find(
    r => r.test && r.test.toString() === "/\\.less$/"
  );
  expect(lessRule).not.toBeUndefined();
  expect(lessRule.use[2].loader).toContain("/less-loader");
  expect(lessRule.use[2].options).toEqual({});
});

test("the webpack config is modified correctly with less-loader options", () => {
  applyCracoConfigAndOverrideWebpack({
    plugins: [
      {
        plugin: CracoLessPlugin,
        options: {
          modifyVars: {
            "@less-variable": "#fff"
          },
          javascriptEnabled: true
        }
      }
    ]
  });

  const oneOfRules = webpackConfig.module.rules.find(r => r.oneOf);
  expect(oneOfRules).not.toBeUndefined();
  const lessRule = oneOfRules.oneOf.find(
    r => r.test && r.test.toString() === "/\\.less$/"
  );
  expect(lessRule).not.toBeUndefined();
  expect(lessRule.use[2].loader).toContain("/less-loader");
  expect(lessRule.use[2].options).toEqual({
    javascriptEnabled: true,
    modifyVars: {
      "@less-variable": "#fff"
    }
  });
});

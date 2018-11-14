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

test("throws an error when we can't find file-loader in the webpack config", () => {
  let oneOfRules = webpackConfig.module.rules.find(r => r.oneOf);
  oneOfRules.oneOf = oneOfRules.oneOf.filter(
    r => !(r.loader && r.loader.includes("file-loader"))
  );

  const runTest = () => {
    applyCracoConfigAndOverrideWebpack({
      plugins: [{ plugin: CracoLessPlugin }]
    });
  };

  expect(runTest).toThrowError(
    "Can't find file-loader in the webpack config!\n\n" +
      "This error probably occurred because you updated react-scripts or craco. " +
      "Please try updating craco-less to the latest version:\n\n" +
      "   $ yarn upgrade craco-less\n\n" +
      "Or:\n\n" +
      "   $ npm update craco-less\n\n" +
      "If that doesn't work, craco-less needs to be fixed to support the latest version.\n" +
      "Please check to see if there's already an issue in the FormAPI/craco-less repo:\n\n" +
      "   * https://github.com/FormAPI/craco-less/issues?q=is%3Aissue+webpack+file-loader\n\n" +
      "If not, please open an issue and we'll take a look. (Or you can send a PR!)\n\n" +
      "You might also want to look for related issues in the " +
      "craco and create-react-app repos:\n\n" +
      "   * https://github.com/sharegate/craco/issues?q=is%3Aissue+webpack+file-loader\n" +
      "   * https://github.com/facebook/create-react-app/issues?q=is%3Aissue+webpack+file-loader\n"
  );
});

test("throws an error when we can't find the oneOf rules in the webpack config", () => {
  let oneOfRules = webpackConfig.module.rules.find(r => r.oneOf);
  oneOfRules.oneOf = null;

  const runTest = () => {
    applyCracoConfigAndOverrideWebpack({
      plugins: [{ plugin: CracoLessPlugin }]
    });
  };

  expect(runTest).toThrowError(
    "Can't find a 'oneOf' rule under module.rules in the webpack config!\n\n" +
      "This error probably occurred because you updated react-scripts or craco. " +
      "Please try updating craco-less to the latest version:\n\n" +
      "   $ yarn upgrade craco-less\n\n" +
      "Or:\n\n" +
      "   $ npm update craco-less\n\n" +
      "If that doesn't work, craco-less needs to be fixed to support the latest version.\n" +
      "Please check to see if there's already an issue in the FormAPI/craco-less repo:\n\n" +
      "   * https://github.com/FormAPI/craco-less/issues?q=is%3Aissue+webpack+rules+oneOf\n\n" +
      "If not, please open an issue and we'll take a look. (Or you can send a PR!)\n\n" +
      "You might also want to look for related issues in the " +
      "craco and create-react-app repos:\n\n" +
      "   * https://github.com/sharegate/craco/issues?q=is%3Aissue+webpack+rules+oneOf\n" +
      "   * https://github.com/facebook/create-react-app/issues?q=is%3Aissue+webpack+rules+oneOf\n"
  );
});

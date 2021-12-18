const path = require("path");
const CracoLessPlugin = require("./craco-less");
const {
  applyCracoConfigPlugins,
  applyWebpackConfigPlugins,
} = require("@craco/craco/lib/features/plugins");
const getCSSModuleLocalIdent = require("react-dev-utils/getCSSModuleLocalIdent");

const clone = require("clone");

const { getCraPaths, loadWebpackDevConfig } = require("@craco/craco/lib/cra");
const { styleRuleByName } = require("./utils");

const context = {
  env: "development",
  paths: getCraPaths({
    reactScriptsVersion: "react-scripts",
  }),
};

let webpackConfig;
let originalWebpackConfig;
beforeEach(() => {
  if (!originalWebpackConfig) {
    process.env.NODE_ENV = "development";
    originalWebpackConfig = loadWebpackDevConfig({
      reactScriptsVersion: "react-scripts",
    });
    process.env.NODE_ENV = "test";
  }

  // loadWebpackDevConfig() caches the config internally, so we need to
  // deep clone the object before each test.
  webpackConfig = clone(originalWebpackConfig);
});

const applyCracoConfigAndOverrideWebpack = (cracoConfig) => {
  cracoConfig = applyCracoConfigPlugins(cracoConfig, context);
  webpackConfig = applyWebpackConfigPlugins(
    cracoConfig,
    webpackConfig,
    context
  );
};

test("the webpack config is modified correctly without any options", () => {
  applyCracoConfigAndOverrideWebpack({
    plugins: [{ plugin: CracoLessPlugin }],
  });
  const oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
  expect(oneOfRule).not.toBeUndefined();
  const lessRule = oneOfRule.oneOf.find(
    (r) => r.test && r.test.toString() === "/\\.less$/"
  );
  expect(lessRule).not.toBeUndefined();
  expect(lessRule.use[0].loader).toContain(`${path.sep}style-loader`);
  expect(lessRule.use[0].options).toEqual({});

  expect(lessRule.use[1].loader).toContain(`${path.sep}css-loader`);
  expect(lessRule.use[1].options).toEqual({
    importLoaders: 3,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessRule.use[2].options.ident).toEqual("postcss");
  expect(lessRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessRule.use[3].loader).toContain(`${path.sep}resolve-url-loader`);
  expect(lessRule.use[3].options).toEqual({
    root: lessRule.use[3].options.root,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessRule.use[4].options).toEqual({ sourceMap: true });

  const lessModuleRule = oneOfRule.oneOf.find(
    (r) => r.test && r.test.toString() === "/\\.module\\.less$/"
  );
  expect(lessModuleRule).not.toBeUndefined();
  expect(lessModuleRule.use[0].loader).toContain(`${path.sep}style-loader`);
  expect(lessModuleRule.use[0].options).toEqual({});

  expect(lessModuleRule.use[1].loader).toContain(`${path.sep}css-loader`);
  expect(lessModuleRule.use[1].options).toEqual({
    importLoaders: 3,
    sourceMap: webpackConfig.devtool !== false,
    modules: {
      getLocalIdent: getCSSModuleLocalIdent,
    },
  });

  expect(lessModuleRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessModuleRule.use[2].options.ident).toEqual("postcss");
  expect(lessModuleRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessModuleRule.use[3].loader).toContain(
    `${path.sep}resolve-url-loader`
  );
  expect(lessModuleRule.use[3].options).toEqual({
    root: lessModuleRule.use[3].options.root,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessModuleRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessModuleRule.use[4].options).toEqual({ sourceMap: true });
});

test("the webpack config is modified correctly with less-loader options", () => {
  applyCracoConfigAndOverrideWebpack({
    plugins: [
      {
        plugin: CracoLessPlugin,
        options: {
          lessLoaderOptions: {
            modifyVars: {
              "@less-variable": "#fff",
            },
            javascriptEnabled: true,
          },
        },
      },
    ],
  });

  const oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
  expect(oneOfRule).not.toBeUndefined();
  const lessRule = oneOfRule.oneOf.find(
    (r) => r.test && r.test.toString() === "/\\.less$/"
  );
  expect(lessRule).not.toBeUndefined();

  expect(lessRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessRule.use[2].options.ident).toEqual("postcss");
  expect(lessRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessRule.use[3].loader).toContain(`${path.sep}resolve-url-loader`);
  expect(lessRule.use[3].options).toEqual({
    root: lessRule.use[3].options.root,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessRule.use[4].options).toEqual({
    sourceMap: true,
    javascriptEnabled: true,
    modifyVars: {
      "@less-variable": "#fff",
    },
  });

  const lessModuleRule = oneOfRule.oneOf.find(
    (r) => r.test && r.test.toString() === "/\\.module\\.less$/"
  );
  expect(lessModuleRule).not.toBeUndefined();

  expect(lessModuleRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessModuleRule.use[2].options.ident).toEqual("postcss");
  expect(lessModuleRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessModuleRule.use[3].loader).toContain(
    `${path.sep}resolve-url-loader`
  );
  expect(lessModuleRule.use[3].options).toEqual({
    root: lessModuleRule.use[3].options.root,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessModuleRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessModuleRule.use[4].options).toEqual({
    sourceMap: true,
    javascriptEnabled: true,
    modifyVars: {
      "@less-variable": "#fff",
    },
  });
});

test("the webpack config is modified correctly with all loader options", () => {
  applyCracoConfigAndOverrideWebpack({
    plugins: [
      {
        plugin: CracoLessPlugin,
        options: {
          lessLoaderOptions: {
            modifyVars: {
              "@less-variable": "#fff",
            },
            javascriptEnabled: true,
          },
          cssLoaderOptions: {
            modules: true,
            localIdentName: "[local]_[hash:base64:5]",
          },
          postcssLoaderOptions: {
            ident: "test-ident",
          },
          styleLoaderOptions: {
            sourceMaps: true,
          },
          miniCssExtractPluginOptions: {
            testOption: "test-value",
          },
        },
      },
    ],
  });

  const oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
  expect(oneOfRule).not.toBeUndefined();
  const lessRule = oneOfRule.oneOf.find(
    (r) => r.test && r.test.toString() === "/\\.less$/"
  );
  expect(lessRule).not.toBeUndefined();
  expect(lessRule.use[0].loader).toContain(`${path.sep}style-loader`);
  expect(lessRule.use[0].options).toEqual({
    sourceMaps: true,
  });

  expect(lessRule.use[1].loader).toContain(`${path.sep}css-loader`);
  expect(lessRule.use[1].options).toEqual({
    modules: true,
    importLoaders: 3,
    localIdentName: "[local]_[hash:base64:5]",
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessRule.use[2].options.ident).toEqual("test-ident");
  expect(lessRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessRule.use[3].loader).toContain(`${path.sep}resolve-url-loader`);
  expect(lessRule.use[3].options).toEqual({
    root: lessRule.use[3].options.root,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessRule.use[4].options).toEqual({
    sourceMap: true,
    javascriptEnabled: true,
    modifyVars: {
      "@less-variable": "#fff",
    },
  });

  const lessModuleRule = oneOfRule.oneOf.find(
    (r) => r.test && r.test.toString() === "/\\.module\\.less$/"
  );
  expect(lessModuleRule).not.toBeUndefined();
  expect(lessModuleRule.use[0].loader).toContain(`${path.sep}style-loader`);
  expect(lessModuleRule.use[0].options).toEqual({
    sourceMaps: true,
  });

  expect(lessModuleRule.use[1].loader).toContain(`${path.sep}css-loader`);
  expect(lessModuleRule.use[1].options).toEqual({
    modules: true,
    importLoaders: 3,
    localIdentName: "[local]_[hash:base64:5]",
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessModuleRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessModuleRule.use[2].options.ident).toEqual("test-ident");
  expect(lessModuleRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessModuleRule.use[3].loader).toContain(
    `${path.sep}resolve-url-loader`
  );
  expect(lessModuleRule.use[3].options).toEqual({
    root: lessModuleRule.use[3].options.root,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessModuleRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessModuleRule.use[4].options).toEqual({
    sourceMap: true,
    javascriptEnabled: true,
    modifyVars: {
      "@less-variable": "#fff",
    },
  });
});

test("the webpack config is modified correctly with the modifyLessRule option", () => {
  applyCracoConfigAndOverrideWebpack({
    plugins: [
      {
        plugin: CracoLessPlugin,
        options: {
          modifyLessRule: (rule, context) => {
            if (context.env === "production") {
              rule.use[0].options.testOption = "test-value-production";
            } else {
              rule.use[0].options.testOption = "test-value-development";
            }
            return rule;
          },
        },
      },
    ],
  });

  const oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
  expect(oneOfRule).not.toBeUndefined();
  const lessRule = oneOfRule.oneOf.find(
    (r) => r.test && r.test.toString() === "/\\.less$/"
  );
  expect(lessRule).not.toBeUndefined();

  expect(lessRule.use[0].loader).toContain(`${path.sep}style-loader`);
  expect(lessRule.use[0].options.testOption).toEqual("test-value-development");

  expect(lessRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessRule.use[2].options.ident).toEqual("postcss");
  expect(lessRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessRule.use[3].loader).toContain(`${path.sep}resolve-url-loader`);
  expect(lessRule.use[3].options).toEqual({
    root: lessRule.use[3].options.root,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessRule.use[4].options).toEqual({ sourceMap: true });
});

test("the webpack config is modified correctly with the modifyLessModuleRule option", () => {
  applyCracoConfigAndOverrideWebpack({
    plugins: [
      {
        plugin: CracoLessPlugin,
        options: {
          modifyLessModuleRule: (rule, context) => {
            if (context.env === "production") {
              rule.use[0].options.testOption = "test-value-production";
              rule.use[1].options.modules.getLocalIdent =
                "test-deep-clone-production";
            } else {
              rule.use[0].options.testOption = "test-value-development";
              rule.use[1].options.modules.getLocalIdent =
                "test-deep-clone-development";
            }
            return rule;
          },
        },
      },
    ],
  });

  const oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
  expect(oneOfRule).not.toBeUndefined();
  const lessModuleRule = oneOfRule.oneOf.find(
    (r) => r.test && r.test.toString() === "/\\.module\\.less$/"
  );
  expect(lessModuleRule).not.toBeUndefined();

  expect(lessModuleRule.use[0].loader).toContain(`${path.sep}style-loader`);
  expect(lessModuleRule.use[0].options.testOption).toEqual(
    "test-value-development"
  );

  expect(lessModuleRule.use[1].options.modules.getLocalIdent).toEqual(
    "test-deep-clone-development"
  );

  expect(lessModuleRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessModuleRule.use[2].options.ident).toEqual("postcss");
  expect(lessModuleRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessModuleRule.use[3].loader).toContain(
    `${path.sep}resolve-url-loader`
  );
  expect(lessModuleRule.use[3].options).toEqual({
    root: lessModuleRule.use[3].options.root,
    sourceMap: webpackConfig.devtool !== false,
  });

  expect(lessModuleRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessModuleRule.use[4].options).toEqual({ sourceMap: true });

  const sassModuleRule = oneOfRule.oneOf.find(
    styleRuleByName("scss|sass", true)
  );

  expect(sassModuleRule.use[1].options.modules.getLocalIdent).toEqual(
    getCSSModuleLocalIdent
  );
});

test("throws an error when we can't find file-loader in the webpack config", () => {
  let oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
  oneOfRule.oneOf = oneOfRule.oneOf.filter(
    (r) => !(r.loader && r.loader.includes("file-loader"))
  );

  const runTest = () => {
    applyCracoConfigAndOverrideWebpack({
      plugins: [{ plugin: CracoLessPlugin }],
    });
  };

  expect(runTest).toThrowError(
    "Can't find file-loader in the development webpack config!\n\n" +
      "This error probably occurred because you updated react-scripts or craco. " +
      "Please try updating craco-less to the latest version:\n\n" +
      "   $ yarn upgrade craco-less\n\n" +
      "Or:\n\n" +
      "   $ npm update craco-less\n\n" +
      "If that doesn't work, craco-less needs to be fixed to support the latest version.\n" +
      "Please check to see if there's already an issue in the DocSpring/craco-less repo:\n\n" +
      "   * https://github.com/DocSpring/craco-less/issues?q=is%3Aissue+webpack+file-loader\n\n" +
      "If not, please open an issue and we'll take a look. (Or you can send a PR!)\n\n" +
      "You might also want to look for related issues in the " +
      "craco and create-react-app repos:\n\n" +
      "   * https://github.com/sharegate/craco/issues?q=is%3Aissue+webpack+file-loader\n" +
      "   * https://github.com/facebook/create-react-app/issues?q=is%3Aissue+webpack+file-loader\n"
  );
});

test("throws an error when we can't find the oneOf rules in the webpack config", () => {
  let oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
  oneOfRule.oneOf = null;

  const runTest = () => {
    applyCracoConfigAndOverrideWebpack({
      plugins: [{ plugin: CracoLessPlugin }],
    });
  };

  expect(runTest).toThrowError(
    "Can't find a 'oneOf' rule under module.rules in the development webpack config!\n\n" +
      "This error probably occurred because you updated react-scripts or craco. " +
      "Please try updating craco-less to the latest version:\n\n" +
      "   $ yarn upgrade craco-less\n\n" +
      "Or:\n\n" +
      "   $ npm update craco-less\n\n" +
      "If that doesn't work, craco-less needs to be fixed to support the latest version.\n" +
      "Please check to see if there's already an issue in the DocSpring/craco-less repo:\n\n" +
      "   * https://github.com/DocSpring/craco-less/issues?q=is%3Aissue+webpack+rules+oneOf\n\n" +
      "If not, please open an issue and we'll take a look. (Or you can send a PR!)\n\n" +
      "You might also want to look for related issues in the " +
      "craco and create-react-app repos:\n\n" +
      "   * https://github.com/sharegate/craco/issues?q=is%3Aissue+webpack+rules+oneOf\n" +
      "   * https://github.com/facebook/create-react-app/issues?q=is%3Aissue+webpack+rules+oneOf\n"
  );
});

test("throws an error when react-scripts adds an unknown webpack rule", () => {
  let oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
  const sassRule = oneOfRule.oneOf.find(styleRuleByName("scss|sass", false));
  sassRule.use.push({
    loader: "/path/to/unknown-loader/index.js",
  });
  const runTest = () => {
    applyCracoConfigAndOverrideWebpack({
      plugins: [{ plugin: CracoLessPlugin }],
    });
  };
  expect(runTest).toThrowError(
    new RegExp(
      "Found an unhandled loader in the development webpack config: " +
        "/path/to/unknown-loader/index.js"
    )
  );
});

test("throws an error when the sass rule is missing", () => {
  let oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
  let matchSassRule = styleRuleByName("scss|sass", false);
  oneOfRule.oneOf = oneOfRule.oneOf.filter((rule) => !matchSassRule(rule));

  const runTest = () => {
    applyCracoConfigAndOverrideWebpack({
      plugins: [{ plugin: CracoLessPlugin }],
    });
  };
  expect(runTest).toThrowError(
    new RegExp(
      "Can't find the webpack rule to match scss/sass files in the " +
        "development webpack config!"
    )
  );
});

test("throws an error when the sass module rule is missing", () => {
  let oneOfRule = webpackConfig.module.rules.find((r) => r.oneOf);
  let matchSassModuleRule = styleRuleByName("scss|sass", true);
  oneOfRule.oneOf = oneOfRule.oneOf.filter(
    (rule) => !matchSassModuleRule(rule)
  );

  const runTest = () => {
    applyCracoConfigAndOverrideWebpack({
      plugins: [{ plugin: CracoLessPlugin }],
    });
  };
  expect(runTest).toThrowError(
    new RegExp(
      "Can't find the webpack rule to match scss/sass module files in the " +
        "development webpack config!"
    )
  );
});

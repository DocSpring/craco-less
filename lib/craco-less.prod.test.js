const path = require("path");
const CracoLessPlugin = require("./craco-less");
const {
  applyCracoConfigPlugins,
  applyWebpackConfigPlugins
} = require("@craco/craco/lib/features/plugins");

const clone = require("clone");

const { craPaths, loadWebpackProdConfig } = require("@craco/craco/lib/cra");

const context = { env: "production", paths: craPaths };

let webpackConfig;
let originalWebpackConfig;
beforeEach(() => {
  if (!originalWebpackConfig) {
    process.env.NODE_ENV = "production";
    originalWebpackConfig = loadWebpackProdConfig({
      reactScriptsVersion: "react-scripts"
    });
    process.env.NODE_ENV = "test";
  }
  CracoLessPlugin.pathSep = path.sep;

  // loadWebpackProdConfig() caches the config internally, so we need to
  // deep clone the object before each test.
  webpackConfig = clone(originalWebpackConfig);
});

const applyCracoConfigAndOverrideWebpack = cracoConfig => {
  cracoConfig = applyCracoConfigPlugins(cracoConfig, context);
  webpackConfig = applyWebpackConfigPlugins(
    cracoConfig,
    webpackConfig,
    context
  );
};

test("the webpack config is modified correctly without any options", () => {
  applyCracoConfigAndOverrideWebpack({
    plugins: [{ plugin: CracoLessPlugin }]
  });
  const oneOfRule = webpackConfig.module.rules.find(r => r.oneOf);
  expect(oneOfRule).not.toBeUndefined();
  const lessRule = oneOfRule.oneOf.find(
    r => r.test && r.test.toString() === "/\\.less$/"
  );
  expect(lessRule).not.toBeUndefined();
  expect(lessRule.use[0].loader).toContain(
    `${path.sep}mini-css-extract-plugin`
  );
  expect(lessRule.use[0].options).toEqual({});

  expect(lessRule.use[1].loader).toContain(`${path.sep}css-loader`);
  expect(lessRule.use[1].options).toEqual({
    importLoaders: 2,
    sourceMap: true
  });

  expect(lessRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessRule.use[2].options.ident).toEqual("postcss");
  expect(lessRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessRule.use[3].loader).toContain(`${path.sep}resolve-url-loader`);
  expect(lessRule.use[3].options).toEqual({ sourceMap: true });

  expect(lessRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessRule.use[4].options).toEqual({
    sourceMap: true
  });
});

test("the webpack config is modified correctly without any options on Windows", () => {
  CracoLessPlugin.pathSep = "\\";

  // Windows uses "\" path separators.
  // Note: This is a noop when running tests on Windows.
  const replaceSlashesInLoader = rule => {
    if (typeof rule === "string") {
      return rule.replace(/\//g, "\\");
    } else if (rule.loader) {
      if (typeof rule.loader === "string") {
        // Ignore file-loader, because we use loaderByName from craco.
        if (rule.loader.includes(`${path.sep}file-loader${path.sep}`))
          return rule;
        rule.loader = rule.loader.replace(/\//g, "\\");
      } else {
        rule.loader = rule.loader.map(replaceSlashesInLoader);
      }
    } else if (rule.use) {
      rule.use = rule.use.map(replaceSlashesInLoader);
    }
    return rule;
  };
  webpackConfig.module.rules[2].oneOf = webpackConfig.module.rules[2].oneOf.map(
    replaceSlashesInLoader
  );

  applyCracoConfigAndOverrideWebpack({
    plugins: [{ plugin: CracoLessPlugin }]
  });
  const oneOfRule = webpackConfig.module.rules.find(r => r.oneOf);
  expect(oneOfRule).not.toBeUndefined();
  const lessRule = oneOfRule.oneOf.find(
    r => r.test && r.test.toString() === "/\\.less$/"
  );
  expect(lessRule).not.toBeUndefined();
  expect(lessRule.use[0].loader).toContain("\\mini-css-extract-plugin");
  expect(lessRule.use[0].options).toEqual({});

  expect(lessRule.use[1].loader).toContain("\\css-loader");
  expect(lessRule.use[1].options).toEqual({
    importLoaders: 2,
    sourceMap: true
  });

  expect(lessRule.use[2].loader).toContain("\\postcss-loader");
  expect(lessRule.use[2].options.ident).toEqual("postcss");
  expect(lessRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessRule.use[3].loader).toContain(`\\resolve-url-loader`);
  expect(lessRule.use[3].options).toEqual({ sourceMap: true });

  // We use `require.resolve("less-loader")`, so it's a forward slash here
  expect(lessRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessRule.use[4].options).toEqual({ sourceMap: true });
});

test("the webpack config is modified correctly with less-loader options", () => {
  applyCracoConfigAndOverrideWebpack({
    plugins: [
      {
        plugin: CracoLessPlugin,
        options: {
          lessLoaderOptions: {
            modifyVars: {
              "@less-variable": "#fff"
            },
            javascriptEnabled: true
          }
        }
      }
    ]
  });

  const oneOfRule = webpackConfig.module.rules.find(r => r.oneOf);
  expect(oneOfRule).not.toBeUndefined();
  const lessRule = oneOfRule.oneOf.find(
    r => r.test && r.test.toString() === "/\\.less$/"
  );
  expect(lessRule).not.toBeUndefined();

  expect(lessRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessRule.use[2].options.ident).toEqual("postcss");
  expect(lessRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessRule.use[3].loader).toContain(`${path.sep}resolve-url-loader`);
  expect(lessRule.use[3].options).toEqual({ sourceMap: true });

  expect(lessRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessRule.use[4].options).toEqual({
    javascriptEnabled: true,
    modifyVars: {
      "@less-variable": "#fff"
    },
    sourceMap: true
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
              "@less-variable": "#fff"
            },
            javascriptEnabled: true
          },
          cssLoaderOptions: {
            modules: true,
            localIdentName: "[local]_[hash:base64:5]"
          },
          postcssLoaderOptions: {
            ident: "test-ident"
          },
          styleLoaderOptions: {
            sourceMaps: true
          },
          miniCssExtractPluginOptions: {
            testOption: "test-value"
          }
        }
      }
    ]
  });

  const oneOfRule = webpackConfig.module.rules.find(r => r.oneOf);
  expect(oneOfRule).not.toBeUndefined();
  const lessRule = oneOfRule.oneOf.find(
    r => r.test && r.test.toString() === "/\\.less$/"
  );
  expect(lessRule).not.toBeUndefined();
  expect(lessRule.use[0].loader).toContain(
    `${path.sep}mini-css-extract-plugin`
  );
  expect(lessRule.use[0].options).toEqual({
    testOption: "test-value"
  });

  expect(lessRule.use[1].loader).toContain(`${path.sep}css-loader`);
  expect(lessRule.use[1].options).toEqual({
    modules: true,
    importLoaders: 2,
    localIdentName: "[local]_[hash:base64:5]",
    sourceMap: true
  });

  expect(lessRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessRule.use[2].options.ident).toEqual("test-ident");
  expect(lessRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessRule.use[3].loader).toContain(`${path.sep}resolve-url-loader`);
  expect(lessRule.use[3].options).toEqual({ sourceMap: true });

  expect(lessRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessRule.use[4].options).toEqual({
    javascriptEnabled: true,
    modifyVars: {
      "@less-variable": "#fff"
    },
    sourceMap: true
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
          }
        }
      }
    ]
  });

  const oneOfRule = webpackConfig.module.rules.find(r => r.oneOf);
  expect(oneOfRule).not.toBeUndefined();
  const lessRule = oneOfRule.oneOf.find(
    r => r.test && r.test.toString() === "/\\.less$/"
  );
  expect(lessRule).not.toBeUndefined();

  expect(lessRule.use[0].loader).toContain(
    `${path.sep}mini-css-extract-plugin`
  );
  expect(lessRule.use[0].options.testOption).toEqual("test-value-production");

  expect(lessRule.use[2].loader).toContain(`${path.sep}postcss-loader`);
  expect(lessRule.use[2].options.ident).toEqual("postcss");
  expect(lessRule.use[2].options.plugins).not.toBeUndefined();

  expect(lessRule.use[3].loader).toContain(`${path.sep}resolve-url-loader`);
  expect(lessRule.use[3].options).toEqual({ sourceMap: true });

  expect(lessRule.use[4].loader).toContain(`${path.sep}less-loader`);
  expect(lessRule.use[4].options).toEqual({
    sourceMap: true
  });
});

test("throws an error when we can't find file-loader in the webpack config", () => {
  let oneOfRule = webpackConfig.module.rules.find(r => r.oneOf);
  oneOfRule.oneOf = oneOfRule.oneOf.filter(
    r => !(r.loader && r.loader.includes("file-loader"))
  );

  const runTest = () => {
    applyCracoConfigAndOverrideWebpack({
      plugins: [{ plugin: CracoLessPlugin }]
    });
  };

  expect(runTest).toThrowError(
    "Can't find file-loader in the production webpack config!\n\n" +
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
  let oneOfRule = webpackConfig.module.rules.find(r => r.oneOf);
  oneOfRule.oneOf = null;

  const runTest = () => {
    applyCracoConfigAndOverrideWebpack({
      plugins: [{ plugin: CracoLessPlugin }]
    });
  };

  expect(runTest).toThrowError(
    "Can't find a 'oneOf' rule under module.rules in the production webpack config!\n\n" +
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

test("throws an error when react-scripts adds an unknown webpack rule", () => {
  let oneOfRule = webpackConfig.module.rules.find(r => r.oneOf);
  const sassRule = oneOfRule.oneOf.find(rule =>
    rule.test.toString().includes("scss|sass")
  );
  sassRule.use.push({
    loader: "/path/to/unknown-loader/index.js"
  });
  const runTest = () => {
    applyCracoConfigAndOverrideWebpack({
      plugins: [{ plugin: CracoLessPlugin }]
    });
  };
  expect(runTest).toThrowError(
    new RegExp(
      "Found an unhandled loader in the production webpack config: " +
        "/path/to/unknown-loader/index.js"
    )
  );
});

test("throws an error when the sass rule is missing", () => {
  let oneOfRule = webpackConfig.module.rules.find(r => r.oneOf);
  oneOfRule.oneOf = oneOfRule.oneOf.filter(
    rule => !(rule.test && rule.test.toString().includes("scss|sass"))
  );
  const runTest = () => {
    applyCracoConfigAndOverrideWebpack({
      plugins: [{ plugin: CracoLessPlugin }]
    });
  };
  expect(runTest).toThrowError(
    new RegExp(
      "Can't find the webpack rule to match scss/sass files in the " +
        "production webpack config!"
    )
  );
});

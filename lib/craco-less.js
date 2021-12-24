const path = require("path");
const { deepClone, styleRuleByName } = require("./utils");

const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

const overrideWebpackConfig = ({ context, webpackConfig, pluginOptions }) => {
  const { loaderByName, throwUnexpectedConfigError } = require("@craco/craco");

  // This is mocked in Windows tests
  const pathSep = module.exports.pathSep;

  const throwError = (message, githubIssueQuery) =>
    throwUnexpectedConfigError({
      packageName: "craco-less",
      githubRepo: "DocSpring/craco-less",
      message,
      githubIssueQuery,
    });

  pluginOptions = pluginOptions || {};

  const createLessRule = ({ baseRule, overrideRule }) => {
    baseRule = deepClone(baseRule);
    let lessRule = {
      ...baseRule,
      ...overrideRule,
      use: [],
    };

    const loaders = baseRule.use;
    loaders.forEach((ruleOrLoader) => {
      let rule;
      if (typeof ruleOrLoader === "string") {
        rule = {
          loader: ruleOrLoader,
          options: {},
        };
      } else {
        rule = ruleOrLoader;
      }

      if (
        (context.env === "development" || context.env === "test") &&
        rule.loader.includes(`${pathSep}style-loader${pathSep}`)
      ) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            ...(pluginOptions.styleLoaderOptions || {}),
          },
        });
      } else if (rule.loader.includes(`${pathSep}css-loader${pathSep}`)) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            ...(pluginOptions.cssLoaderOptions || {}),
          },
        });
      } else if (rule.loader.includes(`${pathSep}postcss-loader${pathSep}`)) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            postcssOptions: {
              ...rule.options.postcssOptions,
              ...(pluginOptions.postcssLoaderOptions || {}),
            },
          },
        });
      } else if (
        rule.loader.includes(`${pathSep}resolve-url-loader${pathSep}`)
      ) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            ...(pluginOptions.resolveUrlLoaderOptions || {}),
          },
        });
      } else if (
        context.env === "production" &&
        rule.loader.includes(`${pathSep}mini-css-extract-plugin${pathSep}`)
      ) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            ...(pluginOptions.miniCssExtractPluginOptions || {}),
          },
        });
      } else if (rule.loader.includes(`${pathSep}sass-loader${pathSep}`)) {
        lessRule.use.push({
          loader: require.resolve("less-loader"),
          options: {
            ...rule.options,
            ...pluginOptions.lessLoaderOptions,
          },
        });
      } else {
        throwError(
          `Found an unhandled loader in the ${context.env} webpack config: ${rule.loader}`,
          "webpack+unknown+rule"
        );
      }
    });

    return lessRule;
  };

  const oneOfRule = webpackConfig.module.rules.find((rule) => rule.oneOf);
  if (!oneOfRule) {
    throwError(
      "Can't find a 'oneOf' rule under module.rules in the " +
        `${context.env} webpack config!`,
      "webpack+rules+oneOf"
    );
  }

  const sassRule = oneOfRule.oneOf.find(styleRuleByName("scss|sass", false));
  if (!sassRule) {
    throwError(
      "Can't find the webpack rule to match scss/sass files in the " +
        `${context.env} webpack config!`,
      "webpack+rules+scss+sass"
    );
  }
  let lessRule = createLessRule({
    baseRule: sassRule,
    overrideRule: {
      test: lessRegex,
      exclude: lessModuleRegex,
    },
  });

  if (pluginOptions.modifyLessRule) {
    lessRule = pluginOptions.modifyLessRule(lessRule, context);
  }

  const sassModuleRule = oneOfRule.oneOf.find(
    styleRuleByName("scss|sass", true)
  );
  if (!sassModuleRule) {
    throwError(
      "Can't find the webpack rule to match scss/sass module files in the " +
        `${context.env} webpack config!`,
      "webpack+rules+scss+sass"
    );
  }
  let lessModuleRule = createLessRule({
    baseRule: sassModuleRule,
    overrideRule: {
      test: lessModuleRegex,
    },
  });

  if (pluginOptions.modifyLessModuleRule) {
    lessModuleRule = pluginOptions.modifyLessModuleRule(
      lessModuleRule,
      context
    );
  }

  // https://github.com/facebook/create-react-app/blob/9673858a3715287c40aef9e800c431c7d45c05a2/packages/react-scripts/config/webpack.config.js#L590-L596
  // insert less loader before resource loader
  // https://webpack.js.org/guides/asset-modules/
  const resourceLoaderIndex = oneOfRule.oneOf.findIndex(
    ({ type }) => type === "asset/resource"
  );
  oneOfRule.oneOf.splice(resourceLoaderIndex, 0, lessRule, lessModuleRule);

  return webpackConfig;
};

// pathSep is mocked in Windows tests
module.exports = {
  overrideWebpackConfig,
  pathSep: path.sep,
};

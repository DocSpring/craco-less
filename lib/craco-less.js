const path = require("path");
const { deepClone, styleRuleByName } = require("./utils");
const { throwUnexpectedConfigError } = require("@craco/craco");

const lessRegex = /\.less$/;
const lessModuleRegex = /\.module\.less$/;

const loaderRegexMap = {
  "style-loader": /[\\/]style-loader[\\/]/,
  "css-loader": /[\\/]css-loader[\\/]/,
  "postcss-loader": /[\\/]postcss-loader[\\/]/,
  "resolve-url-loader": /[\\/]resolve-url-loader[\\/]/,
  "mini-css-extract-plugin": /[\\/]mini-css-extract-plugin[\\/]/,
  "sass-loader": /[\\/]sass-loader[\\/]/,
};

const hasLoader = (loaderName, ruleLoader) =>
  loaderRegexMap[loaderName].test(ruleLoader);

const throwError = (message, githubIssueQuery) =>
  throwUnexpectedConfigError({
    packageName: "craco-less",
    githubRepo: "DocSpring/craco-less",
    message,
    githubIssueQuery,
  });

const overrideWebpackConfig = ({ context, webpackConfig, pluginOptions }) => {
  pluginOptions = pluginOptions || {};

  const createLessRule = ({ baseRule, overrideRule }) => {
    baseRule = deepClone(baseRule);
    const lessRule = {
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
        hasLoader("style-loader", rule.loader)
      ) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            ...(pluginOptions.styleLoaderOptions || {}),
          },
        });
      } else if (hasLoader("css-loader", rule.loader)) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            ...(pluginOptions.cssLoaderOptions || {}),
          },
        });
      } else if (hasLoader("postcss-loader", rule.loader)) {
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
      } else if (hasLoader("resolve-url-loader", rule.loader)) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            ...(pluginOptions.resolveUrlLoaderOptions || {}),
          },
        });
      } else if (
        context.env === "production" &&
        hasLoader("mini-css-extract-plugin", rule.loader)
      ) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            ...(pluginOptions.miniCssExtractPluginOptions || {}),
          },
        });
      } else if (hasLoader("sass-loader", rule.loader)) {
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
          "webpack+unknown+rule",
        );
      }
    });

    return lessRule;
  };

  const oneOfRule = webpackConfig.module.rules.find((rule) => rule.oneOf);
  if (!oneOfRule) {
    throwError(
      `Can't find a 'oneOf' rule under module.rules in the ${context.env} webpack config!`,
      "webpack+rules+oneOf",
    );
  }

  const sassRule = oneOfRule.oneOf.find(styleRuleByName("scss|sass", false));
  if (!sassRule) {
    throwError(
      `Can't find the webpack rule to match scss/sass files in the ${context.env} webpack config!`,
      "webpack+rules+scss+sass",
    );
  }

  let lessRule = createLessRule({
    context,
    baseRule: sassRule,
    overrideRule: {
      test: lessRegex,
      exclude: lessModuleRegex,
    },
    pluginOptions,
    pathSep,
  });

  if (pluginOptions.modifyLessRule) {
    lessRule = pluginOptions.modifyLessRule(lessRule, context);
  }

  const sassModuleRule = oneOfRule.oneOf.find(
    styleRuleByName("scss|sass", true),
  );
  if (!sassModuleRule) {
    throwError(
      `Can't find the webpack rule to match scss/sass module files in the ${context.env} webpack config!`,
      "webpack+rules+scss+sass",
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
      context,
    );
  }

  // https://github.com/facebook/create-react-app/blob/9673858a3715287c40aef9e800c431c7d45c05a2/packages/react-scripts/config/webpack.config.js#L590-L596
  // insert less loader before resource loader
  // https://webpack.js.org/guides/asset-modules/
  const resourceLoaderIndex = oneOfRule.oneOf.findIndex(
    ({ type }) => type === "asset/resource",
  );
  oneOfRule.oneOf.splice(resourceLoaderIndex, 0, lessRule, lessModuleRule);

  return webpackConfig;
};

const overrideJestConfig = ({ context, jestConfig }) => {
  const moduleNameMapper = jestConfig.moduleNameMapper;
  const cssModulesPattern = Object.keys(moduleNameMapper).find((p) =>
    p.match(/\\\.module\\\.\(.*?css.*?\)/),
  );

  if (!cssModulesPattern) {
    throwError(
      `Can't find CSS Modules pattern under moduleNameMapper in the ${context.env} jest config!`,
      "jest+moduleNameMapper+css",
    );
  }

  moduleNameMapper[cssModulesPattern.replace("css", "css|less")] =
    moduleNameMapper[cssModulesPattern];
  delete moduleNameMapper[cssModulesPattern];

  const transformIgnorePatterns = jestConfig.transformIgnorePatterns;
  const cssModulesPatternIndex = transformIgnorePatterns.findIndex((p) =>
    p.match(/\\\.module\\\.\(.*?css.*?\)/),
  );
  if (cssModulesPatternIndex === -1) {
    throwError(
      `Can't find CSS Modules pattern under transformIgnorePatterns in the ${context.env} jest config!`,
      "jest+transformIgnorePatterns+css",
    );
  }

  transformIgnorePatterns[cssModulesPatternIndex] = transformIgnorePatterns[
    cssModulesPatternIndex
  ].replace("css", "css|less");

  return jestConfig;
};

// pathSep is mocked in Windows tests
module.exports = {
  overrideWebpackConfig,
  overrideJestConfig,
  pathSep: path.sep,
};

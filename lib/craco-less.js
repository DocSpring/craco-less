module.exports = {
  overrideWebpackConfig: ({ context, webpackConfig, pluginOptions }) => {
    const {
      getLoader,
      loaderByName,
      throwUnexpectedConfigError
    } = require("@craco/craco");

    const throwError = (message, githubIssueQuery) =>
      throwUnexpectedConfigError({
        packageName: "craco-less",
        githubRepo: "FormAPI/craco-less",
        message,
        githubIssueQuery
      });

    const lessExtension = /\.less$/;

    pluginOptions = pluginOptions || {};

    const oneOfRule = webpackConfig.module.rules.find(rule => rule.oneOf);
    if (!oneOfRule) {
      throwError(
        "Can't find a 'oneOf' rule under module.rules in the " +
          `${context.env} webpack config!`,
        "webpack+rules+oneOf"
      );
    }

    const sassRule = oneOfRule.oneOf.find(
      rule => rule.test && rule.test.toString().includes("scss|sass")
    );
    if (!sassRule) {
      throwError(
        "Can't find the webpack rule to match scss/sass files in the " +
          `${context.env} webpack config!`,
        "webpack+rules+scss+sass"
      );
    }
    let lessRule = {
      exclude: /\.module\.(less)$/,
      test: lessExtension,
      use: []
    };

    const loaders =
      context.env === "production" ? sassRule.loader : sassRule.use;

    loaders.forEach(ruleOrLoader => {
      let rule;
      if (typeof ruleOrLoader === "string") {
        rule = {
          loader: ruleOrLoader,
          options: {}
        };
      } else {
        rule = ruleOrLoader;
      }

      if (
        context.env === "development" &&
        rule.loader.includes("/style-loader/")
      ) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            ...(pluginOptions.styleLoaderOptions || {})
          }
        });
      } else if (rule.loader.includes("/css-loader/")) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            ...(pluginOptions.cssLoaderOptions || {})
          }
        });
      } else if (rule.loader.includes("/postcss-loader/")) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            ...(pluginOptions.postcssLoaderOptions || {})
          }
        });
      } else if (
        context.env === "production" &&
        rule.loader.includes("/mini-css-extract-plugin/")
      ) {
        lessRule.use.push({
          loader: rule.loader,
          options: {
            ...rule.options,
            ...(pluginOptions.miniCssExtractPluginOptions || {})
          }
        });
      } else if (rule.loader.includes("/sass-loader/")) {
        const defaultLessLoaderOptions =
          context.env === "production" ? { sourceMap: true } : {};
        lessRule.use.push({
          loader: require.resolve("less-loader"),
          options: {
            ...defaultLessLoaderOptions,
            ...pluginOptions.lessLoaderOptions
          }
        });
      } else {
        throwError(
          `Found an unhandled loader in the ${
            context.env
          } webpack config: ${loader}`,
          "webpack+unknown+rule"
        );
      }
    });

    if (pluginOptions.modifyLessRule) {
      lessRule = pluginOptions.modifyLessRule(lessRule, context);
    }
    oneOfRule.oneOf.push(lessRule);

    const { isFound, match: fileLoaderMatch } = getLoader(
      webpackConfig,
      loaderByName("file-loader")
    );
    if (!isFound) {
      throwError(
        `Can't find file-loader in the ${context.env} webpack config!`,
        "webpack+file-loader"
      );
    }
    fileLoaderMatch.loader.exclude.push(lessExtension);

    return webpackConfig;
  }
};

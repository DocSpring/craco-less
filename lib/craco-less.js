module.exports = {
  overrideWebpackConfig: ({ webpackConfig, pluginOptions }) => {
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

    const lessRule = {
      test: lessExtension,
      use: [
        {
          loader: require.resolve("style-loader"),
          options: pluginOptions.styleLoaderOptions || {}
        },
        {
          loader: require.resolve("css-loader"),
          options: pluginOptions.cssLoaderOptions || {}
        },
        {
          loader: require.resolve("less-loader"),
          options: pluginOptions.lessLoaderOptions || {}
        }
      ]
    };

    const oneOfRule = webpackConfig.module.rules.find(rule => rule.oneOf);
    if (!oneOfRule) {
      throwError(
        "Can't find a 'oneOf' rule under module.rules in the webpack config!",
        "webpack+rules+oneOf"
      );
    }
    oneOfRule.oneOf.push(lessRule);

    const { isFound, match: fileLoaderMatch } = getLoader(
      webpackConfig,
      loaderByName("file-loader")
    );
    if (!isFound) {
      throwError(
        "Can't find file-loader in the webpack config!",
        "webpack+file-loader"
      );
    }
    fileLoaderMatch.loader.exclude.push(lessExtension);

    return webpackConfig;
  }
};

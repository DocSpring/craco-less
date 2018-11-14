const gitHubIssueUrl = (repo, query) =>
  `https://github.com/${repo}/issues${query ? `?q=is%3Aissue+${query}` : ""}`;

const throwInvalidConfigError = ({ message, gitHubIssueQuery: query }) => {
  throw new Error(
    `${message}\n\n` +
      "This error probably occurred because you updated react-scripts or craco. " +
      "Please try updating craco-less to the latest version:\n\n" +
      "   $ yarn upgrade craco-less\n\nOr:\n\n" +
      "   $ npm update craco-less\n\n" +
      "If that doesn't work, craco-less needs to be fixed to support the latest version.\n" +
      "Please check to see if there's already an issue in the FormAPI/craco-less repo:\n\n" +
      `   * ${gitHubIssueUrl("FormAPI/craco-less", query)}\n\n` +
      "If not, please open an issue and we'll take a look. (Or you can send a PR!)\n\n" +
      "You might also want to look for related issues in the " +
      "craco and create-react-app repos:\n\n" +
      `   * ${gitHubIssueUrl("sharegate/craco", query)}\n` +
      `   * ${gitHubIssueUrl("facebook/create-react-app", query)}\n`
  );
};

module.exports = {
  overrideWebpackConfig: ({ webpackConfig, pluginOptions }) => {
    const lessExtension = /\.less$/;

    const lessRule = {
      test: lessExtension,
      use: [
        {
          loader: require.resolve("style-loader")
        },
        {
          loader: require.resolve("css-loader")
        },
        {
          loader: require.resolve("less-loader"),
          options: pluginOptions || {}
        }
      ]
    };

    const oneOfRule = webpackConfig.module.rules.find(rule => rule.oneOf);
    if (!oneOfRule) {
      throwInvalidConfigError({
        message:
          "Can't find a 'oneOf' rule under module.rules in the webpack config!",
        gitHubIssueQuery: "webpack+rules+oneOf"
      });
    }
    oneOfRule.oneOf.push(lessRule);

    const { getLoader, loaderByName } = require("@craco/craco");
    const { isFound, match: fileLoaderMatch } = getLoader(
      webpackConfig,
      loaderByName("file-loader")
    );
    if (!isFound) {
      throwInvalidConfigError({
        message: "Can't find file-loader in the webpack config!",
        gitHubIssueQuery: "webpack+file-loader"
      });
    }
    fileLoaderMatch.loader.exclude.push(lessExtension);

    return webpackConfig;
  }
};

[![Build Status](https://travis-ci.org/FormAPI/craco-less.svg?branch=master)](https://travis-ci.org/FormAPI/craco-less)
[![Coverage Status](https://coveralls.io/repos/github/FormAPI/craco-less/badge.svg?branch=master)](https://coveralls.io/github/FormAPI/craco-less?branch=master)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

# Craco Less Plugin

This is a [craco](https://github.com/sharegate/craco) plugin that adds Less support to [create-react-app](https://facebook.github.io/create-react-app/) version >= 2.

> Use [react-app-rewired](https://github.com/timarney/react-app-rewired) for `create-react-app` version 1.

### Ant Design

If you want to use [Ant Design](https://ant.design/) with `create-react-app`,
you should use the [`craco-antd`](https://github.com/FormAPI/craco-antd) plugin.
`craco-antd` includes Less, and `babel-plugin-import` to only include the required CSS. It also makes it easy to customize the theme variables.

### Supported Versions

`craco-less` is tested with:

- `react-scripts`: `^2.1.1`
- `@craco/craco`: `^2.2.3`

### Installation

First, follow the [`craco` Installation Instructions](https://github.com/sharegate/craco/blob/master/packages/craco/README.md##installation) to install the `craco` package, create a `craco.config.js` file, and modify the scripts in your `package.json`.

Then install `craco-less`:

```bash
$ yarn add craco-less

# Or

$ npm i -S craco-less
```

### Usage

Here is a complete `craco.config.js` configuration file that adds Less compilation to `create-react-app`:

```js
const CracoLessPlugin = require("craco-less");

module.exports = {
  plugins: [{ plugin: CracoLessPlugin }]
};
```

Pass an `options` object to configure the `less-loader` options:

```js
const CracoLessPlugin = require("craco-less");

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        modifyVars: {
          "@primary-color": "#1DA57A",
          "@link-color": "#1DA57A",
          "@border-radius-base": "2px"
        },
        javascriptEnabled: true
      }
    }
  ]
};
```

> [View the less-loader Documentation](https://webpack.js.org/loaders/less-loader/).

If you need to configure anything else for the webpack build, take a look at the
[Configuration Overview section in the `craco` README](https://github.com/sharegate/craco/blob/master/packages/craco/README.md#configuration-overview). You can use `CracoLessPlugin` while making other changes to `babel` and `webpack`, etc.

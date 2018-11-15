[![Build Status](https://travis-ci.org/FormAPI/craco-less.svg?branch=master)](https://travis-ci.org/FormAPI/craco-less)
[![Coverage Status](https://coveralls.io/repos/github/FormAPI/craco-less/badge.svg?branch=master)](https://coveralls.io/github/FormAPI/craco-less?branch=master)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

# Craco Less Plugin

This is a [craco](https://github.com/sharegate/craco) plugin that adds Less support to [create-react-app](https://facebook.github.io/create-react-app/) version >= 2.

> Use [react-app-rewired](https://github.com/timarney/react-app-rewired) for `create-react-app` version 1.

## Ant Design

If you want to use [Ant Design](https://ant.design/) with `create-react-app`,
you should use the [`craco-antd`](https://github.com/FormAPI/craco-antd) plugin.
`craco-antd` includes Less and `babel-plugin-import` (to only include the required CSS.) It also makes it easy to customize the theme variables.

## Supported Versions

`craco-less` is tested with:

- `react-scripts`: `^2.1.1`
- `@craco/craco`: `^2.4.0`

## Installation

First, follow the [`craco` Installation Instructions](https://github.com/sharegate/craco/blob/master/packages/craco/README.md##installation) to install the `craco` package, create a `craco.config.js` file, and modify the scripts in your `package.json`.

Then install `craco-less`:

```bash
$ yarn add craco-less

# OR

$ npm i -S craco-less
```

## Usage

Here is a complete `craco.config.js` configuration file that adds Less compilation to `create-react-app`:

```js
const CracoLessPlugin = require("craco-less");

module.exports = {
  plugins: [{ plugin: CracoLessPlugin }]
};
```

## Configuration

You can pass an `options` object to configure `style-loader`, `css-loader`, and `less-loader`:

- `options.styleLoaderOptions`
  - [View the `style-loader` options](https://webpack.js.org/loaders/style-loader/#options)
- `options.cssLoaderOptions`
  - [View the `css-loader` options](https://webpack.js.org/loaders/css-loader/#options)
- `options.lessLoaderOptions`
  - [View the `less-loader` documentation](https://webpack.js.org/loaders/less-loader/)
  - [View the Less options](http://lesscss.org/usage/#less-options)
    - You must use "camelCase" instead of "dash-case", e.g. `--source-map` => `sourceMap`

For example, to configure `less-loader`:

```js
const CracoLessPlugin = require("craco-less");

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          modifyVars: {
            "@primary-color": "#1DA57A",
            "@link-color": "#1DA57A",
            "@border-radius-base": "2px"
          },
          javascriptEnabled: true
        }
      }
    }
  ]
};
```

## CSS Modules

You can configure the [`css-loader` options](https://webpack.js.org/loaders/css-loader/#options) to set up CSS modules. For example:

```js
const CracoLessPlugin = require("craco-less");

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        cssLoaderOptions: {
          modules: true,
          localIdentName: "[local]_[hash:base64:5]"
        }
      }
    }
  ]
};
```

> [View the `css-loader` options](https://webpack.js.org/loaders/style-loader/#options)

#### CSS modules gotcha

There is a known problem with Less and [CSS modules](https://github.com/css-modules/css-modules) regarding relative file paths in `url(...)` statements. [See this issue for an explanation.](https://github.com/webpack-contrib/less-loader/issues/109#issuecomment-253797335)

> ([Copied from the less-loader README](https://github.com/webpack-contrib/less-loader#css-modules-gotcha).)

## Further Configuration

If you need to configure anything else for the webpack build, take a look at the
[Configuration Overview section in the `craco` README](https://github.com/sharegate/craco/blob/master/packages/craco/README.md#configuration-overview). You can use `CracoLessPlugin` while making other changes to `babel` and `webpack`, etc.

## Contributing

Install dependencies:

```bash
$ yarn install

# OR

$ npm install
```

Run tests:

```
$ yarn test
```

Before submitting a pull request, please check the following:

- All tests are passing
  - Run `yarn test`
- 100% test coverage
  - Coverage will be printed after running tests.
  - Open the coverage results in your browser: `open coverage/lcov-report/index.html`
- All code is formatted with [Prettier](https://prettier.io/)
  - Run `prettier --write **/*.js`
  - If you use VS Code, I recommend enabling the `formatOnSave` option.

## License

[MIT](./LICENSE)

const { mapValues, deepClone } = require("./utils");

test("the object's values are mapped correctly", () => {
  const oldObject = { a: 2, b: 3, c: 4 };
  const newObject = mapValues(oldObject, (k) => k * k);

  expect(newObject).toEqual({ a: 4, b: 9, c: 16 });

  newObject.a = 3;
  expect(newObject).toEqual({ a: 3, b: 9, c: 16 });
  expect(oldObject).toEqual({ a: 2, b: 3, c: 4 });
});

test("the new configuration is a copy of the old one", () => {
  const cssLoaderGetLocalIdent = () => "";
  const postcssLoaderPlugins = function () {};

  const oldConfig = {
    test: /\.module\.less$/,
    use: [
      "style-loader",
      {
        loader: "css-loader",
        options: {
          sourceMaps: true,
          modules: { getLocalIdent: cssLoaderGetLocalIdent },
        },
      },
      {
        loader: "postcss-loader",
        options: { plugins: postcssLoaderPlugins },
      },
    ],
  };
  const newConfig = deepClone(oldConfig);

  expect(newConfig).toEqual(oldConfig);

  newConfig.use[0] = { loader: "style-loader", options: {} };

  newConfig.use[1].options.sourceMaps = false;
  newConfig.use[1].options.modules.getLocalIdent = "test";

  expect(newConfig.use[0]).toEqual({ loader: "style-loader", options: {} });
  expect(newConfig.use[1].options).toEqual({
    sourceMaps: false,
    modules: { getLocalIdent: "test" },
  });

  expect(oldConfig.use[0]).toEqual("style-loader");
  expect(oldConfig.use[1].options).toEqual({
    sourceMaps: true,
    modules: { getLocalIdent: cssLoaderGetLocalIdent },
  });
});

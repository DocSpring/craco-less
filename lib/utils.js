const mapValues = (object, callback) => {
  const O = {};
  for (let key in object) {
    O[key] = callback(object[key]);
  }
  return O;
};

const deepClone = (value) => {
  switch (value.constructor) {
    case Array:
      return value.map(deepClone);
    case Object:
      return mapValues(value, deepClone);
    default:
      return value;
  }
};

const styleRuleByName = (name, module) => {
  return (rule) => {
    if (rule.test) {
      const test = rule.test.toString();

      const includeName = test.includes(name);
      const includeModule = test.includes("module");

      return module
        ? includeName && includeModule
        : includeName && !includeModule;
    }

    return false;
  };
};

module.exports = {
  mapValues,
  deepClone,
  styleRuleByName,
};

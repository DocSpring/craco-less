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

module.exports = {
  mapValues,
  deepClone,
};

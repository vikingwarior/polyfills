/** Map polyfill */
Array.prototype.myMap = function (callback, thisArg) {
  if (this === null || undefined)
    throw new TypeError(`${this} is an invalid argument`);
  if (typeof callback !== "function")
    throw new TypeError(`${callback} is not a function`);

  let newArr = [];
  for (let i = 0; i < this.length; i++) {
    this.hasOwnProperty(i) &&
      newArr.push(callback.call(thisArg, this[i], i, this));
  }

  console.log("MyMap Array:" + newArr);
  return newArr;
};

/** Filter polyfill */
Array.prototype.myFilter = function (callback, thisArg) {
  if (this === null || undefined)
    throw new TypeError(`${this} is an invalid argument`);
  if (typeof callback !== "function")
    throw new TypeError(`${callback} is not a function`);

  let newArr = [];
  for (let index = 0; index < this.length; index++) {
    index in this &&
      callback.call(thisArg, this[index], index, this) &&
      newArr.push(this[index]);
  }

  console.log("MyFilter Array: " + newArr);
  return newArr;
};

/** Reduce polyfill */
// arr.reduce((accumulator, currentValue, index, array) => {}, initialValue)

Array.prototype.myReduce = function (callback, initialValue) {
  if (this === null || this === undefined)
    throw new TypeError(`${this} is an invalid argument`);
  if (typeof callback !== "function")
    throw new TypeError(`${callback} is not a function`);

  const obj = Object(this);
  let i = 0,
    len = obj.length,
    accumulator;

  if (arguments.length >= 2) {
    accumulator = initialValue;
  } else {
    for (; i < len && !(i in obj); i++) {}
    if (i >= len)
      throw new TypeError("Reduce of Empty array and no initialValue");
    accumulator = obj[i++];
  }
  for (; i < len; i++) {
    if (i in obj) accumulator = callback(accumulator, obj[i], i, obj);
  }

  console.log("MyReduce ans: " + newArr);
  return accumulator;
};
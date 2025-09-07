const test = function (gender, place) {
  console.log(
    `Name:${this.name}\nAge:${this.age}\nGender:${gender}\nCity:${place}`
  );
};

const me = {
  name: "Baburao Apte",
  age: "69",
};

// test.myBind(me, "M", "Ratnagiri")();

/** Call polyfill */
Function.prototype.myCall = function (closure, ...args) {
  if (closure === null || closure === undefined)
    throw new TypeError("Invalid context to call the method");

  let context = Object(closure);

  const fnSymbol = Symbol();  
  context[fnSymbol] = this;
  const res = context.fnSymbol(...args);
  delete context[fnSymbol];

  return res;
};

// test.myCall(me, "M", "Ratnagiri");
/** Apply polyfill */
Function.prototype.myApply = function (closure, argsArr) {
  if (closure === null || closure === undefined)
    throw new TypeError("Invalid context to call the method");

  let context = Object(closure);

  const fnSymbol = Symbol();  
  context.fnSymbol = this;
  const res = context.fnSymbol(...argsArr);
  delete context[fnSymbol];

  return res;
};

/** Bind polyfill */
Function.prototype.myBind = function (closure, ...bindArgs) {
  const func = this;
  return function (...callbackArgs) {
    return func.apply(closure, [...bindArgs, ...callbackArgs]);
  };
};
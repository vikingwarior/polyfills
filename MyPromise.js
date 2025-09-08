const STATE = {
  PENDING: "pending",
  FULFILLED: "fulfilled",
  REJECTED: "rejected",
};

class MyPromise {
  // #identifier;
  #value;
  #state = STATE.PENDING;
  #onSuccessBind = this.#onSuccess.bind(this);
  #onFailBind = this.#onFail.bind(this);

  #thenCallbackChain = [];
  #catchCallbackChain = [];

  constructor(constructorCallback) {
    // this.#identifier = id;
    try {
      constructorCallback(this.#onSuccessBind, this.#onFailBind);
    } catch (e) {
      this.#onFail(e);
    }
  }

  static resolve(val) {
    return new MyPromise((res) => {
      res(val);
    });
  }

  static reject(val) {
    return new MyPromise((res, rej) => {
      rej(val);
    });
  }

  static all(promises) {
    const results = [];
    let completionCount = 0;
    const N = promises.length;

    return new MyPromise((resolve, reject) => {
      promises.forEach((promise) => {
        promise
          .then((val) => {
            results.push(val);
            completionCount++;

            if (completionCount === N) {
              resolve(results);
            }
          })
          .catch(reject);
      });
    });
  }

  static allSettled(promises) {
    const results = [];
    let completionCount = 0;
    const N = promises.length;

    return new MyPromise((resolve) => {
      promises.forEach((promise, idx) => {
        promise
          .then((value) => {
            results[idx] = { status: STATE.FULFILLED, value };
          })
          .catch((reason) => {
            results[idx] = { status: STATE.REJECTED, reason };
          })
          .finally(() => {
            completionCount++;
            if (completionCount === N) {
              resolve(results);
            }
          });
      });
    });
  }

  static race(promises) {
    return new MyPromise((resolve) => {
      promises.forEach((promise, idx) => {
        promise
          .then((value) => {
            resolve(value);
          })
          .catch((value) => {
            resolve(value);
          });
      });
    });
  }

  static any(promises) {
    let completionCount = 0;
    const N = promises.length;
    let errors = [];

    return new MyPromise((resolve, reject) => {
      promises.forEach((promise) => {
        promise
          .then(resolve)
          .catch((reason) => {
            errors.push(reason);
          })
          .finally(() => {
            completionCount++;
            if (completionCount === N) {
              reject(new AggregateError(errors));
            }
          });
      });
    });
  }

  #executeCallbackChain() {
    let arr;

    if (this.#state === STATE.FULFILLED) arr = this.#thenCallbackChain;
    else if (this.#state === STATE.REJECTED) arr = this.#catchCallbackChain;
    else return;

    while (arr && arr.length > 0) {
      arr.shift()(this.#value);
    }
  }

  #onSuccess(val) {
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return;

      if (val instanceof MyPromise) {
        val.then(this.#onSuccessBind, this.#onFailBind);
        return;
      }

      this.#value = val;
      this.#state = STATE.FULFILLED;
      this.#executeCallbackChain();
    });
  }

  #onFail(val) {
    queueMicrotask(() => {
      if (this.#state !== STATE.PENDING) return;

      if (val instanceof MyPromise) {
        val.then(this.#onSuccessBind, this.#onFailBind);
        return;
      }

      if (this.#catchCallbackChain.length === 0)
        throw new UncaughtPromiseError(val);

      this.#value = val;
      this.#state = STATE.REJECTED;
      this.#executeCallbackChain();
    });
  }

  then(thenCb, catchCb) {
    return new MyPromise((resolve, reject) => {
      this.#thenCallbackChain.push((result) => {
        if (thenCb == null) {
          resolve(result);
          return;
        }

        try {
          resolve(thenCb(result));
        } catch (e) {
          reject(e);
        }
      });

      this.#catchCallbackChain.push((result) => {
        if (catchCb == null) {
          reject(result);
          return;
        }

        try {
          resolve(catchCb(result));
        } catch (e) {
          reject(e);
        }
      });

      this.#executeCallbackChain();
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  finally(finallyCallback) {
    return this.then(
      (result) => {
        finallyCallback();
        return result;
      },
      (result) => {
        finallyCallback();
        throw result;
      }
    );
  }
}

class UncaughtPromiseError extends Error {
  constructor(error) {
    super(error);
    this.stack = `(in promise) ${error.stack}`;
  }
}

module.exports = MyPromise;

// Debug Helpers

/*const p1 = new MyPromise((resolve, reject) => {
  console.log("Promise 1 Resolved, returning value: P1Res");
  resolve("P1Res");
}, "p1");

// const p2 = p1.then((prev) => {
//   return new MyPromise((resolve, reject) => {
//     console.log(`value from previous promise: ${prev}`);
//     resolve("P2Res");
//   });
// });

const p2 = p1.catch((prev) => {
  console.log(`value from previous promise: ${prev}`);
  return "P2Rej";
}, "p2");

const p3 = p2.catch((prev) => {
  console.log(`value from previous promise: ${prev}`);
  return "P3Rej";
}, "p3");


const p4 = p2.then(
  (val) => console.log(`in p4 Catching the value from previous Promise ${val}`),
  undefined,
  "p4"
);*/

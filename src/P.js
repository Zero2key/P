const PromiseStatus = '[[PromiseStatus]]';
const PromiseValue = '[[PromiseValue]]';

const PromiseStatusMap = {
  pending: 'pending',
  resolved: 'resolved',
  rejected: 'rejected'
};

class UnCatchedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnCatchedError';
  }
}

class P {
  constructor(executor) {
    this[PromiseStatus] = PromiseStatusMap.pending;
    this[PromiseValue] = undefined;
    this.nextList = [];

    const reject = reason => {
      setTimeout(() => {
        if (this[PromiseStatus] === PromiseStatusMap.pending) {
          this[PromiseValue] = reason;
          this[PromiseStatus] = PromiseStatusMap.rejected;
          if (!this.nextList.length) {
            throw new UnCatchedError(reason);
          }
          this.nextList.forEach(t => {
            if (t.onrejected) {
              t.resolve(t.onrejected(this[PromiseValue]));
            } else {
              t.reject(this[PromiseValue]);
            }
          });
          this.nextList = [];
        }
      });
    };
    const resolve = value => {
      if (value && value.then && typeof value.then === 'function') {
        value.then(resolve, reject);
        return;
      }
      setTimeout(() => {
        if (this[PromiseStatus] === PromiseStatusMap.pending) {
          this[PromiseValue] = value;
          this[PromiseStatus] = PromiseStatusMap.resolved;
          this.nextList.forEach(t => {
            if (t.onfulfilled) {
              t.resolve(t.onfulfilled(this[PromiseValue]));
            } else {
              t.resolve(this[PromiseValue]);
            }
          });
          this.nextList = [];
        }
      });
    };
    try {
      executor(resolve, reject);
    } catch (e) {
      if (e instanceof UnCatchedError) {
        throw e;
      }
      return new P((_, reject) => {
        reject(e);
      });
    }
  }

  _then(onfulfilled, onrejected) {
    if (this[PromiseStatus] === PromiseStatusMap.pending) {
      return new P((resolve, reject) => {
        this.nextList.push({
          resolve,
          reject,
          onfulfilled,
          onrejected
        });
      });
    } else if (this[PromiseStatus] === PromiseStatusMap.resolved && onfulfilled) {
      return new P(resolve => {
        resolve(onfulfilled(this[PromiseValue]));
      });
    } else if (this[PromiseStatus] === PromiseStatusMap.resolved) {
      return new P(resolve => {
        resolve(this[PromiseValue]);
      });
    } else if (this[PromiseStatus] === PromiseStatusMap.rejected && onrejected) {
      return new P(resolve => {
        resolve(onrejected(this[PromiseValue]));
      });
    } else if (this[PromiseStatus] === PromiseStatusMap.rejected) {
      return new P((_, reject) => {
        reject(this[PromiseValue]);
      });
    }
  }

  then(onfulfilled, onrejected) {
    return this._then(onfulfilled, onrejected);
  }

  catch(onrejected) {
    return this._then(undefined, onrejected);
  }

  static resolve(value) {
    return new P(resolve => resolve(value));
  }

  static reject(reason) {
    return new P((_, reject) => reject(reason));
  }

  static all(pArray) {
    if (!Array.isArray(pArray)) {
      throw new Error('Arguments is not Array');
    }
    return new P((resolve, reject) => {
      const rets = Array(pArray.length);
      let num = 0;
      pArray.forEach((p, index) =>
        P.resolve(p).then(value => {
          rets[index] = value;
          num++;
          if (num === pArray.length) {
            resolve(rets);
          }
        }, reject)
      );
    });
  }

  static race(pArray) {
    if (!Array.isArray(pArray)) {
      throw new Error('Arguments is not Array');
    }
    return new P((resolve, reject) => {
      pArray.forEach(p => P.resolve(p).then(resolve, reject));
    });
  }
}

module.exports = P;

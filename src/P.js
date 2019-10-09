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
    this.thenList = [];
    this.catchList = [];

    const reject = reason => {
      if (this[PromiseStatus] === PromiseStatusMap.pending) {
        this[PromiseValue] = reason;
        this[PromiseStatus] = PromiseStatusMap.rejected;
        if (!(this.thenList.length || this.catchList.length)) {
          throw new UnCatchedError(reason);
        }
        setTimeout(() => {
          this.thenList.forEach(t => {
            if (t.onrejected) {
              t.resolve(t.onrejected(this[PromiseValue]));
            } else {
              t.reject(this[PromiseValue]);
            }
          });
          this.catchList.forEach(c => {
            if (c.onrejected) {
              c.resolve(c.onrejected(this[PromiseValue]));
            } else {
              c.reject(this[PromiseValue]);
            }
          });
          this.thenList = [];
          this.catchList = [];
        });
      }
    };
    const resolve = value => {
      if (value && value.then && typeof value.then === 'function') {
        value.then(resolve, reject);
        return;
      }
      if (this[PromiseStatus] === PromiseStatusMap.pending) {
        this[PromiseValue] = value;
        this[PromiseStatus] = PromiseStatusMap.resolved;
        setTimeout(() => {
          this.thenList.forEach(t => {
            if (t.onfulfilled) {
              t.resolve(t.onfulfilled(this[PromiseValue]));
            } else {
              t.resolve(this[PromiseValue]);
            }
          });
          this.catchList.forEach(c => {
            c.resolve(this[PromiseValue]);
          });
        });
      }
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

  then(onfulfilled, onrejected) {
    if (this[PromiseStatus] === PromiseStatusMap.pending) {
      return new P((resolve, reject) => {
        this.thenList.push({
          resolve,
          reject,
          onfulfilled,
          onrejected
        });
      });
    } else if (this[PromiseStatus] === PromiseStatusMap.resolved && onfulfilled) {
      return new P(resolve => {
        setTimeout(() => {
          resolve(onfulfilled(this[PromiseValue]));
        });
      });
    } else if (this[PromiseStatus] === PromiseStatusMap.resolved) {
      return new P(resolve => {
        setTimeout(() => {
          resolve(this[PromiseValue]);
        });
      });
    } else if (this[PromiseStatus] === PromiseStatusMap.rejected && onrejected) {
      return new P(resolve => {
        setTimeout(() => {
          resolve(onrejected(this[PromiseValue]));
        });
      });
    } else if (this[PromiseStatus] === PromiseStatusMap.rejected) {
      return new P((_, reject) => {
        setTimeout(() => {
          reject(this[PromiseValue]);
        });
      });
    }
  }

  catch(onrejected) {
    if (this[PromiseStatus] === PromiseStatusMap.pending) {
      return new P((resolve, reject) => {
        this.catchList.push({
          resolve,
          reject,
          onrejected
        });
      });
    } else if (this[PromiseStatus] === PromiseStatusMap.resolved) {
      return new P(resolve => {
        setTimeout(() => {
          resolve(this[PromiseValue]);
        });
      });
    } else if (this[PromiseStatus] === PromiseStatusMap.rejected && onrejected) {
      return new P(resolve => {
        setTimeout(() => {
          resolve(onrejected(this[PromiseValue]));
        });
      });
    } else if (this[PromiseStatus] === PromiseStatusMap.rejected) {
      return new P((_, reject) => {
        setTimeout(() => {
          reject(this[PromiseValue]);
        });
      });
    }
  }
}

module.exports = P;

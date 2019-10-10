const P = require('../src/P');

describe('core', () => {
  test('new', () => {
    expect(new P(r => r(1))).toBeTruthy();
  });
  test('P init value', () => {
    const p = new P(() => undefined);
    expect(p['[[PromiseValue]]']).toBeUndefined();
    expect(p['[[PromiseStatus]]']).toBe('pending');
    expect(p.nextList).toStrictEqual([]);
  });
  test('resolve', () => {
    return new P(r => r(1)).then(v => expect(v).toBe(1));
  });
  test('resolve delay', () => {
    return new P(r => setTimeout(r, 500, 1)).then(v => expect(v).toBe(1));
  });
  test('reject then', () => {
    return new P((_, j) => j(1)).then(undefined, reason => expect(reason).toBe(1));
  });
  test('reject then delay', () => {
    return new P((_, j) => setTimeout(j, 500, 1)).then(undefined, reason => expect(reason).toBe(1));
  });
  test('reject catch', () => {
    return new P((_, j) => j(1)).catch(reason => expect(reason).toBe(1));
  });
  test('reject catch dealy', () => {
    return new P((_, j) => setTimeout(j, 500, 1)).catch(reason => expect(reason).toBe(1));
  });
  test('resolve thenable', () => {
    return new P(r => r(new Promise(r => r(1)))).then(v => expect(v).toBe(1));
  });
  test('throw error', () => {
    return new P(() => {
      throw 1;
    }).catch(reason => expect(reason).toBe(1));
  });
  test('resolve penetrate then none', () => {
    return new P(r => r(1)).then().then(v => expect(v).toBe(1));
  });
  test('resolve penetrate then catch', () => {
    new P(r => r(1)).then(undefined, console.error).then(v => expect(v).toBe(1));
  });
  test('resolve penetrate catch none', () => {
    return new P(r => r(1)).catch().then(v => expect(v).toBe(1));
  });
  test('resolve penetrate catch something', () => {
    return new P(r => r(1)).catch(console.error).then(v => expect(v).toBe(1));
  });
  test('resolve delay penetrate then none', () => {
    return new P(r => setTimeout(r, 500, 1)).then().then(v => expect(v).toBe(1));
  });
  test('resolve delay penetrate then catch', () => {
    return new P(r => setTimeout(r, 500, 1)).then(undefined, console.error).then(v => expect(v).toBe(1));
  });
  test('resolve delay penetrate catch none', () => {
    return new P(r => setTimeout(r, 500, 1)).catch().then(v => expect(v).toBe(1));
  });
  test('resolve delay penetrate catch something', () => {
    return new P(r => setTimeout(r, 500, 1)).catch(console.error).then(v => expect(v).toBe(1));
  });
  test('reject penetrate then none', () => {
    return new P((_, j) => j(1)).then().catch(reason => expect(reason).toBe(1));
  });
  test('reject penetrate then something', () => {
    return new P((_, j) => j(1)).then(console.log).catch(reason => expect(reason).toBe(1));
  });
  test('reject penetrate catch none', () => {
    return new P((_, j) => j(1)).catch().catch(reason => expect(reason).toBe(1));
  });
  test('reject delay penetrate then none', () => {
    return new P((_, j) => setTimeout(j, 500, 1)).then().catch(reason => expect(reason).toBe(1));
  });
  test('reject delay penetrate then something', () => {
    return new P((_, j) => setTimeout(j, 500, 1)).then(console.log).catch(reason => expect(reason).toBe(1));
  });
  test('reject delay penetrate catch none', () => {
    return new P((_, j) => setTimeout(j, 500, 1)).catch().catch(reason => expect(reason).toBe(1));
  });
  test('then value', () => {
    return new P(r => r(1)).then(v => v).then(v => expect(v).toBe(1));
  });
  test('then thenable', () => {
    return new P(r => r(1)).then(v => new Promise(r => r(v))).then(v => expect(v).toBe(1));
  });
  test('catch value', () => {
    return new P((_, j) => j(1)).catch(reason => reason).then(v => expect(v).toBe(1));
  });
  test('catch then value', () => {
    return new P((_, j) => j(1)).then(null, reason => reason).then(v => expect(v).toBe(1));
  });
  test('catch thenable', () => {
    return new P((_, j) => j(1)).catch(reason => new Promise(r => r(reason))).then(v => expect(v).toBe(1));
  });
  test('then delay value', () => {
    return new P(r => setTimeout(r, 500, 1)).then(v => v).then(v => expect(v).toBe(1));
  });
  test('then delay thenable', () => {
    return new P(r => setTimeout(r, 500, 1)).then(v => new Promise(r => r(v))).then(v => expect(v).toBe(1));
  });
  test('catch delay value', () => {
    return new P((_, j) => setTimeout(j, 500, 1)).catch(reason => reason).then(v => expect(v).toBe(1));
  });
  test('catch delay then value', () => {
    return new P((_, j) => setTimeout(j, 500, 1)).then(null, reason => reason).then(v => expect(v).toBe(1));
  });
  test('catch delay thenable', () => {
    return new P((_, j) => setTimeout(j, 500, 1))
      .catch(reason => new Promise(r => r(reason)))
      .then(v => expect(v).toBe(1));
  });
});

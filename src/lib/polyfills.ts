// PDF.js와 Next.js 15 호환성을 위한 폴리필
if (typeof global === 'undefined') {
  (globalThis as any).global = globalThis;
}

// Promise.withResolvers 폴리필 (PDF.js에서 사용)
if (typeof Promise.withResolvers === 'undefined') {
  Promise.withResolvers = function <T>() {
    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve: resolve!, reject: reject! };
  };
}

export {}; 
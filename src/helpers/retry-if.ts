/**
 * Retry promise N times.
 * Throws if error does not predicate or if it runs out of attempts.
 * @param  {<T>()=>Promise<T>} fn
 * @param  {(err)=>boolean} predicate
 * @param  {number=10} attempts
 * @param  {number=2000} minDelay
 */
export const retryIf = <T>(
  fn: () => Promise<T>,
  predicate: (err) => boolean,
  attempts: number = 10,
  minDelay: number = 2000,
  onError?: () => void
): Promise<T> => {
  const totalAttempts = attempts;

  const fnRetry = async () => {
    let lastError;
    let result;
    while (attempts-- > 0) {
      try {
        result = await fn();

        return result;
      } catch (err) {
        if (!predicate(err)) {
          throw err;
        }
        if (err.response) {
          err = err.response;
        }
        lastError = err;

        if (onError) {
          await onError();
        }

        await new Promise((resolve) =>
          setTimeout(
            resolve,
            Math.max(minDelay, 2 ** (totalAttempts - attempts) * 100)
          )
        );
      }
    }

    if (attempts < 0 && lastError) {
      throw lastError;
    }

    return result;
  };

  return fnRetry();
};

export const retryWhile = <T>(
  fn: () => Promise<T>,
  predicate: (response) => boolean,
  attempts: number = 10,
  minDelay: number = 2000
): Promise<T> => {
  const totalAttempts = attempts;

  const fnRetry = async () => {
    let lastResult;
    while (attempts-- > 0) {
      try {
        lastResult = await fn();

        if (!predicate(lastResult)) {
          return lastResult;
        }

        await new Promise((resolve) =>
          setTimeout(
            resolve,
            Math.max(minDelay, 2 ** (totalAttempts - attempts) * 100)
          )
        );
      } catch (err) {
        throw err;
      }
    }

    return lastResult;
  };

  return fnRetry();
};

// Each auth transition invalidates every earlier asynchronous verification.
export function createVerificationGate() {
  let generation = 0;
  return {
    invalidate: () => ++generation,
    isCurrent: (ticket: number) => ticket === generation,
  };
}

// Based on https://github.com/svsool/vscode-memo/blob/master/src/test/config/jestSetup.ts
export {}
jest.mock('vscode', () => (global as any).vscode, { virtual: true });

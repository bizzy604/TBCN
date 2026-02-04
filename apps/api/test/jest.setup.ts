// Jest setup file
// Increase timeout for async operations
jest.setTimeout(60000);

// Global test utilities - keep error logging enabled for e2e debugging
global.console = {
  ...console,
  // Suppress noise during tests but keep errors visible
  debug: jest.fn(),
  info: jest.fn(),
  // warn: jest.fn(),  // Keep warnings enabled for e2e
  // error: jest.fn(), // Keep errors enabled for e2e
};

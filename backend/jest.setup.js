// jest.setup.js

// Globally intercepts the 'redis' module to prevent live background sockets
jest.mock('redis', () => ({
  createClient: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(null),
    disconnect: jest.fn().mockResolvedValue(null),
    on: jest.fn(),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    quit: jest.fn().mockResolvedValue(null),
  })),
}));

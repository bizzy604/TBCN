var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// Jest setup file
// Increase timeout for async operations
jest.setTimeout(60000);
// Global test utilities - keep error logging enabled for e2e debugging
global.console = __assign(__assign({}, console), { 
    // Suppress noise during tests but keep errors visible
    debug: jest.fn(), info: jest.fn() });

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var testing_1 = require("@nestjs/testing");
var jwt_1 = require("@nestjs/jwt");
var config_1 = require("@nestjs/config");
var event_emitter_1 = require("@nestjs/event-emitter");
var common_1 = require("@nestjs/common");
var auth_service_1 = require("./auth.service");
describe('AuthService', function () {
    var service;
    var jwtService;
    var configService;
    var eventEmitter;
    var mockJwtService = {
        signAsync: jest.fn(),
        verifyAsync: jest.fn()
    };
    var mockConfigService = {
        get: jest.fn(function (key, defaultValue) {
            var config = {
                JWT_SECRET: 'test-secret',
                JWT_ACCESS_EXPIRATION: '15m',
                JWT_REFRESH_EXPIRATION: '7d'
            };
            return config[key] || defaultValue;
        })
    };
    var mockEventEmitter = {
        emit: jest.fn()
    };
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testing_1.Test.createTestingModule({
                        providers: [
                            auth_service_1.AuthService,
                            { provide: jwt_1.JwtService, useValue: mockJwtService },
                            { provide: config_1.ConfigService, useValue: mockConfigService },
                            { provide: event_emitter_1.EventEmitter2, useValue: mockEventEmitter },
                        ]
                    }).compile()];
                case 1:
                    module = _a.sent();
                    service = module.get(auth_service_1.AuthService);
                    jwtService = module.get(jwt_1.JwtService);
                    configService = module.get(config_1.ConfigService);
                    eventEmitter = module.get(event_emitter_1.EventEmitter2);
                    jest.clearAllMocks();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should be defined', function () {
        expect(service).toBeDefined();
    });
    describe('register', function () {
        it('should throw BadRequestException if terms not accepted', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = {
                            email: 'test@example.com',
                            password: 'Password123',
                            firstName: 'John',
                            lastName: 'Doe',
                            acceptTerms: false
                        };
                        return [4 /*yield*/, expect(service.register(dto)).rejects.toThrow(common_1.BadRequestException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should emit USER_REGISTERED event on successful registration', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = {
                            email: 'test@example.com',
                            password: 'Password123',
                            firstName: 'John',
                            lastName: 'Doe',
                            acceptTerms: true
                        };
                        return [4 /*yield*/, service.register(dto)];
                    case 1:
                        result = _a.sent();
                        expect(result.message).toContain('Registration successful');
                        expect(mockEventEmitter.emit).toHaveBeenCalledWith('auth.user.registered', expect.objectContaining({
                            email: dto.email,
                            firstName: dto.firstName
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('login', function () {
        it('should return tokens on successful login', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = {
                            email: 'test@example.com',
                            password: 'Password123'
                        };
                        mockJwtService.signAsync
                            .mockResolvedValueOnce('access-token')
                            .mockResolvedValueOnce('refresh-token');
                        return [4 /*yield*/, service.login(dto)];
                    case 1:
                        result = _a.sent();
                        expect(result).toHaveProperty('accessToken');
                        expect(result).toHaveProperty('refreshToken');
                        expect(result).toHaveProperty('expiresIn');
                        expect(result.tokenType).toBe('Bearer');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should emit USER_LOGGED_IN event on successful login', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = {
                            email: 'test@example.com',
                            password: 'Password123'
                        };
                        mockJwtService.signAsync
                            .mockResolvedValueOnce('access-token')
                            .mockResolvedValueOnce('refresh-token');
                        return [4 /*yield*/, service.login(dto)];
                    case 1:
                        _a.sent();
                        expect(mockEventEmitter.emit).toHaveBeenCalledWith('auth.user.loggedIn', expect.objectContaining({
                            email: dto.email
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('refreshToken', function () {
        it('should return new tokens for valid refresh token', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = { refreshToken: 'valid-refresh-token' };
                        mockJwtService.verifyAsync.mockResolvedValueOnce({
                            sub: 'user-id',
                            email: 'test@example.com',
                            role: 'member'
                        });
                        mockJwtService.signAsync
                            .mockResolvedValueOnce('new-access-token')
                            .mockResolvedValueOnce('new-refresh-token');
                        return [4 /*yield*/, service.refreshToken(dto)];
                    case 1:
                        result = _a.sent();
                        expect(result.accessToken).toBe('new-access-token');
                        expect(result.refreshToken).toBe('new-refresh-token');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw UnauthorizedException for invalid refresh token', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = { refreshToken: 'invalid-token' };
                        mockJwtService.verifyAsync.mockRejectedValueOnce(new Error('Invalid token'));
                        return [4 /*yield*/, expect(service.refreshToken(dto)).rejects.toThrow(common_1.UnauthorizedException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('forgotPassword', function () {
        it('should return success message (prevents email enumeration)', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = { email: 'test@example.com' };
                        return [4 /*yield*/, service.forgotPassword(dto)];
                    case 1:
                        result = _a.sent();
                        expect(result.message).toContain('If an account with that email exists');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('resetPassword', function () {
        it('should throw BadRequestException if passwords do not match', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = {
                            token: 'reset-token',
                            password: 'NewPassword123',
                            confirmPassword: 'DifferentPassword123'
                        };
                        return [4 /*yield*/, expect(service.resetPassword(dto)).rejects.toThrow(common_1.BadRequestException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return success message for matching passwords', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = {
                            token: 'reset-token',
                            password: 'NewPassword123',
                            confirmPassword: 'NewPassword123'
                        };
                        return [4 /*yield*/, service.resetPassword(dto)];
                    case 1:
                        result = _a.sent();
                        expect(result.message).toContain('Password has been reset');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('changePassword', function () {
        it('should throw BadRequestException if passwords do not match', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = {
                            currentPassword: 'CurrentPassword123',
                            newPassword: 'NewPassword123',
                            confirmPassword: 'DifferentPassword123'
                        };
                        return [4 /*yield*/, expect(service.changePassword('user-id', dto)).rejects.toThrow(common_1.BadRequestException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return success message for valid password change', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = {
                            currentPassword: 'CurrentPassword123',
                            newPassword: 'NewPassword123',
                            confirmPassword: 'NewPassword123'
                        };
                        return [4 /*yield*/, service.changePassword('user-id', dto)];
                    case 1:
                        result = _a.sent();
                        expect(result.message).toContain('Password has been changed');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('logout', function () {
        it('should return success message', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.logout('user-id')];
                    case 1:
                        result = _a.sent();
                        expect(result.message).toContain('Logged out successfully');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

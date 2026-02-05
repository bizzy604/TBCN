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
var core_1 = require("@nestjs/core");
var auth_controller_1 = require("./auth.controller");
var auth_service_1 = require("./auth.service");
describe('AuthController', function () {
    var controller;
    var authService;
    var mockAuthService = {
        register: jest.fn(),
        login: jest.fn(),
        refreshToken: jest.fn(),
        forgotPassword: jest.fn(),
        resetPassword: jest.fn(),
        changePassword: jest.fn(),
        logout: jest.fn()
    };
    var mockJwtService = {
        signAsync: jest.fn(),
        verifyAsync: jest.fn()
    };
    var mockConfigService = {
        get: jest.fn().mockReturnValue('test-secret')
    };
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testing_1.Test.createTestingModule({
                        controllers: [auth_controller_1.AuthController],
                        providers: [
                            { provide: auth_service_1.AuthService, useValue: mockAuthService },
                            { provide: jwt_1.JwtService, useValue: mockJwtService },
                            { provide: config_1.ConfigService, useValue: mockConfigService },
                            core_1.Reflector,
                        ]
                    }).compile()];
                case 1:
                    module = _a.sent();
                    controller = module.get(auth_controller_1.AuthController);
                    authService = module.get(auth_service_1.AuthService);
                    jest.clearAllMocks();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should be defined', function () {
        expect(controller).toBeDefined();
    });
    describe('POST /auth/register', function () {
        it('should call authService.register with correct params', function () { return __awaiter(void 0, void 0, void 0, function () {
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
                        mockAuthService.register.mockResolvedValueOnce({
                            message: 'Registration successful'
                        });
                        return [4 /*yield*/, controller.register(dto)];
                    case 1:
                        result = _a.sent();
                        expect(authService.register).toHaveBeenCalledWith(dto);
                        expect(result.message).toContain('Registration successful');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /auth/login', function () {
        it('should return tokens on successful login', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto, mockTokens, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = {
                            email: 'test@example.com',
                            password: 'Password123'
                        };
                        mockTokens = {
                            accessToken: 'access-token',
                            refreshToken: 'refresh-token',
                            expiresIn: 900,
                            tokenType: 'Bearer'
                        };
                        mockAuthService.login.mockResolvedValueOnce(mockTokens);
                        return [4 /*yield*/, controller.login(dto)];
                    case 1:
                        result = _a.sent();
                        expect(authService.login).toHaveBeenCalledWith(dto);
                        expect(result).toEqual(mockTokens);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /auth/refresh', function () {
        it('should return new tokens for valid refresh token', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto, mockTokens, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = {
                            refreshToken: 'valid-refresh-token'
                        };
                        mockTokens = {
                            accessToken: 'new-access-token',
                            refreshToken: 'new-refresh-token',
                            expiresIn: 900,
                            tokenType: 'Bearer'
                        };
                        mockAuthService.refreshToken.mockResolvedValueOnce(mockTokens);
                        return [4 /*yield*/, controller.refreshToken(dto)];
                    case 1:
                        result = _a.sent();
                        expect(authService.refreshToken).toHaveBeenCalledWith(dto);
                        expect(result).toEqual(mockTokens);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /auth/forgot-password', function () {
        it('should call authService.forgotPassword', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = { email: 'test@example.com' };
                        mockAuthService.forgotPassword.mockResolvedValueOnce({
                            message: 'Email sent'
                        });
                        return [4 /*yield*/, controller.forgotPassword(dto)];
                    case 1:
                        result = _a.sent();
                        expect(authService.forgotPassword).toHaveBeenCalledWith(dto);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /auth/logout', function () {
        it('should call authService.logout with user ID', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockAuthService.logout.mockResolvedValueOnce({
                            message: 'Logged out'
                        });
                        return [4 /*yield*/, controller.logout('user-id')];
                    case 1:
                        result = _a.sent();
                        expect(authService.logout).toHaveBeenCalledWith('user-id');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /auth/change-password', function () {
        it('should call authService.changePassword', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = {
                            currentPassword: 'OldPass123',
                            newPassword: 'NewPass123',
                            confirmPassword: 'NewPass123'
                        };
                        mockAuthService.changePassword.mockResolvedValueOnce({
                            message: 'Password changed'
                        });
                        return [4 /*yield*/, controller.changePassword('user-id', dto)];
                    case 1:
                        result = _a.sent();
                        expect(authService.changePassword).toHaveBeenCalledWith('user-id', dto);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('GET /auth/me', function () {
        it('should return current user info', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockUser, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockUser = {
                            sub: 'user-id',
                            email: 'test@example.com',
                            role: 'member'
                        };
                        return [4 /*yield*/, controller.me(mockUser)];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual({
                            id: 'user-id',
                            email: 'test@example.com',
                            role: 'member'
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

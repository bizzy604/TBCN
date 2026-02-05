"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.AuthController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var throttler_1 = require("@nestjs/throttler");
var decorators_1 = require("../../common/decorators");
var guards_1 = require("../../common/guards");
var AuthController = /** @class */ (function () {
    function AuthController(authService) {
        this.authService = authService;
    }
    // ============================================
    // Public Endpoints
    // ============================================
    AuthController.prototype.register = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.authService.register(dto)];
            });
        });
    };
    AuthController.prototype.login = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.authService.login(dto)];
            });
        });
    };
    AuthController.prototype.refreshToken = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.authService.refreshToken(dto)];
            });
        });
    };
    AuthController.prototype.forgotPassword = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.authService.forgotPassword(dto)];
            });
        });
    };
    AuthController.prototype.resetPassword = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.authService.resetPassword(dto)];
            });
        });
    };
    // ============================================
    // Protected Endpoints
    // ============================================
    AuthController.prototype.logout = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.authService.logout(userId)];
            });
        });
    };
    AuthController.prototype.changePassword = function (userId, dto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.authService.changePassword(userId, dto)];
            });
        });
    };
    AuthController.prototype.me = function (user) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Return full user profile from UsersService
                return [2 /*return*/, {
                        id: user.sub,
                        email: user.email,
                        role: user.role
                    }];
            });
        });
    };
    __decorate([
        (0, common_1.Post)('register'),
        (0, decorators_1.Public)(),
        (0, throttler_1.Throttle)({ "default": { limit: 5, ttl: 60000 } }) // 5 requests per minute
        ,
        (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
        (0, swagger_1.ApiResponse)({ status: 201, description: 'User registered successfully' }),
        (0, swagger_1.ApiResponse)({ status: 400, description: 'Validation error' }),
        (0, swagger_1.ApiResponse)({ status: 409, description: 'User already exists' }),
        __param(0, (0, common_1.Body)())
    ], AuthController.prototype, "register");
    __decorate([
        (0, common_1.Post)('login'),
        (0, decorators_1.Public)(),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        (0, throttler_1.Throttle)({ "default": { limit: 10, ttl: 60000 } }) // 10 requests per minute
        ,
        (0, swagger_1.ApiOperation)({ summary: 'Login with email and password' }),
        (0, swagger_1.ApiResponse)({ status: 200, description: 'Login successful' }),
        (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
        __param(0, (0, common_1.Body)())
    ], AuthController.prototype, "login");
    __decorate([
        (0, common_1.Post)('refresh'),
        (0, decorators_1.Public)(),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        (0, swagger_1.ApiOperation)({ summary: 'Refresh access token' }),
        (0, swagger_1.ApiResponse)({ status: 200, description: 'Token refreshed' }),
        (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid refresh token' }),
        __param(0, (0, common_1.Body)())
    ], AuthController.prototype, "refreshToken");
    __decorate([
        (0, common_1.Post)('forgot-password'),
        (0, decorators_1.Public)(),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        (0, throttler_1.Throttle)({ "default": { limit: 3, ttl: 60000 } }) // 3 requests per minute
        ,
        (0, swagger_1.ApiOperation)({ summary: 'Request password reset email' }),
        (0, swagger_1.ApiResponse)({ status: 200, description: 'Reset email sent if account exists' }),
        __param(0, (0, common_1.Body)())
    ], AuthController.prototype, "forgotPassword");
    __decorate([
        (0, common_1.Post)('reset-password'),
        (0, decorators_1.Public)(),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        (0, swagger_1.ApiOperation)({ summary: 'Reset password with token' }),
        (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successful' }),
        (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired token' }),
        __param(0, (0, common_1.Body)())
    ], AuthController.prototype, "resetPassword");
    __decorate([
        (0, common_1.Post)('logout'),
        (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        (0, swagger_1.ApiBearerAuth)('JWT-auth'),
        (0, swagger_1.ApiOperation)({ summary: 'Logout current user' }),
        (0, swagger_1.ApiResponse)({ status: 200, description: 'Logged out successfully' }),
        __param(0, (0, decorators_1.CurrentUser)('sub'))
    ], AuthController.prototype, "logout");
    __decorate([
        (0, common_1.Post)('change-password'),
        (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
        (0, common_1.HttpCode)(common_1.HttpStatus.OK),
        (0, swagger_1.ApiBearerAuth)('JWT-auth'),
        (0, swagger_1.ApiOperation)({ summary: 'Change password for authenticated user' }),
        (0, swagger_1.ApiResponse)({ status: 200, description: 'Password changed' }),
        (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid current password' }),
        __param(0, (0, decorators_1.CurrentUser)('sub')),
        __param(1, (0, common_1.Body)())
    ], AuthController.prototype, "changePassword");
    __decorate([
        (0, common_1.Get)('me'),
        (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
        (0, swagger_1.ApiBearerAuth)('JWT-auth'),
        (0, swagger_1.ApiOperation)({ summary: 'Get current authenticated user' }),
        (0, swagger_1.ApiResponse)({ status: 200, description: 'Current user info' }),
        __param(0, (0, decorators_1.CurrentUser)())
    ], AuthController.prototype, "me");
    AuthController = __decorate([
        (0, swagger_1.ApiTags)('Auth'),
        (0, common_1.Controller)('auth')
    ], AuthController);
    return AuthController;
}());
exports.AuthController = AuthController;

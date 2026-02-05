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
exports.AuthService = exports.AUTH_EVENTS = void 0;
var common_1 = require("@nestjs/common");
var bcrypt = require("bcrypt");
var uuid_1 = require("uuid");
var users_service_1 = require("../users/users.service");
// Domain events
exports.AUTH_EVENTS = {
    USER_REGISTERED: 'auth.user.registered',
    USER_LOGGED_IN: 'auth.user.loggedIn',
    PASSWORD_RESET_REQUESTED: 'auth.password.resetRequested',
    PASSWORD_CHANGED: 'auth.password.changed'
};
/**
 * Auth Service
 * Handles all authentication logic
 */
var AuthService = /** @class */ (function () {
    function AuthService(jwtService, configService, eventEmitter, usersService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.usersService = usersService;
        this.SALT_ROUNDS = 12;
    }
    /**
     * Register a new user
     */
    AuthService.prototype.register = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var existingUser, hashedPassword, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Check if acceptTerms is true
                        if (!dto.acceptTerms) {
                            throw new common_1.BadRequestException('You must accept the terms and conditions');
                        }
                        return [4 /*yield*/, this.usersService.findByEmail(dto.email)];
                    case 1:
                        existingUser = _a.sent();
                        if (existingUser) {
                            throw new common_1.ConflictException('User with this email already exists');
                        }
                        return [4 /*yield*/, this.hashPassword(dto.password)];
                    case 2:
                        hashedPassword = _a.sent();
                        return [4 /*yield*/, this.usersService.createWithPassword({
                                email: dto.email,
                                password: hashedPassword,
                                firstName: dto.firstName,
                                lastName: dto.lastName
                            })];
                    case 3:
                        user = _a.sent();
                        // Emit registration event
                        this.eventEmitter.emit(exports.AUTH_EVENTS.USER_REGISTERED, {
                            userId: user.id,
                            email: dto.email,
                            firstName: dto.firstName
                        });
                        return [2 /*return*/, {
                                message: 'Registration successful. Please check your email to verify your account.'
                            }];
                }
            });
        });
    };
    /**
     * Login with email and password
     */
    AuthService.prototype.login = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var user, isPasswordValid, tokens;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.usersService.findByEmailWithPassword(dto.email)];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            throw new common_1.UnauthorizedException('Invalid email or password');
                        }
                        return [4 /*yield*/, this.verifyPassword(dto.password, user.password)];
                    case 2:
                        isPasswordValid = _a.sent();
                        if (!isPasswordValid) {
                            throw new common_1.UnauthorizedException('Invalid email or password');
                        }
                        return [4 /*yield*/, this.generateTokens(user.id, user.email, user.role)];
                    case 3:
                        tokens = _a.sent();
                        // Emit login event
                        this.eventEmitter.emit(exports.AUTH_EVENTS.USER_LOGGED_IN, {
                            userId: user.id,
                            email: user.email
                        });
                        return [2 /*return*/, tokens];
                }
            });
        });
    };
    /**
     * Refresh access token
     */
    AuthService.prototype.refreshToken = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.jwtService.verifyAsync(dto.refreshToken, {
                                secret: this.configService.get('JWT_SECRET')
                            })];
                    case 1:
                        payload = _a.sent();
                        // Generate new tokens
                        return [2 /*return*/, this.generateTokens(payload.sub, payload.email, payload.role)];
                    case 2:
                        error_1 = _a.sent();
                        throw new common_1.UnauthorizedException('Invalid or expired refresh token');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Request password reset
     */
    AuthService.prototype.forgotPassword = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Find user by email
                // const user = await this.usersService.findByEmail(dto.email);
                // Always return success (don't reveal if email exists)
                // if (user) {
                //   const resetToken = this.generateResetToken();
                //   // Store reset token in database
                //   // Emit event to send email
                //   this.eventEmitter.emit(AUTH_EVENTS.PASSWORD_RESET_REQUESTED, {
                //     userId: user.id,
                //     email: user.email,
                //     resetToken,
                //   });
                // }
                return [2 /*return*/, {
                        message: 'If an account with that email exists, we have sent a password reset link.'
                    }];
            });
        });
    };
    /**
     * Reset password with token
     */
    AuthService.prototype.resetPassword = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (dto.password !== dto.confirmPassword) {
                    throw new common_1.BadRequestException('Passwords do not match');
                }
                // TODO: Validate reset token
                // TODO: Update user password
                // TODO: Invalidate reset token
                return [2 /*return*/, {
                        message: 'Password has been reset successfully.'
                    }];
            });
        });
    };
    /**
     * Change password for authenticated user
     */
    AuthService.prototype.changePassword = function (userId, dto) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (dto.newPassword !== dto.confirmPassword) {
                    throw new common_1.BadRequestException('New passwords do not match');
                }
                // TODO: Verify current password
                // TODO: Update password
                // TODO: Emit event
                return [2 /*return*/, {
                        message: 'Password has been changed successfully.'
                    }];
            });
        });
    };
    /**
     * Logout user (invalidate tokens)
     */
    AuthService.prototype.logout = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Add refresh token to blacklist
                // TODO: Clear any sessions
                return [2 /*return*/, {
                        message: 'Logged out successfully.'
                    }];
            });
        });
    };
    // ============================================
    // Private Helper Methods
    // ============================================
    /**
     * Generate access and refresh tokens
     */
    AuthService.prototype.generateTokens = function (userId, email, role) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, accessExpiration, refreshExpiration, _a, accessToken, refreshToken, expiresIn;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        payload = {
                            sub: userId,
                            email: email,
                            role: role
                        };
                        accessExpiration = this.configService.get('JWT_ACCESS_EXPIRATION', '15m');
                        refreshExpiration = this.configService.get('JWT_REFRESH_EXPIRATION', '7d');
                        return [4 /*yield*/, Promise.all([
                                this.jwtService.signAsync(payload, {
                                    expiresIn: accessExpiration
                                }),
                                this.jwtService.signAsync(payload, {
                                    expiresIn: refreshExpiration
                                }),
                            ])];
                    case 1:
                        _a = _b.sent(), accessToken = _a[0], refreshToken = _a[1];
                        expiresIn = this.parseExpirationToSeconds(accessExpiration);
                        return [2 /*return*/, {
                                accessToken: accessToken,
                                refreshToken: refreshToken,
                                expiresIn: expiresIn,
                                tokenType: 'Bearer'
                            }];
                }
            });
        });
    };
    /**
     * Hash password with bcrypt
     */
    AuthService.prototype.hashPassword = function (password) {
        return __awaiter(this, void 0, void 0, function () {
            var salt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, bcrypt.genSalt(this.SALT_ROUNDS)];
                    case 1:
                        salt = _a.sent();
                        return [2 /*return*/, bcrypt.hash(password, salt)];
                }
            });
        });
    };
    /**
     * Verify password against hash
     */
    AuthService.prototype.verifyPassword = function (password, hash) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, bcrypt.compare(password, hash)];
            });
        });
    };
    /**
     * Generate a random reset token
     */
    AuthService.prototype.generateResetToken = function () {
        return (0, uuid_1.v4)().replace(/-/g, '') + (0, uuid_1.v4)().replace(/-/g, '');
    };
    /**
     * Parse expiration string to seconds
     */
    AuthService.prototype.parseExpirationToSeconds = function (expiration) {
        var match = expiration.match(/^(\d+)([smhd])$/);
        if (!match)
            return 900; // Default 15 minutes
        var value = parseInt(match[1], 10);
        var unit = match[2];
        switch (unit) {
            case 's': return value;
            case 'm': return value * 60;
            case 'h': return value * 3600;
            case 'd': return value * 86400;
            default: return 900;
        }
    };
    AuthService = __decorate([
        (0, common_1.Injectable)(),
        __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(function () { return users_service_1.UsersService; })))
    ], AuthService);
    return AuthService;
}());
exports.AuthService = AuthService;

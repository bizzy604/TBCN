"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.User = exports.UserStatus = exports.UserRole = void 0;
var typeorm_1 = require("typeorm");
var bcrypt = require("bcrypt");
var class_transformer_1 = require("class-transformer");
var entities_1 = require("../../../common/entities");
/**
 * User roles in the system
 */
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["ADMIN"] = "admin";
    UserRole["COACH"] = "coach";
    UserRole["PARTNER"] = "partner";
    UserRole["MEMBER"] = "member";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
/**
 * User account status
 */
var UserStatus;
(function (UserStatus) {
    UserStatus["PENDING"] = "pending";
    UserStatus["ACTIVE"] = "active";
    UserStatus["SUSPENDED"] = "suspended";
    UserStatus["DEACTIVATED"] = "deactivated";
})(UserStatus = exports.UserStatus || (exports.UserStatus = {}));
/**
 * User Entity
 * Core user account information
 */
var User = /** @class */ (function (_super) {
    __extends(User, _super);
    function User() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // ============================================
    // Lifecycle Hooks
    // ============================================
    User.prototype.hashPasswordBeforeInsert = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.password && !this.password.startsWith('$2'))) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, bcrypt.hash(this.password, 12)];
                    case 1:
                        _a.password = _b.sent();
                        _b.label = 2;
                    case 2:
                        // Normalize email to lowercase
                        this.email = this.email.toLowerCase().trim();
                        return [2 /*return*/];
                }
            });
        });
    };
    User.prototype.hashPasswordBeforeUpdate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(this.password && !this.password.startsWith('$2'))) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, bcrypt.hash(this.password, 12)];
                    case 1:
                        _a.password = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    // ============================================
    // Instance Methods
    // ============================================
    /**
     * Compare password with hash
     */
    User.prototype.comparePassword = function (candidatePassword) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, bcrypt.compare(candidatePassword, this.password)];
            });
        });
    };
    /**
     * Check if account is locked
     */
    User.prototype.isLocked = function () {
        if (!this.lockedUntil)
            return false;
        return new Date() < this.lockedUntil;
    };
    Object.defineProperty(User.prototype, "fullName", {
        /**
         * Get full name
         */
        get: function () {
            return "".concat(this.firstName, " ").concat(this.lastName).trim();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Check if user has specific role
     */
    User.prototype.hasRole = function (role) {
        return this.role === role;
    };
    /**
     * Check if user is admin or super admin
     */
    User.prototype.isAdmin = function () {
        return this.role === UserRole.ADMIN || this.role === UserRole.SUPER_ADMIN;
    };
    /**
     * Check if user can access admin panel
     */
    User.prototype.canAccessAdmin = function () {
        return [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.COACH].includes(this.role);
    };
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
        (0, typeorm_1.Index)('idx_users_email')
    ], User.prototype, "email");
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 255, select: false }),
        (0, class_transformer_1.Exclude)()
    ], User.prototype, "password");
    __decorate([
        (0, typeorm_1.Column)({ name: 'first_name', type: 'varchar', length: 100 })
    ], User.prototype, "firstName");
    __decorate([
        (0, typeorm_1.Column)({ name: 'last_name', type: 'varchar', length: 100 })
    ], User.prototype, "lastName");
    __decorate([
        (0, typeorm_1.Column)({
            type: 'enum',
            "enum": UserRole,
            "default": UserRole.MEMBER
        }),
        (0, typeorm_1.Index)('idx_users_role')
    ], User.prototype, "role");
    __decorate([
        (0, typeorm_1.Column)({
            type: 'enum',
            "enum": UserStatus,
            "default": UserStatus.PENDING
        }),
        (0, typeorm_1.Index)('idx_users_status')
    ], User.prototype, "status");
    __decorate([
        (0, typeorm_1.Column)({ name: 'email_verified', type: 'boolean', "default": false })
    ], User.prototype, "emailVerified");
    __decorate([
        (0, typeorm_1.Column)({ name: 'email_verified_at', type: 'timestamp', nullable: true })
    ], User.prototype, "emailVerifiedAt");
    __decorate([
        (0, typeorm_1.Column)({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
    ], User.prototype, "avatarUrl");
    __decorate([
        (0, typeorm_1.Column)({ name: 'phone', type: 'varchar', length: 20, nullable: true })
    ], User.prototype, "phone");
    __decorate([
        (0, typeorm_1.Column)({ name: 'phone_verified', type: 'boolean', "default": false })
    ], User.prototype, "phoneVerified");
    __decorate([
        (0, typeorm_1.Column)({ name: 'timezone', type: 'varchar', length: 50, "default": 'UTC' })
    ], User.prototype, "timezone");
    __decorate([
        (0, typeorm_1.Column)({ name: 'locale', type: 'varchar', length: 10, "default": 'en' })
    ], User.prototype, "locale");
    __decorate([
        (0, typeorm_1.Column)({ name: 'last_login_at', type: 'timestamp', nullable: true })
    ], User.prototype, "lastLoginAt");
    __decorate([
        (0, typeorm_1.Column)({ name: 'last_login_ip', type: 'varchar', length: 45, nullable: true })
    ], User.prototype, "lastLoginIp");
    __decorate([
        (0, typeorm_1.Column)({ name: 'failed_login_attempts', type: 'int', "default": 0 })
    ], User.prototype, "failedLoginAttempts");
    __decorate([
        (0, typeorm_1.Column)({ name: 'locked_until', type: 'timestamp', nullable: true })
    ], User.prototype, "lockedUntil");
    __decorate([
        (0, typeorm_1.Column)({ name: 'two_factor_enabled', type: 'boolean', "default": false })
    ], User.prototype, "twoFactorEnabled");
    __decorate([
        (0, typeorm_1.Column)({ name: 'two_factor_secret', type: 'varchar', length: 255, nullable: true }),
        (0, class_transformer_1.Exclude)()
    ], User.prototype, "twoFactorSecret");
    __decorate([
        (0, typeorm_1.Column)({ name: 'password_reset_token', type: 'varchar', length: 255, nullable: true }),
        (0, class_transformer_1.Exclude)()
    ], User.prototype, "passwordResetToken");
    __decorate([
        (0, typeorm_1.Column)({ name: 'password_reset_expires', type: 'timestamp', nullable: true }),
        (0, class_transformer_1.Exclude)()
    ], User.prototype, "passwordResetExpires");
    __decorate([
        (0, typeorm_1.Column)({ name: 'email_verification_token', type: 'varchar', length: 255, nullable: true }),
        (0, class_transformer_1.Exclude)()
    ], User.prototype, "emailVerificationToken");
    __decorate([
        (0, typeorm_1.Column)({ name: 'deleted_at', type: 'timestamp', nullable: true })
    ], User.prototype, "deletedAt");
    __decorate([
        (0, typeorm_1.BeforeInsert)()
    ], User.prototype, "hashPasswordBeforeInsert");
    __decorate([
        (0, typeorm_1.BeforeUpdate)()
    ], User.prototype, "hashPasswordBeforeUpdate");
    User = __decorate([
        (0, typeorm_1.Entity)('users')
    ], User);
    return User;
}(entities_1.BaseEntity));
exports.User = User;

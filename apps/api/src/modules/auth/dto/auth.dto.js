"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.ChangePasswordDto = exports.VerifyEmailDto = exports.ResetPasswordDto = exports.ForgotPasswordDto = exports.RefreshTokenDto = exports.RegisterDto = exports.LoginDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
/**
 * Login DTO
 */
var LoginDto = /** @class */ (function () {
    function LoginDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'User email address',
            example: 'john@example.com'
        }),
        (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' })
    ], LoginDto.prototype, "email");
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'User password',
            example: 'SecureP@ss123'
        }),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters' })
    ], LoginDto.prototype, "password");
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Remember me flag for extended session',
            required: false,
            "default": false
        }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsBoolean)()
    ], LoginDto.prototype, "rememberMe");
    return LoginDto;
}());
exports.LoginDto = LoginDto;
/**
 * Register DTO
 */
var RegisterDto = /** @class */ (function () {
    function RegisterDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'User email address',
            example: 'john@example.com'
        }),
        (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' })
    ], RegisterDto.prototype, "email");
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'User password (min 8 chars, must contain uppercase, lowercase, number)',
            example: 'SecureP@ss123'
        }),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters' }),
        (0, class_validator_1.MaxLength)(128, { message: 'Password must not exceed 128 characters' }),
        (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' })
    ], RegisterDto.prototype, "password");
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'User first name',
            example: 'John'
        }),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MinLength)(2, { message: 'First name must be at least 2 characters' }),
        (0, class_validator_1.MaxLength)(50, { message: 'First name must not exceed 50 characters' })
    ], RegisterDto.prototype, "firstName");
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'User last name',
            example: 'Doe'
        }),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MinLength)(2, { message: 'Last name must be at least 2 characters' }),
        (0, class_validator_1.MaxLength)(50, { message: 'Last name must not exceed 50 characters' })
    ], RegisterDto.prototype, "lastName");
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Accept terms and conditions',
            example: true
        }),
        (0, class_validator_1.IsBoolean)()
    ], RegisterDto.prototype, "acceptTerms");
    return RegisterDto;
}());
exports.RegisterDto = RegisterDto;
/**
 * Refresh Token DTO
 */
var RefreshTokenDto = /** @class */ (function () {
    function RefreshTokenDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Refresh token',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }),
        (0, class_validator_1.IsString)()
    ], RefreshTokenDto.prototype, "refreshToken");
    return RefreshTokenDto;
}());
exports.RefreshTokenDto = RefreshTokenDto;
/**
 * Forgot Password DTO
 */
var ForgotPasswordDto = /** @class */ (function () {
    function ForgotPasswordDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'User email address',
            example: 'john@example.com'
        }),
        (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' })
    ], ForgotPasswordDto.prototype, "email");
    return ForgotPasswordDto;
}());
exports.ForgotPasswordDto = ForgotPasswordDto;
/**
 * Reset Password DTO
 */
var ResetPasswordDto = /** @class */ (function () {
    function ResetPasswordDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Password reset token'
        }),
        (0, class_validator_1.IsString)()
    ], ResetPasswordDto.prototype, "token");
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'New password',
            example: 'NewSecureP@ss123'
        }),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters' }),
        (0, class_validator_1.MaxLength)(128, { message: 'Password must not exceed 128 characters' }),
        (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' })
    ], ResetPasswordDto.prototype, "password");
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Confirm new password',
            example: 'NewSecureP@ss123'
        }),
        (0, class_validator_1.IsString)()
    ], ResetPasswordDto.prototype, "confirmPassword");
    return ResetPasswordDto;
}());
exports.ResetPasswordDto = ResetPasswordDto;
/**
 * Verify Email DTO
 */
var VerifyEmailDto = /** @class */ (function () {
    function VerifyEmailDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Email verification token'
        }),
        (0, class_validator_1.IsString)()
    ], VerifyEmailDto.prototype, "token");
    return VerifyEmailDto;
}());
exports.VerifyEmailDto = VerifyEmailDto;
/**
 * Change Password DTO
 */
var ChangePasswordDto = /** @class */ (function () {
    function ChangePasswordDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Current password'
        }),
        (0, class_validator_1.IsString)()
    ], ChangePasswordDto.prototype, "currentPassword");
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'New password',
            example: 'NewSecureP@ss123'
        }),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters' }),
        (0, class_validator_1.MaxLength)(128, { message: 'Password must not exceed 128 characters' }),
        (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, { message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' })
    ], ChangePasswordDto.prototype, "newPassword");
    __decorate([
        (0, swagger_1.ApiProperty)({
            description: 'Confirm new password'
        }),
        (0, class_validator_1.IsString)()
    ], ChangePasswordDto.prototype, "confirmPassword");
    return ChangePasswordDto;
}());
exports.ChangePasswordDto = ChangePasswordDto;

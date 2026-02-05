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
exports.__esModule = true;
exports.UserQueryDto = exports.AdminUpdateUserDto = exports.UpdateNotificationPreferencesDto = exports.UpdateProfileDto = exports.UpdateUserDto = exports.CreateUserDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var entities_1 = require("../entities");
/**
 * Create User DTO (Admin only)
 */
var CreateUserDto = /** @class */ (function () {
    function CreateUserDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'User email', example: 'john@example.com' }),
        (0, class_validator_1.IsEmail)()
    ], CreateUserDto.prototype, "email");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'User password' }),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MinLength)(8)
    ], CreateUserDto.prototype, "password");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'First name', example: 'John' }),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MinLength)(2),
        (0, class_validator_1.MaxLength)(50)
    ], CreateUserDto.prototype, "firstName");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Last name', example: 'Doe' }),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MinLength)(2),
        (0, class_validator_1.MaxLength)(50)
    ], CreateUserDto.prototype, "lastName");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'User role', "enum": entities_1.UserRole, "default": entities_1.UserRole.MEMBER }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsEnum)(entities_1.UserRole)
    ], CreateUserDto.prototype, "role");
    return CreateUserDto;
}());
exports.CreateUserDto = CreateUserDto;
/**
 * Update User DTO
 */
var UpdateUserDto = /** @class */ (function () {
    function UpdateUserDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'First name', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MinLength)(2),
        (0, class_validator_1.MaxLength)(50)
    ], UpdateUserDto.prototype, "firstName");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Last name', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MinLength)(2),
        (0, class_validator_1.MaxLength)(50)
    ], UpdateUserDto.prototype, "lastName");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Phone number', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(20)
    ], UpdateUserDto.prototype, "phone");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Timezone', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], UpdateUserDto.prototype, "timezone");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Locale', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(10)
    ], UpdateUserDto.prototype, "locale");
    return UpdateUserDto;
}());
exports.UpdateUserDto = UpdateUserDto;
/**
 * Update Profile DTO
 */
var UpdateProfileDto = /** @class */ (function () {
    function UpdateProfileDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Bio/About', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(1000)
    ], UpdateProfileDto.prototype, "bio");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Professional headline', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(255)
    ], UpdateProfileDto.prototype, "headline");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Company name', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(255)
    ], UpdateProfileDto.prototype, "company");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Job title', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(255)
    ], UpdateProfileDto.prototype, "jobTitle");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Location', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)(),
        (0, class_validator_1.MaxLength)(100)
    ], UpdateProfileDto.prototype, "location");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Website URL', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsUrl)()
    ], UpdateProfileDto.prototype, "website");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'LinkedIn profile URL', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsUrl)()
    ], UpdateProfileDto.prototype, "linkedinUrl");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Twitter/X profile URL', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsUrl)()
    ], UpdateProfileDto.prototype, "twitterUrl");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Instagram profile URL', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsUrl)()
    ], UpdateProfileDto.prototype, "instagramUrl");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Years of experience', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.Min)(0),
        (0, class_validator_1.Max)(100)
    ], UpdateProfileDto.prototype, "yearsExperience");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Specializations', required: false, type: [String] }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsArray)(),
        (0, class_validator_1.IsString)({ each: true })
    ], UpdateProfileDto.prototype, "specializations");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Certifications', required: false, type: [String] }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsArray)(),
        (0, class_validator_1.IsString)({ each: true })
    ], UpdateProfileDto.prototype, "certifications");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Industries served', required: false, type: [String] }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsArray)(),
        (0, class_validator_1.IsString)({ each: true })
    ], UpdateProfileDto.prototype, "industriesServed");
    return UpdateProfileDto;
}());
exports.UpdateProfileDto = UpdateProfileDto;
/**
 * Update Notification Preferences DTO
 */
var UpdateNotificationPreferencesDto = /** @class */ (function () {
    function UpdateNotificationPreferencesDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Email notification preferences', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsObject)()
    ], UpdateNotificationPreferencesDto.prototype, "email");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Push notification preferences', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsObject)()
    ], UpdateNotificationPreferencesDto.prototype, "push");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'SMS notification preferences', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsObject)()
    ], UpdateNotificationPreferencesDto.prototype, "sms");
    return UpdateNotificationPreferencesDto;
}());
exports.UpdateNotificationPreferencesDto = UpdateNotificationPreferencesDto;
/**
 * Admin Update User DTO
 */
var AdminUpdateUserDto = /** @class */ (function (_super) {
    __extends(AdminUpdateUserDto, _super);
    function AdminUpdateUserDto() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'User role', "enum": entities_1.UserRole, required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsEnum)(entities_1.UserRole)
    ], AdminUpdateUserDto.prototype, "role");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'User status', "enum": entities_1.UserStatus, required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsEnum)(entities_1.UserStatus)
    ], AdminUpdateUserDto.prototype, "status");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Email verified flag', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsBoolean)()
    ], AdminUpdateUserDto.prototype, "emailVerified");
    return AdminUpdateUserDto;
}((0, swagger_1.PartialType)(UpdateUserDto)));
exports.AdminUpdateUserDto = AdminUpdateUserDto;
/**
 * User Query DTO (for filtering/searching)
 */
var UserQueryDto = /** @class */ (function () {
    function UserQueryDto() {
    }
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Search query', required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsString)()
    ], UserQueryDto.prototype, "search");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Filter by role', "enum": entities_1.UserRole, required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsEnum)(entities_1.UserRole)
    ], UserQueryDto.prototype, "role");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Filter by status', "enum": entities_1.UserStatus, required: false }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsEnum)(entities_1.UserStatus)
    ], UserQueryDto.prototype, "status");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Page number', required: false, "default": 1 }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.Min)(1)
    ], UserQueryDto.prototype, "page");
    __decorate([
        (0, swagger_1.ApiProperty)({ description: 'Items per page', required: false, "default": 20 }),
        (0, class_validator_1.IsOptional)(),
        (0, class_validator_1.IsInt)(),
        (0, class_validator_1.Min)(1),
        (0, class_validator_1.Max)(100)
    ], UserQueryDto.prototype, "limit");
    return UserQueryDto;
}());
exports.UserQueryDto = UserQueryDto;

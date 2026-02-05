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
exports.UserProfile = void 0;
var typeorm_1 = require("typeorm");
var entities_1 = require("../../../common/entities");
var user_entity_1 = require("./user.entity");
/**
 * User Profile Entity
 * Extended profile information separate from core user data
 */
var UserProfile = /** @class */ (function (_super) {
    __extends(UserProfile, _super);
    function UserProfile() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    __decorate([
        (0, typeorm_1.OneToOne)(function () { return user_entity_1.User; }, { onDelete: 'CASCADE' }),
        (0, typeorm_1.JoinColumn)({ name: 'user_id' })
    ], UserProfile.prototype, "user");
    __decorate([
        (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid' })
    ], UserProfile.prototype, "userId");
    __decorate([
        (0, typeorm_1.Column)({ type: 'text', nullable: true })
    ], UserProfile.prototype, "bio");
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true })
    ], UserProfile.prototype, "headline");
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true })
    ], UserProfile.prototype, "company");
    __decorate([
        (0, typeorm_1.Column)({ name: 'job_title', type: 'varchar', length: 255, nullable: true })
    ], UserProfile.prototype, "jobTitle");
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true })
    ], UserProfile.prototype, "location");
    __decorate([
        (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true })
    ], UserProfile.prototype, "website");
    __decorate([
        (0, typeorm_1.Column)({ name: 'linkedin_url', type: 'varchar', length: 500, nullable: true })
    ], UserProfile.prototype, "linkedinUrl");
    __decorate([
        (0, typeorm_1.Column)({ name: 'twitter_url', type: 'varchar', length: 500, nullable: true })
    ], UserProfile.prototype, "twitterUrl");
    __decorate([
        (0, typeorm_1.Column)({ name: 'instagram_url', type: 'varchar', length: 500, nullable: true })
    ], UserProfile.prototype, "instagramUrl");
    __decorate([
        (0, typeorm_1.Column)({ name: 'facebook_url', type: 'varchar', length: 500, nullable: true })
    ], UserProfile.prototype, "facebookUrl");
    __decorate([
        (0, typeorm_1.Column)({ name: 'years_experience', type: 'int', nullable: true })
    ], UserProfile.prototype, "yearsExperience");
    __decorate([
        (0, typeorm_1.Column)({ name: 'specializations', type: 'simple-array', nullable: true })
    ], UserProfile.prototype, "specializations");
    __decorate([
        (0, typeorm_1.Column)({ name: 'certifications', type: 'simple-array', nullable: true })
    ], UserProfile.prototype, "certifications");
    __decorate([
        (0, typeorm_1.Column)({ name: 'industries_served', type: 'simple-array', nullable: true })
    ], UserProfile.prototype, "industriesServed");
    __decorate([
        (0, typeorm_1.Column)({ name: 'notification_preferences', type: 'jsonb', "default": {} })
    ], UserProfile.prototype, "notificationPreferences");
    __decorate([
        (0, typeorm_1.Column)({ name: 'privacy_settings', type: 'jsonb', "default": {} })
    ], UserProfile.prototype, "privacySettings");
    __decorate([
        (0, typeorm_1.Column)({ name: 'onboarding_completed', type: 'boolean', "default": false })
    ], UserProfile.prototype, "onboardingCompleted");
    __decorate([
        (0, typeorm_1.Column)({ name: 'onboarding_step', type: 'int', "default": 0 })
    ], UserProfile.prototype, "onboardingStep");
    UserProfile = __decorate([
        (0, typeorm_1.Entity)('user_profiles')
    ], UserProfile);
    return UserProfile;
}(entities_1.BaseEntity));
exports.UserProfile = UserProfile;

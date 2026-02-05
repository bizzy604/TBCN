"use strict";
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
var common_1 = require("@nestjs/common");
var supertest_1 = require("supertest");
var app_module_1 = require("../src/app.module");
describe('AuthController (e2e)', function () {
    var app;
    var accessToken;
    var refreshToken;
    var testUser = {
        email: "test-".concat(Date.now(), "@example.com"),
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        acceptTerms: true
    };
    // API base path with versioning
    var API_PREFIX = '/api/v1';
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        var moduleFixture;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testing_1.Test.createTestingModule({
                        imports: [app_module_1.AppModule]
                    }).compile()];
                case 1:
                    moduleFixture = _a.sent();
                    app = moduleFixture.createNestApplication();
                    // Apply same configuration as main.ts
                    app.setGlobalPrefix('api');
                    app.enableVersioning({
                        type: common_1.VersioningType.URI,
                        defaultVersion: '1'
                    });
                    app.useGlobalPipes(new common_1.ValidationPipe({
                        whitelist: true,
                        forbidNonWhitelisted: true,
                        transform: true,
                        transformOptions: { enableImplicitConversion: true }
                    }));
                    return [4 /*yield*/, app.init()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, 60000);
    afterAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!app) return [3 /*break*/, 2];
                    return [4 /*yield*/, app.close()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); });
    describe('/auth/register (POST)', function () {
        it('should register a new user', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/auth/register"))
                .send(testUser)
                .expect(201)
                .expect(function (res) {
                expect(res.body).toHaveProperty('message');
                expect(res.body.message).toContain('Registration successful');
            });
        });
        it('should fail with invalid email', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/auth/register"))
                .send(__assign(__assign({}, testUser), { email: 'invalid-email' }))
                .expect(400);
        });
        it('should fail with weak password', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/auth/register"))
                .send(__assign(__assign({}, testUser), { password: '123' }))
                .expect(400);
        });
        it('should fail without accepting terms', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/auth/register"))
                .send(__assign(__assign({}, testUser), { email: 'another@example.com', acceptTerms: false }))
                .expect(400);
        });
        it('should fail with missing required fields', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/auth/register"))
                .send({
                email: 'test@example.com'
            })
                .expect(400);
        });
    });
    describe('/auth/login (POST)', function () {
        it('should login with valid credentials', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/auth/login"))
                .send({
                email: testUser.email,
                password: testUser.password
            })
                .expect(200)
                .expect(function (res) {
                expect(res.body).toHaveProperty('accessToken');
                expect(res.body).toHaveProperty('refreshToken');
                expect(res.body).toHaveProperty('expiresIn');
                expect(res.body.tokenType).toBe('Bearer');
                // Store tokens for subsequent tests
                accessToken = res.body.accessToken;
                refreshToken = res.body.refreshToken;
            });
        });
        it('should fail with invalid password', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/auth/login"))
                .send({
                email: testUser.email,
                password: 'WrongPassword123'
            })
                .expect(401);
        });
        it('should fail with missing email', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/auth/login"))
                .send({
                password: testUser.password
            })
                .expect(400);
        });
    });
    describe('/auth/refresh (POST)', function () {
        it('should return new tokens for valid refresh token', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/auth/refresh"))
                .send({
                refreshToken: refreshToken
            })
                .expect(200)
                .expect(function (res) {
                expect(res.body).toHaveProperty('accessToken');
                expect(res.body).toHaveProperty('refreshToken');
            });
        });
        it('should fail with invalid refresh token', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/auth/refresh"))
                .send({
                refreshToken: 'invalid-token'
            })
                .expect(401);
        });
    });
    describe('/auth/me (GET)', function () {
        it('should return current user with valid token', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .get("".concat(API_PREFIX, "/auth/me"))
                .set('Authorization', "Bearer ".concat(accessToken))
                .expect(200)
                .expect(function (res) {
                expect(res.body).toHaveProperty('id');
                expect(res.body).toHaveProperty('email');
                expect(res.body).toHaveProperty('role');
            });
        });
        it('should fail without token', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .get("".concat(API_PREFIX, "/auth/me"))
                .expect(401);
        });
        it('should fail with invalid token', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .get("".concat(API_PREFIX, "/auth/me"))
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
    });
    describe('/auth/forgot-password (POST)', function () {
        it('should accept any email (prevents enumeration)', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/auth/forgot-password"))
                .send({
                email: 'nonexistent@example.com'
            })
                .expect(200)
                .expect(function (res) {
                expect(res.body.message).toContain('If an account with that email exists');
            });
        });
        it('should fail with invalid email format', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/auth/forgot-password"))
                .send({
                email: 'invalid-email'
            })
                .expect(400);
        });
    });
    describe('/auth/reset-password (POST)', function () {
        it('should fail if passwords do not match', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/auth/reset-password"))
                .send({
                token: 'some-token',
                password: 'NewPassword123',
                confirmPassword: 'DifferentPassword123'
            })
                .expect(400);
        });
    });
    describe('/auth/change-password (POST)', function () {
        it('should require authentication', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/auth/change-password"))
                .send({
                currentPassword: 'CurrentPass123',
                newPassword: 'NewPassword123',
                confirmPassword: 'NewPassword123'
            })
                .expect(401);
        });
        it('should fail if new passwords do not match', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/auth/change-password"))
                .set('Authorization', "Bearer ".concat(accessToken))
                .send({
                currentPassword: testUser.password,
                newPassword: 'NewPassword123',
                confirmPassword: 'DifferentPassword123'
            })
                .expect(400);
        });
    });
    describe('/auth/logout (POST)', function () {
        it('should logout successfully with valid token', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/auth/logout"))
                .set('Authorization', "Bearer ".concat(accessToken))
                .expect(200)
                .expect(function (res) {
                expect(res.body.message).toContain('Logged out');
            });
        });
        it('should fail without authentication', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/auth/logout"))
                .expect(401);
        });
    });
});

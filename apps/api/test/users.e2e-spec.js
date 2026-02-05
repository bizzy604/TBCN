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
var common_1 = require("@nestjs/common");
var supertest_1 = require("supertest");
var app_module_1 = require("../src/app.module");
describe('UsersController (e2e)', function () {
    var app;
    var accessToken;
    var testUserId;
    // API base path with versioning
    var API_PREFIX = '/api/v1';
    var testUser = {
        email: "user-".concat(Date.now(), "@example.com"),
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        acceptTerms: true
    };
    beforeAll(function () { return __awaiter(void 0, void 0, void 0, function () {
        var moduleFixture, loginRes, meRes;
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
                    // Register and login test user
                    return [4 /*yield*/, (0, supertest_1["default"])(app.getHttpServer())
                            .post("".concat(API_PREFIX, "/auth/register"))
                            .send(testUser)];
                case 3:
                    // Register and login test user
                    _a.sent();
                    return [4 /*yield*/, (0, supertest_1["default"])(app.getHttpServer())
                            .post("".concat(API_PREFIX, "/auth/login"))
                            .send({
                            email: testUser.email,
                            password: testUser.password
                        })];
                case 4:
                    loginRes = _a.sent();
                    accessToken = loginRes.body.accessToken;
                    return [4 /*yield*/, (0, supertest_1["default"])(app.getHttpServer())
                            .get("".concat(API_PREFIX, "/auth/me"))
                            .set('Authorization', "Bearer ".concat(accessToken))];
                case 5:
                    meRes = _a.sent();
                    testUserId = meRes.body.id;
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
    describe('/users/me (GET)', function () {
        it('should return current user with profile', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .get("".concat(API_PREFIX, "/users/me"))
                .set('Authorization', "Bearer ".concat(accessToken))
                .expect(200)
                .expect(function (res) {
                expect(res.body).toHaveProperty('id');
                expect(res.body).toHaveProperty('email', testUser.email);
                expect(res.body).toHaveProperty('firstName', testUser.firstName);
                expect(res.body).toHaveProperty('lastName', testUser.lastName);
            });
        });
        it('should fail without authentication', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .get("".concat(API_PREFIX, "/users/me"))
                .expect(401);
        });
    });
    describe('/users/me (PUT)', function () {
        it('should update current user', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .put("".concat(API_PREFIX, "/users/me"))
                .set('Authorization', "Bearer ".concat(accessToken))
                .send({
                firstName: 'Updated',
                lastName: 'Name'
            })
                .expect(200)
                .expect(function (res) {
                expect(res.body.firstName).toBe('Updated');
                expect(res.body.lastName).toBe('Name');
            });
        });
        it('should fail with invalid data', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .put("".concat(API_PREFIX, "/users/me"))
                .set('Authorization', "Bearer ".concat(accessToken))
                .send({
                firstName: 'A'
            })
                .expect(400);
        });
    });
    describe('/users/me/profile (PUT)', function () {
        // TODO: Profile update needs the user to exist first
        it.todo('should update user profile');
        it.todo('should validate URL fields');
        it.todo('should accept valid URLs');
    });
    describe('/users/me/avatar (POST)', function () {
        it('should require authentication', function () {
            return (0, supertest_1["default"])(app.getHttpServer())
                .post("".concat(API_PREFIX, "/users/me/avatar"))
                .expect(401);
        });
    });
    // Admin endpoints tests
    describe('Admin Endpoints', function () {
        describe('/users (GET) - Admin Only', function () {
            it('should reject non-admin users', function () {
                return (0, supertest_1["default"])(app.getHttpServer())
                    .get("".concat(API_PREFIX, "/users"))
                    .set('Authorization', "Bearer ".concat(accessToken))
                    .expect(403);
            });
        });
        describe('/users/:id (GET) - Admin Only', function () {
            it('should reject non-admin users', function () {
                return (0, supertest_1["default"])(app.getHttpServer())
                    .get("".concat(API_PREFIX, "/users/").concat(testUserId))
                    .set('Authorization', "Bearer ".concat(accessToken))
                    .expect(403);
            });
        });
        describe('/users (POST) - Admin Only', function () {
            it('should reject non-admin users', function () {
                return (0, supertest_1["default"])(app.getHttpServer())
                    .post("".concat(API_PREFIX, "/users"))
                    .set('Authorization', "Bearer ".concat(accessToken))
                    .send({
                    email: 'newuser@example.com',
                    password: 'Password123!',
                    firstName: 'New',
                    lastName: 'User'
                })
                    .expect(403);
            });
        });
        describe('/users/:id (PATCH) - Admin Only', function () {
            it('should reject non-admin users', function () {
                return (0, supertest_1["default"])(app.getHttpServer())
                    .patch("".concat(API_PREFIX, "/users/").concat(testUserId))
                    .set('Authorization', "Bearer ".concat(accessToken))
                    .send({
                    firstName: 'Changed'
                })
                    .expect(403);
            });
        });
        describe('/users/:id (DELETE) - Super Admin Only', function () {
            it('should reject non-admin users', function () {
                return (0, supertest_1["default"])(app.getHttpServer())["delete"]("".concat(API_PREFIX, "/users/").concat(testUserId))
                    .set('Authorization', "Bearer ".concat(accessToken))
                    .expect(403);
            });
        });
        describe('/users/stats (GET) - Admin Only', function () {
            it('should reject non-admin users', function () {
                return (0, supertest_1["default"])(app.getHttpServer())
                    .get("".concat(API_PREFIX, "/users/stats"))
                    .set('Authorization', "Bearer ".concat(accessToken))
                    .expect(403);
            });
        });
    });
});

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
var jwt_1 = require("@nestjs/jwt");
var config_1 = require("@nestjs/config");
var core_1 = require("@nestjs/core");
var users_controller_1 = require("./users.controller");
var users_service_1 = require("./users.service");
var entities_1 = require("./entities");
describe('UsersController', function () {
    var controller;
    var usersService;
    var mockUsersService = {
        findById: jest.fn(),
        findByIdWithProfile: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateProfile: jest.fn(),
        adminUpdate: jest.fn(),
        "delete": jest.fn(),
        updateAvatar: jest.fn(),
        getCountByRole: jest.fn()
    };
    var mockJwtService = {
        signAsync: jest.fn(),
        verifyAsync: jest.fn()
    };
    var mockConfigService = {
        get: jest.fn().mockReturnValue('test-secret')
    };
    var mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: entities_1.UserRole.MEMBER,
        status: entities_1.UserStatus.ACTIVE
    };
    var mockProfile = {
        userId: 'test-user-id',
        bio: 'Test bio',
        headline: 'Coach'
    };
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testing_1.Test.createTestingModule({
                        controllers: [users_controller_1.UsersController],
                        providers: [
                            { provide: users_service_1.UsersService, useValue: mockUsersService },
                            { provide: jwt_1.JwtService, useValue: mockJwtService },
                            { provide: config_1.ConfigService, useValue: mockConfigService },
                            core_1.Reflector,
                        ]
                    }).compile()];
                case 1:
                    module = _a.sent();
                    controller = module.get(users_controller_1.UsersController);
                    usersService = module.get(users_service_1.UsersService);
                    jest.clearAllMocks();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should be defined', function () {
        expect(controller).toBeDefined();
    });
    describe('GET /users/me', function () {
        it('should return current user with profile', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockUsersService.findByIdWithProfile.mockResolvedValueOnce(__assign(__assign({}, mockUser), { profile: mockProfile }));
                        return [4 /*yield*/, controller.getCurrentUser('test-user-id')];
                    case 1:
                        result = _a.sent();
                        expect(usersService.findByIdWithProfile).toHaveBeenCalledWith('test-user-id');
                        expect(result).toHaveProperty('profile');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('PUT /users/me', function () {
        it('should update current user', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = { firstName: 'Updated' };
                        mockUsersService.update.mockResolvedValueOnce(__assign(__assign({}, mockUser), dto));
                        return [4 /*yield*/, controller.updateCurrentUser('test-user-id', dto)];
                    case 1:
                        result = _a.sent();
                        expect(usersService.update).toHaveBeenCalledWith('test-user-id', dto);
                        expect(result.firstName).toBe('Updated');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('PUT /users/me/profile', function () {
        it('should update current user profile', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = { bio: 'New bio' };
                        mockUsersService.updateProfile.mockResolvedValueOnce(__assign(__assign({}, mockProfile), dto));
                        return [4 /*yield*/, controller.updateCurrentUserProfile('test-user-id', dto)];
                    case 1:
                        result = _a.sent();
                        expect(usersService.updateProfile).toHaveBeenCalledWith('test-user-id', dto);
                        expect(result.bio).toBe('New bio');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /users/me/avatar', function () {
        it('should upload avatar and return URL', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockFile, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockFile = {
                            buffer: Buffer.from('test'),
                            originalname: 'test.jpg',
                            mimetype: 'image/jpeg',
                            size: 1000
                        };
                        return [4 /*yield*/, controller.uploadAvatar('test-user-id', mockFile)];
                    case 1:
                        result = _a.sent();
                        expect(usersService.updateAvatar).toHaveBeenCalled();
                        expect(result).toHaveProperty('avatarUrl');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('GET /users (Admin)', function () {
        it('should return paginated users list', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockPaginatedResult, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockPaginatedResult = {
                            data: [mockUser],
                            meta: { page: 1, limit: 20, total: 1, totalPages: 1 }
                        };
                        mockUsersService.findAll.mockResolvedValueOnce(mockPaginatedResult);
                        return [4 /*yield*/, controller.findAll({ page: 1, limit: 20 })];
                    case 1:
                        result = _a.sent();
                        expect(usersService.findAll).toHaveBeenCalled();
                        expect(result.data).toHaveLength(1);
                        expect(result.meta).toBeDefined();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should filter by role', function () { return __awaiter(void 0, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = { role: entities_1.UserRole.COACH };
                        mockUsersService.findAll.mockResolvedValueOnce({ data: [], meta: {} });
                        return [4 /*yield*/, controller.findAll(query)];
                    case 1:
                        _a.sent();
                        expect(usersService.findAll).toHaveBeenCalledWith(expect.objectContaining({ role: entities_1.UserRole.COACH }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('POST /users (Admin)', function () {
        it('should create a new user', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = {
                            email: 'new@example.com',
                            password: 'Password123',
                            firstName: 'Jane',
                            lastName: 'Doe'
                        };
                        mockUsersService.create.mockResolvedValueOnce(__assign(__assign({}, dto), { id: 'new-id' }));
                        return [4 /*yield*/, controller.create(dto)];
                    case 1:
                        result = _a.sent();
                        expect(usersService.create).toHaveBeenCalledWith(dto);
                        expect(result.id).toBe('new-id');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('GET /users/stats (Admin)', function () {
        it('should return user stats by role', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockStats, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        mockStats = (_a = {},
                            _a[entities_1.UserRole.MEMBER] = 100,
                            _a[entities_1.UserRole.COACH] = 10,
                            _a[entities_1.UserRole.ADMIN] = 2,
                            _a);
                        mockUsersService.getCountByRole.mockResolvedValueOnce(mockStats);
                        return [4 /*yield*/, controller.getStats()];
                    case 1:
                        result = _b.sent();
                        expect(usersService.getCountByRole).toHaveBeenCalled();
                        expect(result).toEqual(mockStats);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('GET /users/:id (Admin)', function () {
        it('should return user by ID with profile', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockUsersService.findByIdWithProfile.mockResolvedValueOnce(__assign(__assign({}, mockUser), { profile: mockProfile }));
                        return [4 /*yield*/, controller.findById('test-user-id')];
                    case 1:
                        result = _a.sent();
                        expect(usersService.findByIdWithProfile).toHaveBeenCalledWith('test-user-id');
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('PATCH /users/:id (Admin)', function () {
        it('should update user as admin', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = { role: entities_1.UserRole.COACH };
                        mockUsersService.adminUpdate.mockResolvedValueOnce(__assign(__assign({}, mockUser), dto));
                        return [4 /*yield*/, controller.adminUpdate('test-user-id', dto)];
                    case 1:
                        result = _a.sent();
                        expect(usersService.adminUpdate).toHaveBeenCalledWith('test-user-id', dto);
                        expect(result.role).toBe(entities_1.UserRole.COACH);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('DELETE /users/:id (Admin)', function () {
        it('should delete user', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockUsersService["delete"].mockResolvedValueOnce(undefined);
                        return [4 /*yield*/, controller["delete"]('test-user-id')];
                    case 1:
                        _a.sent();
                        expect(usersService["delete"]).toHaveBeenCalledWith('test-user-id');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

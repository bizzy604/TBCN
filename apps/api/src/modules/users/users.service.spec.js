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
var typeorm_1 = require("@nestjs/typeorm");
var event_emitter_1 = require("@nestjs/event-emitter");
var users_service_1 = require("./users.service");
var entities_1 = require("./entities");
var common_1 = require("@nestjs/common");
describe('UsersService', function () {
    var service;
    var userRepository;
    var profileRepository;
    var eventEmitter;
    var mockUserRepository = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        update: jest.fn(),
        createQueryBuilder: jest.fn()
    };
    var mockProfileRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn()
    };
    var mockEventEmitter = {
        emit: jest.fn()
    };
    var mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: entities_1.UserRole.MEMBER,
        status: entities_1.UserStatus.ACTIVE,
        deletedAt: null
    };
    beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        var module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, testing_1.Test.createTestingModule({
                        providers: [
                            users_service_1.UsersService,
                            { provide: (0, typeorm_1.getRepositoryToken)(entities_1.User), useValue: mockUserRepository },
                            { provide: (0, typeorm_1.getRepositoryToken)(entities_1.UserProfile), useValue: mockProfileRepository },
                            { provide: event_emitter_1.EventEmitter2, useValue: mockEventEmitter },
                        ]
                    }).compile()];
                case 1:
                    module = _a.sent();
                    service = module.get(users_service_1.UsersService);
                    userRepository = module.get((0, typeorm_1.getRepositoryToken)(entities_1.User));
                    profileRepository = module.get((0, typeorm_1.getRepositoryToken)(entities_1.UserProfile));
                    eventEmitter = module.get(event_emitter_1.EventEmitter2);
                    jest.clearAllMocks();
                    return [2 /*return*/];
            }
        });
    }); });
    it('should be defined', function () {
        expect(service).toBeDefined();
    });
    describe('findById', function () {
        it('should return a user when found', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
                        return [4 /*yield*/, service.findById('test-user-id')];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual(mockUser);
                        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                            where: { id: 'test-user-id', deletedAt: expect.any(Object) }
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw NotFoundException when user not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockUserRepository.findOne.mockResolvedValueOnce(null);
                        return [4 /*yield*/, expect(service.findById('non-existent-id')).rejects.toThrow(common_1.NotFoundException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('findByEmail', function () {
        it('should return user when found', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
                        return [4 /*yield*/, service.findByEmail('test@example.com')];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual(mockUser);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should return null when not found', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockUserRepository.findOne.mockResolvedValueOnce(null);
                        return [4 /*yield*/, service.findByEmail('nonexistent@example.com')];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeNull();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should normalize email to lowercase', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
                        return [4 /*yield*/, service.findByEmail('TEST@EXAMPLE.COM')];
                    case 1:
                        _a.sent();
                        expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                            where: { email: 'test@example.com', deletedAt: expect.any(Object) }
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('create', function () {
        it('should create a new user successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
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
                        mockUserRepository.findOne.mockResolvedValueOnce(null); // No existing user
                        mockUserRepository.create.mockReturnValueOnce(__assign(__assign({}, dto), { id: 'new-id' }));
                        mockUserRepository.save.mockResolvedValueOnce(__assign(__assign({}, dto), { id: 'new-id' }));
                        mockProfileRepository.create.mockReturnValueOnce({ userId: 'new-id' });
                        mockProfileRepository.save.mockResolvedValueOnce({ userId: 'new-id' });
                        return [4 /*yield*/, service.create(dto)];
                    case 1:
                        result = _a.sent();
                        expect(result.id).toBe('new-id');
                        expect(mockEventEmitter.emit).toHaveBeenCalledWith('user.created', expect.objectContaining({ userId: 'new-id' }));
                        return [2 /*return*/];
                }
            });
        }); });
        it('should throw ConflictException if email already exists', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = {
                            email: 'existing@example.com',
                            password: 'Password123',
                            firstName: 'Jane',
                            lastName: 'Doe'
                        };
                        mockUserRepository.findOne.mockResolvedValueOnce(mockUser); // Existing user
                        return [4 /*yield*/, expect(service.create(dto)).rejects.toThrow(common_1.ConflictException)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('update', function () {
        it('should update user successfully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = { firstName: 'Updated' };
                        mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
                        mockUserRepository.save.mockResolvedValueOnce(__assign(__assign({}, mockUser), dto));
                        return [4 /*yield*/, service.update('test-user-id', dto)];
                    case 1:
                        result = _a.sent();
                        expect(result.firstName).toBe('Updated');
                        expect(mockEventEmitter.emit).toHaveBeenCalledWith('user.updated', expect.objectContaining({ userId: 'test-user-id' }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('updateProfile', function () {
        it('should update existing profile', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockProfile, dto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockProfile = { userId: 'test-user-id', bio: 'Old bio' };
                        dto = { bio: 'New bio' };
                        mockProfileRepository.findOne.mockResolvedValueOnce(mockProfile);
                        mockProfileRepository.save.mockResolvedValueOnce(__assign(__assign({}, mockProfile), dto));
                        return [4 /*yield*/, service.updateProfile('test-user-id', dto)];
                    case 1:
                        result = _a.sent();
                        expect(result.bio).toBe('New bio');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should create profile if it does not exist', function () { return __awaiter(void 0, void 0, void 0, function () {
            var dto, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dto = { bio: 'New bio' };
                        mockProfileRepository.findOne.mockResolvedValueOnce(null);
                        mockProfileRepository.create.mockReturnValueOnce({ userId: 'test-user-id' });
                        mockProfileRepository.save.mockResolvedValueOnce({ userId: 'test-user-id', bio: 'New bio' });
                        return [4 /*yield*/, service.updateProfile('test-user-id', dto)];
                    case 1:
                        result = _a.sent();
                        expect(mockProfileRepository.create).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('delete', function () {
        it('should soft delete user', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
                        mockUserRepository.save.mockResolvedValueOnce(__assign(__assign({}, mockUser), { deletedAt: new Date(), status: entities_1.UserStatus.DEACTIVATED }));
                        return [4 /*yield*/, service["delete"]('test-user-id')];
                    case 1:
                        _a.sent();
                        expect(mockUserRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                            status: entities_1.UserStatus.DEACTIVATED
                        }));
                        expect(mockEventEmitter.emit).toHaveBeenCalledWith('user.deleted', expect.objectContaining({ userId: 'test-user-id' }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('verifyEmail', function () {
        it('should verify email and activate user', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockUserRepository.findOne.mockResolvedValueOnce(mockUser);
                        mockUserRepository.save.mockResolvedValueOnce(__assign(__assign({}, mockUser), { emailVerified: true, status: entities_1.UserStatus.ACTIVE }));
                        return [4 /*yield*/, service.verifyEmail('test-user-id')];
                    case 1:
                        _a.sent();
                        expect(mockUserRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                            emailVerified: true,
                            status: entities_1.UserStatus.ACTIVE,
                            emailVerificationToken: null
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('updateLastLogin', function () {
        it('should update last login info', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.updateLastLogin('test-user-id', '192.168.1.1')];
                    case 1:
                        _a.sent();
                        expect(mockUserRepository.update).toHaveBeenCalledWith('test-user-id', expect.objectContaining({
                            lastLoginIp: '192.168.1.1',
                            failedLoginAttempts: 0,
                            lockedUntil: null
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('incrementFailedAttempts', function () {
        it('should lock account after 5 failed attempts', function () { return __awaiter(void 0, void 0, void 0, function () {
            var userWith4Attempts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userWith4Attempts = __assign(__assign({}, mockUser), { failedLoginAttempts: 4 });
                        mockUserRepository.findOne.mockResolvedValueOnce(userWith4Attempts);
                        mockUserRepository.save.mockResolvedValueOnce(__assign(__assign({}, userWith4Attempts), { failedLoginAttempts: 5, lockedUntil: expect.any(Date) }));
                        return [4 /*yield*/, service.incrementFailedAttempts('test-user-id')];
                    case 1:
                        _a.sent();
                        expect(mockUserRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                            failedLoginAttempts: 5
                        }));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

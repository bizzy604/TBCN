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
exports.CacheService = void 0;
var common_1 = require("@nestjs/common");
var cache_manager_1 = require("@nestjs/cache-manager");
/**
 * Cache Service
 * Provides a clean interface for cache operations
 */
var CacheService = /** @class */ (function () {
    function CacheService(cache) {
        this.cache = cache;
    }
    /**
     * Get a cached value
     */
    CacheService.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.cache.get(key)];
            });
        });
    };
    /**
     * Set a cached value
     * @param key Cache key
     * @param value Value to cache
     * @param ttl Time to live in seconds (optional)
     */
    CacheService.prototype.set = function (key, value, ttl) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cache.set(key, value, ttl ? ttl * 1000 : undefined)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a cached value
     */
    CacheService.prototype.del = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cache.del(key)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete all cached values matching a pattern
     */
    CacheService.prototype.delByPattern = function (pattern) {
        return __awaiter(this, void 0, void 0, function () {
            var keys;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cache.store.keys(pattern)];
                    case 1:
                        keys = _a.sent();
                        if (!(keys && keys.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, Promise.all(keys.map(function (key) { return _this.cache.del(key); }))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get or set cache (cache-aside pattern)
     * @param key Cache key
     * @param factory Function to fetch value if not cached
     * @param ttl Time to live in seconds
     */
    CacheService.prototype.getOrSet = function (key, factory, ttl) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(key)];
                    case 1:
                        cached = _a.sent();
                        if (cached !== undefined) {
                            return [2 /*return*/, cached];
                        }
                        return [4 /*yield*/, factory()];
                    case 2:
                        value = _a.sent();
                        return [4 /*yield*/, this.set(key, value, ttl)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, value];
                }
            });
        });
    };
    /**
     * Clear the entire cache
     */
    CacheService.prototype.reset = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.cache.reset()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // ============================================
    // Common Cache Key Generators
    // ============================================
    CacheService.userKey = function (userId) {
        return "user:".concat(userId);
    };
    CacheService.userProfileKey = function (userId) {
        return "user:".concat(userId, ":profile");
    };
    CacheService.programKey = function (programId) {
        return "program:".concat(programId);
    };
    CacheService.programCatalogKey = function (page, limit) {
        return "programs:catalog:".concat(page, ":").concat(limit);
    };
    CacheService.enrollmentKey = function (enrollmentId) {
        return "enrollment:".concat(enrollmentId);
    };
    CacheService.sessionKey = function (sessionId) {
        return "session:".concat(sessionId);
    };
    CacheService = __decorate([
        (0, common_1.Injectable)(),
        __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER))
    ], CacheService);
    return CacheService;
}());
exports.CacheService = CacheService;

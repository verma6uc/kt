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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var faker_1 = require("@faker-js/faker");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var superAdmin, existingCount, companiesNeeded, i, companyName, identifier, industry, status_1, type, company, finalCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.user.upsert({
                        where: { email: 'admin@yuvi.io' },
                        update: {},
                        create: {
                            email: 'admin@yuvi.io',
                            name: 'Super Admin',
                            password: '$2a$10$K8GpwZ1V3.Ck.F4KEVvEZ.YX8YG0oq3vkGa/VC.g24vH/Jk7hZEuy', // Password123!
                            role: 'super_admin',
                            status: 'active',
                            company: {
                                create: {
                                    name: 'Yuvi Technologies',
                                    identifier: 'yuvi',
                                    type: 'enterprise',
                                    status: 'active',
                                    industry: 'technology'
                                }
                            }
                        }
                    })];
                case 1:
                    superAdmin = _a.sent();
                    console.log('Ensured super admin exists:', superAdmin.email);
                    return [4 /*yield*/, prisma.company.count()];
                case 2:
                    existingCount = _a.sent();
                    companiesNeeded = Math.max(0, 100 - existingCount);
                    console.log("Creating ".concat(companiesNeeded, " additional companies..."));
                    i = 0;
                    _a.label = 3;
                case 3:
                    if (!(i < companiesNeeded)) return [3 /*break*/, 6];
                    companyName = faker_1.faker.company.name();
                    identifier = faker_1.faker.helpers.slugify(companyName).toLowerCase();
                    industry = faker_1.faker.helpers.arrayElement([
                        'technology',
                        'healthcare',
                        'finance',
                        'education',
                        'manufacturing',
                        'retail'
                    ]);
                    status_1 = faker_1.faker.helpers.arrayElement([
                        'active',
                        'pending_setup',
                        'suspended',
                        'inactive'
                    ]);
                    type = faker_1.faker.helpers.arrayElement([
                        'enterprise',
                        'small_business',
                        'startup'
                    ]);
                    return [4 /*yield*/, prisma.company.create({
                            data: {
                                name: companyName,
                                identifier: identifier,
                                industry: industry,
                                status: status_1,
                                type: type,
                                // Create 27 users per company
                                users: {
                                    create: Array.from({ length: 27 }, function () { return ({
                                        name: faker_1.faker.person.fullName(),
                                        email: faker_1.faker.internet.email(),
                                        password: '$2a$10$K8GpwZ1V3.Ck.F4KEVvEZ.YX8YG0oq3vkGa/VC.g24vH/Jk7hZEuy', // Password123!
                                        role: faker_1.faker.helpers.arrayElement(['company_admin', 'company_admin']),
                                        status: 'active'
                                    }); })
                                },
                                // Create API metrics
                                api_metrics: {
                                    create: Array.from({ length: faker_1.faker.number.int({ min: 40, max: 90 }) }, function () { return ({
                                        endpoint: faker_1.faker.helpers.arrayElement([
                                            '/api/users',
                                            '/api/products',
                                            '/api/orders',
                                            '/api/customers',
                                            '/api/analytics'
                                        ]),
                                        method: faker_1.faker.helpers.arrayElement(['GET', 'POST', 'PUT', 'DELETE']),
                                        status_code: faker_1.faker.helpers.arrayElement([200, 201, 400, 401, 403, 404, 500]),
                                        duration_ms: faker_1.faker.number.int({ min: 50, max: 2000 }),
                                        timestamp: faker_1.faker.date.recent({ days: 30 })
                                    }); })
                                },
                                // Create system metrics
                                system_metrics: {
                                    create: Array.from({ length: 30 }, function () { return ({
                                        metric_type: faker_1.faker.helpers.arrayElement(['cpu', 'memory', 'disk', 'network']),
                                        value: faker_1.faker.number.float({ min: 0, max: 100, fractionDigits: 2 }),
                                        unit: faker_1.faker.helpers.arrayElement(['percentage', 'bytes', 'ms']),
                                        timestamp: faker_1.faker.date.recent({ days: 30 })
                                    }); })
                                },
                                // Create company health records
                                company_health: {
                                    create: {
                                        status: faker_1.faker.helpers.arrayElement(['healthy', 'warning', 'critical']),
                                        error_rate: faker_1.faker.number.float({ min: 0, max: 5, fractionDigits: 2 }),
                                        avg_response_time: faker_1.faker.number.float({ min: 50, max: 500, fractionDigits: 2 }),
                                        uptime_percentage: faker_1.faker.number.float({ min: 95, max: 100, fractionDigits: 2 }),
                                        active_users: faker_1.faker.number.int({ min: 10, max: 100 }),
                                        critical_issues: faker_1.faker.number.int({ min: 0, max: 5 }),
                                        last_check: faker_1.faker.date.recent({ days: 1 })
                                    }
                                }
                            }
                        })];
                case 4:
                    company = _a.sent();
                    console.log("Created company ".concat(i + 1, "/").concat(companiesNeeded, ":"), company.name);
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6: return [4 /*yield*/, prisma.company.count()];
                case 7:
                    finalCount = _a.sent();
                    console.log("Seed completed. Total companies: ".concat(finalCount));
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });

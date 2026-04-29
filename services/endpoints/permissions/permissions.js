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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePermission = exports.updatePermission = exports.createPermission = exports.getPermission = exports.getPermissions = void 0;
var PERMISSIONS_ENDPOINT = "/api/permissions";
var getAuthToken = function () {
    var _a, _b;
    if (typeof window === "undefined")
        return null;
    return (localStorage.getItem("token") ||
        ((_a = document.cookie
            .split("; ")
            .find(function (row) { return row.startsWith("token="); })) === null || _a === void 0 ? void 0 : _a.split("=")[1]) ||
        ((_b = document.cookie
            .split("; ")
            .find(function (row) { return row.startsWith("ippis_token="); })) === null || _b === void 0 ? void 0 : _b.split("=")[1]) ||
        null);
};
var getResponseMessage = function (text) {
    var trimmed = text.trim();
    if (!trimmed)
        return null;
    if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
        return "Unexpected HTML response from permissions API";
    }
    try {
        var parsed = JSON.parse(trimmed);
        return parsed.message || parsed.error || trimmed;
    }
    catch (_a) {
        return trimmed;
    }
};
var request = function (input, init) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, token, response, text, contentType, isJsonResponse, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                headers = new Headers(init === null || init === void 0 ? void 0 : init.headers);
                headers.set("accept", "application/json");
                token = getAuthToken();
                if (token && !headers.has("authorization")) {
                    headers.set("authorization", "Bearer ".concat(token));
                }
                return [4 /*yield*/, fetch(input, __assign(__assign({}, init), { headers: headers, credentials: "include", cache: "no-store" }))];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.text()];
            case 2:
                text = _a.sent();
                contentType = response.headers.get("content-type") || "";
                isJsonResponse = contentType.includes("application/json") || contentType.includes("+json");
                if (!text.trim()) {
                    if (!response.ok) {
                        throw new Error("Request failed with status ".concat(response.status));
                    }
                    return [2 /*return*/, {}];
                }
                if (!response.ok) {
                    throw new Error(getResponseMessage(text) || "Request failed");
                }
                if (!isJsonResponse) {
                    throw new Error(getResponseMessage(text) || "Unexpected non-JSON response");
                }
                data = JSON.parse(text);
                return [2 /*return*/, data];
        }
    });
}); };
var getPermissions = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, request(PERMISSIONS_ENDPOINT)];
    });
}); };
exports.getPermissions = getPermissions;
var getPermission = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var query;
    return __generator(this, function (_a) {
        query = new URLSearchParams({ id: String(id) });
        return [2 /*return*/, request("".concat(PERMISSIONS_ENDPOINT, "?").concat(query.toString()))];
    });
}); };
exports.getPermission = getPermission;
var createPermission = function (payload) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, request(PERMISSIONS_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })];
    });
}); };
exports.createPermission = createPermission;
var updatePermission = function (payload) { return __awaiter(void 0, void 0, void 0, function () {
    var id, body, query;
    return __generator(this, function (_a) {
        id = payload.id, body = __rest(payload, ["id"]);
        query = new URLSearchParams({ id: String(id) });
        return [2 /*return*/, request("".concat(PERMISSIONS_ENDPOINT, "?").concat(query.toString()), {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(__assign({ id: id }, body)),
            })];
    });
}); };
exports.updatePermission = updatePermission;
var deletePermission = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var query;
    return __generator(this, function (_a) {
        query = new URLSearchParams({ id: String(id) });
        return [2 /*return*/, request("".concat(PERMISSIONS_ENDPOINT, "?").concat(query.toString()), {
                method: "DELETE",
            })];
    });
}); };
exports.deletePermission = deletePermission;

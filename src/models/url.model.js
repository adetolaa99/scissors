"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.URLModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const urlSchema = new mongoose_1.default.Schema({
    longURL: { type: String, required: true },
    shortCode: { type: String, required: true, unique: true },
    customDomain: { type: String },
    createdAt: { type: Date, default: Date.now },
    clicks: { type: Number, default: 0 },
});
exports.URLModel = mongoose_1.default.model("URL", urlSchema);

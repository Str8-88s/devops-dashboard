"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const config_1 = require("prisma/config");
const isTest = process.env["NODE_ENV"] === "test";
exports.default = (0, config_1.defineConfig)({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: isTest
            ? process.env["TEST_DATABASE_URL"] ?? ""
            : process.env["DATABASE_URL"] ?? "",
    },
});

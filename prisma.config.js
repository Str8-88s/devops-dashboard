require("dotenv/config");
const { defineConfig } = require("prisma/config");

const isTest = process.env["NODE_ENV"] === "test";

module.exports = defineConfig({
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
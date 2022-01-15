import { DatabaseConfig } from "./DatabaseConfig";
import { Sequelize } from "sequelize";

export let sequelize: Sequelize;

const config = new DatabaseConfig();
sequelize = new Sequelize({
  database: config.name,
  username: config.user,
  password: config.password,
  host: config.host,
  port: config.port,
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl:
      process.env.ENV === "production"
        ? {
            require: true,
            rejectUnauthorized: false,
          }
        : null,
  },
});

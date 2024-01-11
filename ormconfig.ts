import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { registerAs } from "@nestjs/config";
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from "typeorm";

dotenvConfig({ path: '../.env' });

const config = {
  namingStrategy: new SnakeNamingStrategy(),

  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_POSTGRES_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  name: 'default',
  entities: [
    'dist/src/**/*.entity.{ts,js}'
    // 'src/**/*.entity.{ts,js}' // Use for seeding
  ],
  synchronize: true,
  migrations: ['dist/src/migrations/**/*.{ts,js}'],
  migrationsTableName: "migrations_typeorm",
  migrationsRun: true
};

export default registerAs('typeorm', () => config)
export const connectionSource = new DataSource(config as DataSourceOptions);
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'better-sqlite3',
  database: '../vendure.sqlite',
  entities: [
    'node_modules/@vendure/core/dist/entity/**/*.js'
  ],
  migrations: ['src/migrations/*.{js,ts}'],
  synchronize: false,
  logging: false,
});

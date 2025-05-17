import { VendureConfig, NativeAuthenticationStrategy } from '@vendure/core';
import 'dotenv/config';
import path from 'path';

export const config: VendureConfig = {
  apiOptions: {
    port: +process.env.PORT || 3000,
    cors: {
      origin: ['https://sveltekit-vendure-storefront.vercel.app'],
      credentials: true,
    },
    shopApiPath: 'shop-api',
    adminApiPath: 'admin-api',
  },
  authOptions: {
    tokenMethod: ['cookie'],
    shopAuthenticationStrategy: [new NativeAuthenticationStrategy()],
    cookieOptions: {
      secret: process.env.COOKIE_SECRET,
      sameSite: 'none',
      secure: true,
    },
  },
    dbConnectionOptions: {
        type: 'better-sqlite3',
        // See the README.md "Migrations" section for an explanation of
        // the `synchronize` and `migrations` options.
        synchronize: false,
        migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
        logging: false,
        database: path.join(__dirname, '../vendure.sqlite'),
    },
  paymentOptions: { paymentMethodHandlers: [] },
  plugins: [],
};

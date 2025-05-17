import { VendureConfig, NativeAuthenticationStrategy } from '@vendure/core';

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
    synchronize: true,
    database: ':memory:',
  },
  paymentOptions: { paymentMethodHandlers: [] },
  plugins: [],
};

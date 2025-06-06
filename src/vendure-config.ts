import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSearchPlugin,
    VendureConfig,
} from '@vendure/core';
import { WishlistProductsPlugin } from './plugins/wishlist-products.plugin';
import { defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import 'dotenv/config';
import path from 'path';
import { LanguageCode } from '@vendure/common/lib/generated-types';

const IS_DEV = process.env.APP_ENV === 'dev';
const serverPort = +process.env.PORT || 3000;

export const config: VendureConfig = {
    apiOptions: {
        port: +process.env.PORT || 3000,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        cors: {
            origin: ['http://localhost:5173', 'https://sveltekit-vendure-storefront.vercel.app'],
            credentials: true, // if you use cookies/auth
            allowedHeaders: ['Content-Type', 'Authorization'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          },
        // The following options are useful in development mode,
        // but are best turned off for production for security
        // reasons.
        ...(IS_DEV ? {
            adminApiPlayground: {
                settings: { 'request.credentials': 'include' },
            },
            adminApiDebug: true,
            shopApiPlayground: {
                settings: { 'request.credentials': 'include' },
            },
            shopApiDebug: true,
        } : {}),
    },
    authOptions: {
        tokenMethod: 'bearer',
        superadminCredentials: {
            identifier: process.env.SUPERADMIN_USERNAME,
            password: process.env.SUPERADMIN_PASSWORD,
        },
        cookieOptions: {        
          secret: process.env.COOKIE_SECRET,
          maxAge: 60 * 60 * 24 * 7, // 30 days (in seconds)
           sameSite: 'none',   // <--- required for cross-site cookies
           secure: true, 
           path: '/',
        //   sameSite: 'lax',
        //   secure: false,      
        },
    },
    // dbConnectionOptions: {
    //     type: 'better-sqlite3',
    //     // See the README.md "Migrations" section for an explanation of
    //     // the `synchronize` and `migrations` options.
    //     synchronize: false,
    //     migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
    //     logging: false,
    //     database: path.join(__dirname, '../vendure.sqlite'),
    // },
    dbConnectionOptions: {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        synchronize: true,
      },
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    // When adding or altering custom field definitions, the database will
    // need to be updated. See the "Migrations" section in README.md.
    customFields: {
        Customer: [
            {
                name: 'wishlistProductIds',
                type: 'string',
                list: true,
                public: true,
                label: [{ languageCode: LanguageCode.en, value: 'Wishlist Product IDs' }],
            },
        ],
    },
    plugins: [
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
            // For local dev, the correct value for assetUrlPrefix should
            // be guessed correctly, but for production it will usually need
            // to be set manually to match your production url.
            assetUrlPrefix: IS_DEV ? undefined : 'https://avifstudio.com/vendure/assets/',
        }),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
        EmailPlugin.init({
            devMode: true,
            outputPath: path.join(__dirname, '../static/email/test-emails'),
            route: 'mailbox',
            handlers: defaultEmailHandlers,
            templateLoader: new FileBasedTemplateLoader(path.join(__dirname, '../static/email/templates')),
            globalTemplateVars: {
                // The following variables will change depending on your storefront implementation.
                // Here we are assuming a storefront running at http://localhost:8080.
                fromAddress: '"example" <noreply@example.com>',
                verifyEmailAddressUrl: 'http://localhost:5173/verify',
                passwordResetUrl: 'http://localhost:5173/auth',
                changeEmailAddressUrl: 'http://localhost:5173/account'
            },
        }),
        AdminUiPlugin.init({
            route: 'admin',
            port: serverPort + 2,
            adminUiConfig: {
                apiPort: serverPort,
            },
        }),
        WishlistProductsPlugin,
    ],
};

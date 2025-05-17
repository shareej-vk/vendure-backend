import { Customer } from '@vendure/core';

declare module '@vendure/core' {
  interface CustomCustomerFields {
    wishlistProductIds?: string[];
  }
}
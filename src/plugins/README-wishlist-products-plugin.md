# Vendure Custom Shop API: `wishlistProducts`

## Purpose
Fetch multiple products by an array of IDs in a single, efficient Shop API call.
This is ideal for wishlist, "compare", or bulk product detail features in your storefront.

---

## How It Was Implemented

### 1. Custom Plugin
- File: `src/plugins/wishlist-products.plugin.ts`
- Extends the Shop API with a new query:
  ```graphql
  wishlistProducts(ids: [ID!]!): [Product!]!
  ```

### 2. GraphQL Schema Extension
- Adds to the Shop API schema:
  ```graphql
  extend type Query {
    wishlistProducts(ids: [ID!]!): [Product!]!
  }
  ```

### 3. Resolver Implementation
- Takes an array of product IDs, returns the corresponding Product entities.
- Uses Vendure’s `ProductService.findOne(ctx, id)` for each ID, preserving order and filtering out invalid IDs.

  ```typescript
  import { Resolver, Args, Query } from '@nestjs/graphql';
  import { ProductService, Ctx, RequestContext } from '@vendure/core';

  @Resolver()
  class WishlistProductsResolver {
    constructor(private productService: ProductService) {}

    @Query()
    async wishlistProducts(
      @Ctx() ctx: RequestContext,
      @Args('ids', { type: () => [String] }) ids: string[]
    ) {
      const products = await Promise.all(ids.map(id => this.productService.findOne(ctx, id)));
      return products.filter(Boolean);
    }
  }
  ```

### 4. Plugin Registration
- Registered in `src/vendure-config.ts`:
  ```typescript
  import { WishlistProductsPlugin } from './plugins/wishlist-products.plugin';

  // ...
  plugins: [
    // ...other plugins
    WishlistProductsPlugin,
  ],
  ```

### 5. Restart Server
- After adding and registering the plugin, restart the Vendure server to apply changes.

---

## Usage Example

**GraphQL Query:**
```graphql
query GetWishlistProducts($ids: [ID!]!) {
  wishlistProducts(ids: $ids) {
    id
    name
    slug
    description
    featuredAsset { preview }
    price { ... on SinglePrice { value } }
    priceWithTax { ... on SinglePrice { value } }
    currencyCode
  }
}
```

**Variables:**
```json
{
  "ids": ["10", "8", "5"]
}
```

---

## Benefits
- Only one API call for any wishlist size.
- Returns full product details for all requested IDs.
- Scalable and efficient—no need for multiple round-trips from the frontend.

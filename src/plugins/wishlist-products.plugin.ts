import { PluginCommonModule, VendurePlugin, ProductService, Ctx, RequestContext, CustomerService, Customer } from '@vendure/core';
import { gql } from 'graphql-tag';
import { Resolver, Args, Query, Mutation } from '@nestjs/graphql';

@Resolver()
class WishlistProductsResolver {
  constructor(
    private productService: ProductService,
    private customerService: CustomerService
  ) {}

  @Query()
  async wishlistProducts(
    @Ctx() ctx: RequestContext,
    @Args('ids', { type: () => [String] }) ids: string[]
  ) {
    const products = await Promise.all(ids.map(id => this.productService.findOne(ctx, id)));
    return products.filter(Boolean);
  }

  @Mutation()
  async addProductToWishlist(
    @Ctx() ctx: RequestContext,
    @Args('productId', { type: () => String }) productId: string
  ) {
    const userId = ctx.activeUserId;
    if (!userId) {
      throw new Error('No active user');
    }
    const customer = await this.customerService.findOneByUserId(ctx, userId);
    if (!customer) {
      throw new Error('No customer found for current user');
    }

    const wishlist = customer.customFields?.wishlistProductIds ?? [];
    if (!wishlist.includes(productId)) {
      const updatedWishlist = [...wishlist, productId];
      await this.customerService.update(ctx, {
        id: customer.id as string,
        customFields: { wishlistProductIds: updatedWishlist }
      });
    }
    return this.customerService.findOneByUserId(ctx, userId);
  }

  @Mutation()
  async removeProductFromWishlist(
    @Ctx() ctx: RequestContext,
    @Args('productId', { type: () => String }) productId: string
  ) {
    const userId = ctx.activeUserId;
    if (!userId) {
      throw new Error('No active user');
    }
    const customer = await this.customerService.findOneByUserId(ctx, userId);
    if (!customer) {
      throw new Error('No customer found for current user');
    }

    const wishlist: string[] = customer.customFields?.wishlistProductIds ?? [];
    const updatedWishlist = wishlist.filter(id => id !== productId);
    await this.customerService.update(ctx, {
      id: customer.id as string,
      customFields: { wishlistProductIds: updatedWishlist }
    });
    return this.customerService.findOneByUserId(ctx, userId);
  }
}

@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [WishlistProductsResolver],
  shopApiExtensions: {
    schema: gql`
      extend type Query {
        wishlistProducts(ids: [ID!]!): [Product!]!
      }
      extend type Mutation {
        addProductToWishlist(productId: String!): Customer!
        removeProductFromWishlist(productId: String!): Customer!
      }
    `,
    resolvers: [WishlistProductsResolver],
  },
})
export class WishlistProductsPlugin {}

import { Injectable } from '@nestjs/common';

// import { v4 } from 'uuid';
import { Client } from 'pg';

import { Cart } from '../models';
import { dbOptions } from '@db/config';

const client = new Client(dbOptions);

const status = {
  open: 'OPEN',
  ordered: 'ORDERED',
}

@Injectable()
export class CartService {
  // private userCarts: Record<string, Cart> = {};

  async findByUserId(userId: string): Promise<Cart> {
    await client.connect();

    try {
      const ddlResult = await client.query(`select * from carts where user_id='${userId}'`);
      console.log('[cartService: findByUserId] ddlResult: ', ddlResult);
      return ddlResult;
    } catch (error) {
      console.error('[findByUserId] error: ', error)
    } finally {
      client.end();
    }
  }

  async createByUserId(userId: string): Promise<Cart> {
    const createdAt = new Date();
    await client.connect();

    try {
      const ddlResult = await client.query(`insert into carts (user_id, created_at, updated_at, status)
      values ('${userId}', '${createdAt}', '${createdAt}', '${status.open}')`);
      console.log('[cartService: createByUserId] ddlResult: ', ddlResult);
      return ddlResult;
    } catch (error) {
      console.error('[createByUserId] error: ', error)
    } finally {
      client.end();
    }
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    await client.connect();

    try {
      let ddlResult = await client.query(`select * from carts where user_id='${userId}'`);

      if (!ddlResult) {
        const createdAt = new Date();
        ddlResult = await client.query(`insert into carts (user_id, created_at, updated_at, status)
        values ('${userId}', '${createdAt}', '${createdAt}', '${status.open}')`);
      }
      console.log('[cartService: findOrCreateByUserId] ddlResult: ', ddlResult);
      return ddlResult;
    } catch (error) {
      console.error('[findOrCreateByUserId] error: ', error)
    } finally {
      client.end();
    }
  }

  async updateByUserId(userId: string, { items }: Cart): Promise<Cart> {
    const { id, ...rest } = await this.findOrCreateByUserId(userId);

    await client.connect();

    try {
      for (const item of items) {
        const ddlResult = await client.query(`update cart_items 
            set product_id=${item.product.id}, count=${item.count}  
            where cart_id='${id}'`);
      }
      const ddlResult = await client.query(`update carts set updated_at=${new Date()} where id='${id}'`);
      console.log('[cartService: updateByUserId] ddlResult: ', ddlResult);
      return ddlResult;
    } catch (error) {
      console.error('[findOrCreateByUserId] error: ', error)
    } finally {
      client.end();
    }
  }

  async removeByUserId(userId): Promise<void> {
    await client.connect();

    try {
      const ddlResult = await client.query(`delete from carts where user_id='${userId}'`);

      console.log('[cartService: removeByUserId] ddlResult: ', ddlResult);
      return ddlResult;
    } catch (error) {
      console.error('[removeByUserId] error: ', error)
    } finally {
      client.end();
    }
  }

}

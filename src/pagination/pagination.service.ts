/**
 * We allow ts-ignore on this file only to prevent the required use of transformer.
 *
 * Try disabling the ignore and fix the typing issue if you feel enclined to ;).
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Injectable } from '@nestjs/common';

import { zip } from 'lodash';
import { SelectQueryBuilder } from 'typeorm';

import { Node } from '@/node/models/node.model';

import { PaginationArgs } from './dto/pagination.dto';

@Injectable()
export class PaginationService {
  public static async generatePaginationOutput<
    T extends Node,
    N extends Node,
    RT extends { node: N },
    >(
      query: SelectQueryBuilder<T>,
      args: PaginationArgs,
      transformer: (entity: T, raw: any) => RT,
  ) {
    const countQuery = query.clone();
    const entitiesQuery = query.clone().take(args.take).skip(args.skip);

    const [totalCount, { entities, raw }] = await Promise.all([
      countQuery.getCount(),
      args.take === 0
        ? { entities: [], raw: [] }
        : entitiesQuery.getRawAndEntities(),
    ]);

    const nodes: N[] = [];
    const edges: (RT & { cursor: string })[] = [];

    (zip(entities, raw) as [T, any][]).forEach(([entity, raw]) => {
      const edge = {
        cursor: this.generateCursor(entity),
        ...transformer(entity, raw),
      };

      nodes.push(edge.node);
      edges.push(edge);
    });

    const pageCount = Math.ceil(totalCount / (args.take || 0));

    return {
      totalCount,
      pageInfo: {
        pageCount: pageCount === Infinity ? 0 : pageCount,
        hasNextPage: (args.skip || 0) + (args.take || 0) < totalCount,
        hasPreviousPage: (args.skip || 0) > 0,
      },
      nodes: nodes as RT['node'][],
      edges: edges,
      query: query.clone(),
    };
  }

  public static generateCursor(node: Node) {
    return Buffer.from(node.id, 'base64').toString('ascii');
  }
}

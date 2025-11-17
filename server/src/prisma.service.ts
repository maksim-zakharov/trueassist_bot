import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    /***********************************/
    /* SOFT DELETE MIDDLEWARE */
    /***********************************/

    this.$use(async (params, next) => {
      // Check incoming query type
      if (params.model == 'BaseService') {
        if (params.action == 'delete') {
          // Delete queries
          // Change action to an update
          params.action = 'update';
          params.args['data'] = { deletedAt: new Date() };
        }
        if (params.action == 'deleteMany') {
          // Delete many queries
          params.action = 'updateMany';
          if (params.args.data != undefined) {
            params.args.data['deletedAt'] = new Date();
          } else {
            params.args['data'] = { deletedAt: new Date() };
          }
        }
      }
      return next(params);
    });
  }
}

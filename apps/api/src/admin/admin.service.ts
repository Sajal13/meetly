import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from './entities/admin.entity';
import { Repository } from 'typeorm';
import { ErrorCode } from '@common/exceptions/error-codes';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private readonly admin: Repository<Admin>
  ) {}

  async findAdmin(id: string) {
    const result = this.admin.findOne({
      where: { id },
      relations: { roles: { permissions: true } }
    });

    if (!result) {
      throw new NotFoundException({
        code: ErrorCode.NOT_FOUND,
        message: 'Admin not found.'
      });
    }

    return result;
  }
}

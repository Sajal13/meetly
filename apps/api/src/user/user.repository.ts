import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { UserQueryDto } from './dto/user-query.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>
  ) {}

  async findAndPaginate(query: UserQueryDto): Promise<[User[], number]> {
    const { limit, skip, status, search } = query;
    const qb = this.user.createQueryBuilder('user');

    if (search) {
      qb.andWhere(
        '(user.email ILIKE :search OR user.phone ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    return qb
      .orderBy('user.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
  }
  async findByEmail(identifier: string): Promise<User | null> {
    return await this.user.findOne({ where: { email: identifier } });
  }

  async findById(id: string): Promise<User | null> {
    return await this.user.findOne({ where: { id } });
  }

  async findByPhone(phone: string): Promise<User | null> {
    return await this.user.findOne({ where: { phone } });
  }

  create(data: Partial<User>): User {
    return this.user.create(data);
  }

  async save(user: User): Promise<User> {
    return await this.user.save(user);
  }
}

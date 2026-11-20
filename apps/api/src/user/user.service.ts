import { Injectable } from '@nestjs/common';
import { User } from './entity/user.entity';
import { UserRepository } from './user.repository';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';
import { UserQueryDto } from './dto/user-query.dto';
import { buildPaginationMeta } from '@common/utils/pagination.utils';
import { NotFound } from '@common/exceptions/auth.errors';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from './enums/user-status.enum';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  private toResponse(user: User): UserResponseDto {
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true
    });
  }

  async findAll(query: UserQueryDto) {
    const [users, total] = await this.userRepository.findAndPaginate(query);

    const {
      page,
      limit,
      total: count,
      totalPages
    } = buildPaginationMeta(query.page, query.limit, total);

    return {
      data: users.map((user) => this.toResponse(user)),
      meta: {
        page,
        limit,
        total: count,
        totalPages
      }
    };
  }
  async findByEmail(identifier: string): Promise<Partial<User> | null> {
    const user = await this.userRepository.findByEmail(identifier);

    if (!user) {
      throw NotFound(`User ${identifier} not found.`);
    }
    return this.toResponse(user);
  }

  async findByPhone(identifier: string): Promise<Partial<User> | null> {
    const user = await this.userRepository.findByPhone(identifier);

    if (!user) {
      throw NotFound(`User ${identifier} not found.`);
    }
    return this.toResponse(user);
  }

  async findById(identifier: string): Promise<Partial<User>> {
    const user = await this.getUserById(identifier);
    return this.toResponse(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.getUserById(id);

    Object.assign(user, dto);

    return this.toResponse(await this.userRepository.save(user));
  }

  block(id: string): Promise<UserResponseDto> {
    return this.setStatus(id, UserStatus.BLOCKED);
  }

  unblock(id: string): Promise<UserResponseDto> {
    return this.setStatus(id, UserStatus.ACTIVE);
  }

  private async setStatus(
    id: string,
    status: UserStatus
  ): Promise<UserResponseDto> {
    const user = await this.getUserById(id);
    user.status = status;
    return this.toResponse(await this.userRepository.save(user));
  }

  private async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw NotFound(`User ${id} not found.`);
    }

    return user;
  }
}

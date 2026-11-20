import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { RefreshToken } from './refresh-token.entity';
import type { SubjectType } from '@common/types/auth.types';

@Injectable()
export class TokenRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repo: Repository<RefreshToken>
  ) {}

  create(data: Partial<RefreshToken>) {
    return this.repo.save(this.repo.create(data));
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async revokeIfActive(id: string): Promise<boolean> {
    const res = await this.repo.update(
      { id, revokedAt: IsNull() },
      { revokedAt: new Date() }
    );

    return (res.affected ?? 0) === 1;
  }

  async revokeAllForSubject(subjectId: string, subjectType: SubjectType) {
    await this.repo.update(
      { subjectId, subjectType, revokedAt: IsNull() },
      { revokedAt: new Date() }
    );
  }

  async deleteExpired() {
    await this.repo
      .createQueryBuilder()
      .delete()
      .where('expires_at < now()')
      .execute();
  }
}

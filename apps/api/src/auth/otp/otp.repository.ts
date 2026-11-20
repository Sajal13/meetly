import { Injectable } from '@nestjs/common';
import { Otp } from './otp.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OtpRepository {
  constructor(@InjectRepository(Otp) private readonly repo: Repository<Otp>) {}

  create(data: Pick<Otp, 'identifier' | 'codeHash' | 'expiresAt'>) {
    return this.repo.save(this.repo.create(data));
  }

  findLatest(identifier: string) {
    return this.repo.findOne({
      where: { identifier, consumedAt: IsNull() },
      order: { createdAt: 'DESC' }
    });
  }

  findActive(identifier: string) {
    return this.repo.findOne({
      where: { identifier, consumedAt: IsNull() },
      order: { createdAt: 'DESC' }
    });
  }

  async invalidateAll(identifier: string) {
    await this.repo.update(
      { identifier, consumedAt: IsNull() },
      { consumedAt: new Date() }
    );
  }

  async incrementAttempts(id: string) {
    await this.repo.increment({ id }, 'attempts', 1);
  }

  async consume(id: string): Promise<boolean> {
    const res = await this.repo.update(
      { id, consumedAt: IsNull() },
      { consumedAt: new Date() }
    );

    return (res.affected ?? 0) === 1;
  }
}

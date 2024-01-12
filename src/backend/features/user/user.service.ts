import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { RegistrationRequest } from '../auth/validations/user.register';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(registrationRequest: RegistrationRequest): Promise<User> {
    
    return this.usersRepository.save(
      this.usersRepository.create({...registrationRequest}),
    );
  }

  find(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findByEmail(email: string): Promise<User|null> {
    return this.usersRepository.findOne({
      where: {email},
    });
  }

  async userExists(id: number): Promise<boolean> {
    return !!this.usersRepository.findOne({
      where: {id}
    })
  }

  update(id: User['id'], payload: DeepPartial<User>): Promise<User> {
    return this.usersRepository.save(
      this.usersRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async delete(id: User['id']): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
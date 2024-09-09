import { Injectable, NotAcceptableException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Person, PersonDocument } from './schema/person.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SignUpRequestDto } from '../auth/dto/sign-up-request.dto';

export type User = any;

@Injectable()
export class PersonService {
  private readonly users = [{
    userId: 1, username: 'john', password: 'changeme',
  }, {
    userId: 2, username: 'maria', password: 'guess',
  }];

  constructor(@InjectModel(Person.name) private readonly model: Model<PersonDocument>) {
  }

  /*******************************************************************
   * create
   ******************************************************************/
  async create(data: SignUpRequestDto) {
    let query = {};
    query['phone'] = data.phone;
    if (await this.model.findOne(query)) {
      throw new NotAcceptableException('User with this phone already exist.');
    }

    let person = (await this.model.create({
      ...data,
    })) as PersonDocument;


    return this.model.findById(person._id);
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}

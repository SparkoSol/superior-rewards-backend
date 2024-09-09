import { Injectable, NotAcceptableException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Person, PersonDocument } from './schema/person.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SignUpRequest } from '../auth/dto/sign-up-request.dto';

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
  async create(data: SignUpRequest) {
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

  async findOne(id: string) {
    return await this.model.findById(id).exec();
  }

  async findOneByQuery(query: {}) {
    return await this.model.findOne(query).exec();
  }

  async findOneByFcmToken(fcmToken: string) {
    return this.model.findOne({ fcmTokens: { $in: [fcmToken] } });
  }

  async findOneByPhone(phone: string): Promise<User | undefined> {
    return this.model.findOne({phone}).exec();
  }
}

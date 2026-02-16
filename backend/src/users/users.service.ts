import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(email: string, name: string, passwordHash: string): Promise<UserDocument> {
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      this.logger.warn(`Signup attempt with existing email: ${email}`);
      throw new ConflictException('User with this email already exists');
    }

    const user = new this.userModel({ email, name, passwordHash });
    const savedUser = await user.save();
    this.logger.log(`New user created: ${email}`);
    return savedUser;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }
}

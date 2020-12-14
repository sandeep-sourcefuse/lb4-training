import {Provider} from '@loopback/context';
import {repository} from '@loopback/repository';
import {verify} from 'jsonwebtoken';
import {VerifyFunction} from 'loopback4-authentication';
import {User} from '../models/user.model';
import {UserRepository} from '../repositories';


export class BearerTokenVerifyProvider
  implements Provider<VerifyFunction.BearerFn> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) { }

  value(): VerifyFunction.BearerFn {
    return async (token) => {

      console.log("tttttttttttt", token);
      const user = verify(token, process.env.JWT_SECRET as string, {
        issuer: process.env.JWT_ISSUER,
      }) as User;
      return user;
    };
  }
}

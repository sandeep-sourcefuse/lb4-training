import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, repository} from '@loopback/repository';
import {RoleRepository} from '.';
import {PostgresDsDataSource} from '../datasources';
import {Role, User, UserRelations} from '../models';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
  > {

  public readonly user_role: BelongsToAccessor<
    Role,
    typeof Role.prototype.role_id
  >;

  constructor(
    @inject('datasources.postgresDs') dataSource: PostgresDsDataSource,
    @repository.getter('RoleRepository')
    protected roleRepositoryGetter: Getter<RoleRepository>,
  ) {
    super(User, dataSource);

    this.user_role = this.createBelongsToAccessorFor(
      'user_role',
      roleRepositoryGetter,
    );

    this.registerInclusionResolver('user_role', this.user_role.inclusionResolver);
  }
}

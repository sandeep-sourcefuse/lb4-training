import {Entity, model, property} from '@loopback/repository';

enum RolesName {
  SuperAdmin = "superadmin",
  Admin = "admin",
  Subscriber = "subscriber"
}

@model({settings: {}})
export class Role extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  role_id?: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      enum: Object.values(RolesName),
    },
  })
  name: string;

  @property({
    type: 'string'
  })
  description?: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Role>) {
    super(data);
  }
}

export interface RoleRelations {
  // describe navigational properties here
}

export type RoleWithRelations = Role & RoleRelations;

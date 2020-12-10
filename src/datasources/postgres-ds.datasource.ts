import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'postgresDs',
  connector: 'postgresql',
  url: 'postgres://postgres:sandeep%40sourcefuse@localhost/lb-training',
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'sandeep@sourcefuse',
  database: 'lb-training'
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class PostgresDsDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'postgresDs';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.postgresDs', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}

import {inject} from '@loopback/context';
import {Getter} from '@loopback/core';
import {
  FindRoute,
  HttpErrors,
  InvokeMethod,
  InvokeMiddleware, ParseParams,
  Reject,
  RequestContext,
  Send,
  SequenceActions,
  SequenceHandler
} from '@loopback/rest';
import {AuthenticateFn, AuthenticationBindings} from 'loopback4-authentication';
import {
  AuthorizationBindings,
  AuthorizeErrorKeys,
  AuthorizeFn,
  UserPermissionsFn
} from 'loopback4-authorization';
import {User} from './models';

export class MySequence implements SequenceHandler {

  @inject(SequenceActions.INVOKE_MIDDLEWARE, {optional: true})
  protected invokeMiddleware: InvokeMiddleware = () => false;

  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(AuthenticationBindings.USER_AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn<User>,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    private readonly getCurrentUser: Getter<User>,
    @inject(AuthorizationBindings.AUTHORIZE_ACTION)
    protected checkAuthorisation: AuthorizeFn,
    @inject(AuthorizationBindings.USER_PERMISSIONS)
    private readonly getUserPermissions: UserPermissionsFn<string>,
  ) { }

  async handle(context: RequestContext) {
    try {

      // let executionStartOn: number = new Date().getTime();

      const {request, response} = context;

      let allowedOrigin: string[] = (process.env.ALLOWED_ORIGIN || "").split(",");
      let requestOrigin: string = request.connection.remoteAddress || "";
      if (!allowedOrigin.includes(requestOrigin)) {
        response.status(400);
        return this.send(response, {message: "You are not allowed to access it."});
      }

      const finished = await this.invokeMiddleware(context);
      if (finished) {
        return;
      }

      const route = this.findRoute(request);
      const args = await this.parseParams(request, route);
      // request.body = args[args.length - 1];
      const authUser: User = await this.authenticateRequest(request, response);
      const isAccessAllowed: boolean = await this.checkAuthorisation(
        authUser && authUser.permissions,
        request,
      );
      if (authUser != undefined && !isAccessAllowed) {
        throw new HttpErrors.Forbidden(AuthorizeErrorKeys.NotAllowedAccess);
      }
      const result = await this.invoke(route, args);

      // let executionEndOn: number = new Date().getTime();
      // let completionTime: number = executionEndOn - executionStartOn;
      // console.log("Logging meta data :: ", {
      //   completionTime: completionTime,
      //   startTime: executionStartOn,
      //   requestIp: request.connection.remoteAddress || null,
      //   referer: request.get("host") || null,
      //   userAgent: request.headers['user-agent'] || null,
      //   authUser: authUser,
      //   user: await this.getCurrentUser()
      // })

      this.send(response, result);


    } catch (err) {
      this.reject(context, err);
    }
  }
}

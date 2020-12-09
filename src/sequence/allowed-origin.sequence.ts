import {inject} from '@loopback/context';
import {
  FindRoute,
  InvokeMethod,
  InvokeMiddleware, ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler
} from '@loopback/rest';

const SequenceActions = RestBindings.SequenceActions;

export class AllowedOriginSequence implements SequenceHandler {
  /**
   * Optional invoker for registered middleware in a chain.
   * To be injected via SequenceActions.INVOKE_MIDDLEWARE.
   */
  @inject(SequenceActions.INVOKE_MIDDLEWARE, {optional: true})
  protected invokeMiddleware: InvokeMiddleware = () => false;

  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject
  ) { }

  async handle(context: RequestContext) {
    try {

      let executionStartOn: number = new Date().getTime();

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
      const result = await this.invoke(route, args);

      let executionEndOn: number = new Date().getTime();
      let completionTime: number = executionEndOn - executionStartOn;
      console.log("Logging meta data :: ", {
        completionTime: completionTime,
        startTime: executionStartOn,
        requestIp: request.connection.remoteAddress || null,
        referer: request.get("host") || null,
        userAgent: request.headers['user-agent'] || null
      })

      this.send(response, result);


    } catch (err) {
      this.reject(context, err);
    }
  }
}

import type {OutgoingHttpHeaders} from 'node:http'
import {getUrl} from 'src/utils'

type HeadersType = {
  [K in keyof OutgoingHttpHeaders as string extends K
    ? never
    : number extends K
      ? never
      : K]: OutgoingHttpHeaders[K]
} & {
  'Cross-Origin-Opener-Policy'?:
    | 'unsafe-none'
    | 'same-origin'
    | 'same-origin-allow-popups'
    | 'noopener-allow-popups'
  'Cross-Origin-Embedder-Policy'?:
    | 'unsafe-none'
    | 'require-corp'
    | 'credentialless'
  'Cross-Origin-Resource-Policy'?: 'same-site' | 'same-origin' | 'cross-origin'
}

//had problems with const enum :|
export type RouteType = 'react' | 'redirect' | 'back'

export abstract class Route {
  public readonly url: string | RegExp
  public readonly params: any[]
  public readonly type: RouteType
  private preHeaders: HeadersType = {}
  private postHeaders: HeadersType = {}

  protected constructor(url: string | RegExp, params: any[], type: RouteType) {
    this.url = url
    this.params = params
    this.type = type
  }

  protected setPreHeaders(headers: HeadersType): Route {
    this.preHeaders = headers
    return this
  }

  protected setPostHeaders(headers: HeadersType): Route {
    this.postHeaders = headers
    return this
  }

  protected getPreHeaders(): HeadersType {
    return {...this.preHeaders}
  }

  protected getPostHeaders(): HeadersType {
    return {...this.postHeaders}
  }

  public isMatchingRequest(request: Request): boolean {
    const {pathname, href} = getUrl(request)
    const routeUrl =
      typeof this.url === 'string'
        ? this.url
        : this.url.toString().replace(/^\/(.+)\/[dgimsuvy]*$/, '$1')
    return this.isMatchingUrl(routeUrl[0] === '/' ? pathname : href)
  }

  private isMatchingUrl(url: string): boolean {
    return (
      (typeof this.url === 'string' && this.url === url) ||
      (this.url instanceof RegExp && this.url.test(url))
    )
  }
}

export class ReactRoute extends Route {
  public readonly reactPath: string
  public readonly resolver: (request: Request, route: ReactRoute) => any

  public constructor(
    url: string | RegExp,
    reactPath: string,
    resolver: ((request: Request, route: ReactRoute) => any) | any,
    params: any[] = []
  ) {
    super(url, params, 'react')
    this.reactPath = reactPath
    this.resolver = typeof resolver === 'function' ? resolver : () => resolver
  }

  public override getPreHeaders(): HeadersType {
    return super.getPreHeaders()
  }

  public override getPostHeaders(): HeadersType {
    return super.getPostHeaders()
  }

  public override setPreHeaders(headers: HeadersType): ReactRoute {
    super.setPreHeaders(headers)
    return this
  }

  public override setPostHeaders(headers: HeadersType): ReactRoute {
    super.setPostHeaders(headers)
    return this
  }

  public override isMatchingRequest(request: Request): boolean {
    return super.isMatchingRequest(request)
  }
}

export class BackRoute extends Route {
  public readonly resolver: (request: Request, route: BackRoute) => Response

  public constructor(
    url: string | RegExp,
    resolver:
      | ((request: Request, route: BackRoute) => Response)
      | Response
      | any,
    params: any[] = []
  ) {
    super(url, params, 'back')
    if (typeof resolver === 'function') {
      this.resolver = resolver
    } else if (resolver instanceof Response) {
      this.resolver = () => resolver
    } else {
      this.resolver = () => new Response(resolver)
    }
  }

  public override isMatchingRequest(request: Request): boolean {
    return super.isMatchingRequest(request)
  }
}

export class RedirectRoute extends Route {
  public readonly filePath: string

  public constructor(
    url: string | RegExp,
    filePath: string,
    params: any[] = []
  ) {
    super(url, params, 'redirect')
    this.filePath = filePath
  }

  public override getPreHeaders(): HeadersType {
    return super.getPreHeaders()
  }

  public override getPostHeaders(): HeadersType {
    return super.getPostHeaders()
  }

  public override setPreHeaders(headers: HeadersType): RedirectRoute {
    super.setPreHeaders(headers)
    return this
  }

  public override setPostHeaders(headers: HeadersType): RedirectRoute {
    super.setPostHeaders(headers)
    return this
  }

  public override isMatchingRequest(request: Request): boolean {
    return super.isMatchingRequest(request)
  }
}

import { JSDOM, VirtualConsole } from 'jsdom';
import Bluebird from 'bluebird';
import { Console } from 'debug-color2';
export interface IJSDOMRendererOptions {
    /**
     * 0 (No limit)
     *
     * The number of routes allowed to be rendered at the same time. Useful for breaking down massive batches of routes into smaller chunks.
     */
    maxConcurrentRoutes?: number;
    /**
     * An object to inject into the global scope of the rendered page before it finishes loading. Must be JSON.stringifiy-able. The property injected to is window['__PRERENDER_INJECTED'] by default.
     */
    inject?: object;
    /**
     * The property to mount inject to during rendering.
     */
    injectProperty?: string;
    /**
     * Wait to render until the specified event is fired on the document. (You can fire an event like so: document.dispatchEvent(new Event('custom-render-trigger'))
     */
    renderAfterDocumentEvent?: string;
    /**
     * (Selector)
     *
     * Wait to render until the specified element is detected using document.querySelector
     */
    renderAfterElementExists?: string;
    /**
     * (Milliseconds)
     *
     * Wait to render until a certain amount of time has passed.
     */
    renderAfterTime?: number;
    /**
     * the max timeout
     */
    renderAfterTimeMax?: number;
    /**
     * delay after renderAfterDocumentEvent renderAfterElementExists
     */
    renderAfterDelay?: number;
    referrer?: string | URL;
    disableLog?: boolean;
}
export declare type IRoutes = string[];
export declare class JSDOMRenderer {
    static DEFAULT_REFERRER: string;
    static DEFAULT_INJECT_PROPERTY: string;
    static ID: string;
    protected _rendererOptions: IJSDOMRendererOptions;
    protected _virtualConsole: VirtualConsole;
    protected consoleDebug: Console;
    constructor(rendererOptions: IJSDOMRendererOptions);
    injectObject(): object;
    initialize(): Bluebird<void>;
    getVirtualConsole(): VirtualConsole;
    renderRoutes(routes: IRoutes, Prerenderer: {
        getOptions(): IPrerendererOptions;
    }): Bluebird<IResult[]>;
    destroy(): void;
    protected getPageContents(jsdom: JSDOM, options: IJSDOMRendererOptions, originalRoute: string): Bluebird<IResult>;
}
export interface IPostProcessContext {
    /**
     * The prerendered route, after following redirects.
     */
    route: string;
    /**
     * The original route passed, before redirects.
     */
    originalRoute: string;
    /**
     * The path to write the rendered HTML to.
     */
    html: string;
    /**
     * The path to write the rendered HTML to.
     * This is null (automatically calculated after postProcess)
     * unless explicitly set.
     */
    outputPath?: string;
}
export declare type IResolvable<R> = R | PromiseLike<R>;
export interface IPrerendererOptions {
    staticDir?: string;
    outputDir?: string;
    indexPath?: string;
    /**
     * The postProcess(Object context): Object | Promise function in your renderer configuration allows you to adjust the output of prerender-spa-plugin before writing it to a file.
     * It is called once per rendered route and is passed a context object in the form of:
     *
     * @param {IPostProcessContext} context
     * @returns {IResolvable<IPostProcessContext>}
     */
    postProcess?(context: IPostProcessContext): IResolvable<IPostProcessContext>;
    server?: {
        /**
         * The port for the app server to run on.
         */
        port?: number;
        /**
         * Proxy configuration. Has the same signature as webpack-dev-server
         */
        proxy?: object;
    };
}
export interface IResult {
    originalRoute: string;
    route: string;
    html: string;
}
export default JSDOMRenderer;

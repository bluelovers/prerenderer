import { DOMWindow, JSDOM, VirtualConsole } from 'jsdom'
import Bluebird from 'bluebird'
import console, { Console } from 'debug-color2'

export interface IJSDOMRendererOptions
{
	/**
	 * 0 (No limit)
	 *
	 * The number of routes allowed to be rendered at the same time. Useful for breaking down massive batches of routes into smaller chunks.
	 */
	maxConcurrentRoutes?: number,
	/**
	 * An object to inject into the global scope of the rendered page before it finishes loading. Must be JSON.stringifiy-able. The property injected to is window['__PRERENDER_INJECTED'] by default.
	 */
	inject?: object,
	/**
	 * The property to mount inject to during rendering.
	 */
	injectProperty?: string,
	/**
	 * Wait to render until the specified event is fired on the document. (You can fire an event like so: document.dispatchEvent(new Event('custom-render-trigger'))
	 */
	renderAfterDocumentEvent?: string,
	/**
	 * (Selector)
	 *
	 * Wait to render until the specified element is detected using document.querySelector
	 */
	renderAfterElementExists?: string,
	/**
	 * (Milliseconds)
	 *
	 * Wait to render until a certain amount of time has passed.
	 */
	renderAfterTime?: number,

	/**
	 * the max timeout
	 */
	renderAfterTimeMax?: number,

	/**
	 * delay after renderAfterDocumentEvent renderAfterElementExists
	 */
	renderAfterDelay?: number,

	referrer?: string | URL,

	disableLog?: boolean,
}

export type IRoutes = string[];

export class JSDOMRenderer
{
	static DEFAULT_REFERRER = new URL(`https://prerenderer-renderer-jsdom`).toString();
	static DEFAULT_INJECT_PROPERTY = '__PRERENDER_INJECTED';
	static ID = 'JSDOMRenderer';

	protected _rendererOptions: IJSDOMRendererOptions = {};
	protected _virtualConsole: VirtualConsole;

	protected consoleDebug = new Console(console, {
		label: true,
		time: true,
		labelFormatFn(data): string
		{
			return `[${JSDOMRenderer.ID}:${data.name.toUpperCase()}]`;
		}
	});

	constructor(rendererOptions: IJSDOMRendererOptions)
	{
		Object.assign(this._rendererOptions, rendererOptions);

		if (this._rendererOptions.maxConcurrentRoutes == null) this._rendererOptions.maxConcurrentRoutes = 0;

		if (this._rendererOptions.inject && !this._rendererOptions.injectProperty)
		{
			this._rendererOptions.injectProperty = JSDOMRenderer.DEFAULT_INJECT_PROPERTY
		}

		if (this._rendererOptions.disableLog)
		{
			this.consoleDebug.enabled = false;
		}
	}

	injectObject()
	{
		return this._rendererOptions.inject
	}

	initialize()
	{
		// NOOP
		return Bluebird.resolve()
	}

	getVirtualConsole()
	{
		return this._virtualConsole || (this._virtualConsole = new VirtualConsole());
	}

	renderRoutes(routes: IRoutes, Prerenderer: {
		getOptions(): IPrerendererOptions
	}): Bluebird<IResult[]>
	{
		const self = this;
		const startTime = Date.now();

		return Bluebird.resolve()
			.then(() =>
			{
				const rootOptions = Prerenderer.getOptions();

				const _rendererOptions = this._rendererOptions;
				const virtualConsole = self.getVirtualConsole();

				virtualConsole.on('jsdomError', e => self.consoleDebug.error('jsdomError', e));

				const referrer = _rendererOptions.referrer
					? _rendererOptions.referrer.toString()
					: JSDOMRenderer.DEFAULT_REFERRER;

				return Bluebird
					.resolve(routes)
					.map(async (route) =>
					{
						self.consoleDebug.debug(`route:start`, route);

						const jsdom = await JSDOM.fromURL(`http://127.0.0.1:${rootOptions.server.port}${route}`, {
							resources: 'usable',
							runScripts: 'dangerously',
							// @ts-ignore
							pretendToBeVisual: true,
							includeNodeLocations: true,

							referrer,

							VirtualConsole: virtualConsole,
						});

						if (_rendererOptions.inject)
						{
							jsdom.window[_rendererOptions.injectProperty] = self.injectObject();
						}

						jsdom.window.addEventListener('error', function (event)
						{
							//self.consoleDebug.error(`window.error`, route, event.error)
						});

						return self.getPageContents(jsdom, _rendererOptions, route)
							.tap(function ()
							{
								self.consoleDebug.debug(`route:end`, route);
							})
					})
					.tapCatch(e =>
					{
						self.consoleDebug.error(`renderRoutes`, e.message)
					})
					;
			})
			.tap(() => {
				self.consoleDebug.success(`renderRoutes:done`, routes, routes.length);
			})
			.finally(() => {
				self.consoleDebug.debug(`renderRoutes:end`, routes, `used`, (Date.now() - startTime) / 1000 , 'sec');
			})
			;
	}

	destroy()
	{
		// NOOP
	}

	protected getPageContents(jsdom: JSDOM, options: IJSDOMRendererOptions, originalRoute: string): Bluebird<IResult>
	{
		options = options || {};

		const self = this;

		return new Bluebird<IResult>(async (resolve, reject) =>
		{
			const startTime = Date.now();

			let int: number;

			let _resolved: boolean;

			async function captureDocument()
			{
				_resolved = true;
				resetTimer();

				return Bluebird
					.delay(options.renderAfterDelay | 0)
					.then(() =>
					{
						const result: IResult = {
							originalRoute: originalRoute,
							route: originalRoute,
							html: jsdom.serialize(),
						};

						jsdom.window.close();
						return result
					})
					.tap(() => {
						self.consoleDebug.success(`captureDocument:done`, originalRoute);
					})
					.tapCatch(e =>
					{
						self.consoleDebug.error(`captureDocument`, e);
					})
					.finally(() => {
						self.consoleDebug.debug(`captureDocument:end`, originalRoute, `used`, (Date.now() - startTime) / 1000 , 'sec');
					})
					;
			}

			function resetTimer()
			{
				if (int != null)
				{
					clearInterval(int)
					int = null;
				}
			}

			function done()
			{
				resetTimer();

				if (!_resolved)
				{
					resolve(captureDocument())
				}
			}

			let bool: boolean;

			// CAPTURE WHEN AN EVENT FIRES ON THE DOCUMENT
			if (options.renderAfterDocumentEvent)
			{
				bool = true;

				jsdom.window.document.addEventListener(options.renderAfterDocumentEvent, () => done())

				// CAPTURE ONCE A SPECIFC ELEMENT EXISTS
			}

			if (options.renderAfterElementExists)
			{
				bool = true;

				// @ts-ignore
				int = setInterval(() =>
				{
					if (jsdom.window.document.querySelector(options.renderAfterElementExists)) done()
				}, 100)

				// CAPTURE AFTER A NUMBER OF MILLISECONDS
			}

			if (bool)
			{
				setTimeout(done, (options.renderAfterTimeMax | 0) || 30000)
			}
			else if (options.renderAfterTime)
			{
				setTimeout(done, options.renderAfterTime)

				// DEFAULT: RUN IMMEDIATELY
			}
			else
			{
				done()
			}
		})
	}
}

export interface IPostProcessContext
{
	/**
	 * The prerendered route, after following redirects.
	 */
	route: string
	/**
	 * The original route passed, before redirects.
	 */
	originalRoute: string
	/**
	 * The path to write the rendered HTML to.
	 */
	html: string
	/**
	 * The path to write the rendered HTML to.
	 * This is null (automatically calculated after postProcess)
	 * unless explicitly set.
	 */
	outputPath?: string
}

export type IResolvable<R> = R | PromiseLike<R>;

export interface IPrerendererOptions
{
	staticDir?: string,
	outputDir?: string,
	indexPath?: string,

	/**
	 * The postProcess(Object context): Object | Promise function in your renderer configuration allows you to adjust the output of prerender-spa-plugin before writing it to a file.
	 * It is called once per rendered route and is passed a context object in the form of:
	 *
	 * @param {IPostProcessContext} context
	 * @returns {IResolvable<IPostProcessContext>}
	 */
	postProcess?(context: IPostProcessContext): IResolvable<IPostProcessContext>,

	server?: {
		/**
		 * The port for the app server to run on.
		 */
		port?: number,
		/**
		 * Proxy configuration. Has the same signature as webpack-dev-server
		 */
		proxy?: object,
	},
}

export interface IResult
{
	originalRoute: string,
	route: string,
	html: string,
}

export default JSDOMRenderer

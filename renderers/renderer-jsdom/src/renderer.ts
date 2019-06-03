import { DOMWindow, JSDOM } from 'jsdom'
import Bluebird from 'bluebird'

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
}

export type IRoutes = string[];

export class JSDOMRenderer
{
	protected _rendererOptions: IJSDOMRendererOptions = {};

	constructor(rendererOptions: IJSDOMRendererOptions)
	{
		Object.assign(this._rendererOptions, rendererOptions);

		if (this._rendererOptions.maxConcurrentRoutes == null) this._rendererOptions.maxConcurrentRoutes = 0;

		if (this._rendererOptions.inject && !this._rendererOptions.injectProperty)
		{
			this._rendererOptions.injectProperty = '__PRERENDER_INJECTED'
		}
	}

	initialize()
	{
		// NOOP
		return Bluebird.resolve()
	}

	renderRoutes(routes: IRoutes, Prerenderer: {
		getOptions(): IPrerendererOptions
	}): Bluebird<IResult[]>
	{
		const rootOptions = Prerenderer.getOptions();

		const self = this;

		return Bluebird
			.resolve(routes)
			.bind(self)
			.map((route) =>
		{
			return new Bluebird<IResult>(async (resolve, reject) =>
			{
				const jsdom = await JSDOM.fromURL(`http://127.0.0.1:${rootOptions.server.port}${route}`, {
					resources: 'usable',
					runScripts: 'dangerously',
				});

				const { window } = jsdom;

				if (self._rendererOptions.inject)
				{
					window[self._rendererOptions.injectProperty] = self._rendererOptions.inject
				}

				window.addEventListener('error', function (event)
				{
					console.error(event.error)
				});

				return getPageContents(jsdom, self._rendererOptions, route)
			})
		})
			.tapCatch(e =>
			{
				console.error(e)
			})
		;
	}

	destroy()
	{
		// NOOP
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

export function getPageContents(jsdom: JSDOM, options: IJSDOMRendererOptions, originalRoute: string): Bluebird<IResult>
{
	options = options || {};

	const { window } = jsdom;
	const { document } = window;

	return new Bluebird<IResult>((resolve, reject) =>
	{
		let int: number;

		async function captureDocument()
		{
			if (options.renderAfterDelay > 0)
			{
				await Bluebird.delay(options.renderAfterDelay | 0)
			}

			const result: IResult = {
				originalRoute: originalRoute,
				route: originalRoute,
				html: jsdom.serialize(),
			};

			if (int != null)
			{
				clearInterval(int)
			}

			window.close();
			return result
		}

		let bool: boolean;

		// CAPTURE WHEN AN EVENT FIRES ON THE DOCUMENT
		if (options.renderAfterDocumentEvent)
		{
			bool = true;

			document.addEventListener(options.renderAfterDocumentEvent, () => resolve(captureDocument()))

			// CAPTURE ONCE A SPECIFC ELEMENT EXISTS
		}

		if (options.renderAfterElementExists)
		{
			bool = true;

			// @ts-ignore
			int = setInterval(() =>
			{
				if (document.querySelector(options.renderAfterElementExists)) resolve(captureDocument())
			}, 100)

			// CAPTURE AFTER A NUMBER OF MILLISECONDS
		}

		if (bool)
		{
			setTimeout(() => resolve(captureDocument()), (options.renderAfterTimeMax | 0) || 30000)
		}
		else if (options.renderAfterTime)
		{
			setTimeout(() => resolve(captureDocument()), options.renderAfterTime)

			// DEFAULT: RUN IMMEDIATELY
		}
		else
		{
			resolve(captureDocument())
		}
	})
}

export default JSDOMRenderer

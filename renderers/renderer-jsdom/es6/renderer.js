"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
const bluebird_1 = __importDefault(require("bluebird"));
const debug_color2_1 = __importStar(require("debug-color2"));
class JSDOMRenderer {
    constructor(rendererOptions) {
        this._rendererOptions = {};
        this.consoleDebug = new debug_color2_1.Console(debug_color2_1.default, {
            label: true,
            time: true,
            labelFormatFn(data) {
                return `[${JSDOMRenderer.ID}:${data.name.toUpperCase()}]`;
            }
        });
        Object.assign(this._rendererOptions, rendererOptions);
        if (this._rendererOptions.maxConcurrentRoutes == null)
            this._rendererOptions.maxConcurrentRoutes = 0;
        if (this._rendererOptions.inject && !this._rendererOptions.injectProperty) {
            this._rendererOptions.injectProperty = JSDOMRenderer.DEFAULT_INJECT_PROPERTY;
        }
        if (this._rendererOptions.disableLog) {
            this.consoleDebug.enabled = false;
        }
    }
    injectObject() {
        return this._rendererOptions.inject;
    }
    initialize() {
        // NOOP
        return bluebird_1.default.resolve();
    }
    getVirtualConsole() {
        return this._virtualConsole || (this._virtualConsole = new jsdom_1.VirtualConsole());
    }
    renderRoutes(routes, Prerenderer) {
        const self = this;
        return bluebird_1.default.resolve()
            .then(() => {
            const rootOptions = Prerenderer.getOptions();
            const _rendererOptions = this._rendererOptions;
            const virtualConsole = self.getVirtualConsole();
            virtualConsole.on('jsdomError', e => self.consoleDebug.error('jsdomError', e));
            const referrer = _rendererOptions.referrer
                ? _rendererOptions.referrer.toString()
                : JSDOMRenderer.DEFAULT_REFERRER;
            return bluebird_1.default
                .resolve(routes)
                .map(async (route) => {
                self.consoleDebug.debug(`route:start`, route);
                const jsdom = await jsdom_1.JSDOM.fromURL(`http://127.0.0.1:${rootOptions.server.port}${route}`, {
                    resources: 'usable',
                    runScripts: 'dangerously',
                    // @ts-ignore
                    pretendToBeVisual: true,
                    includeNodeLocations: true,
                    referrer,
                    VirtualConsole: virtualConsole,
                });
                if (_rendererOptions.inject) {
                    jsdom.window[_rendererOptions.injectProperty] = self.injectObject();
                }
                jsdom.window.addEventListener('error', function (event) {
                    //self.consoleDebug.error(`window.error`, route, event.error)
                });
                return self.getPageContents(jsdom, _rendererOptions, route)
                    .tap(function () {
                    self.consoleDebug.debug(`route:end`, route);
                });
            })
                .tapCatch(e => {
                self.consoleDebug.error(`renderRoutes`, e.message);
            });
        })
            .tap(() => {
            self.consoleDebug.success(`renderRoutes:done`, routes, routes.length);
        });
    }
    destroy() {
        // NOOP
    }
    getPageContents(jsdom, options, originalRoute) {
        options = options || {};
        const self = this;
        return new bluebird_1.default(async (resolve, reject) => {
            let int;
            let _resolved;
            async function captureDocument() {
                _resolved = true;
                resetTimer();
                return bluebird_1.default
                    .delay(options.renderAfterDelay | 0)
                    .then(() => {
                    const result = {
                        originalRoute: originalRoute,
                        route: originalRoute,
                        html: jsdom.serialize(),
                    };
                    jsdom.window.close();
                    return result;
                })
                    .tap(() => {
                    self.consoleDebug.success(`captureDocument:done`, originalRoute);
                })
                    .tapCatch(e => {
                    self.consoleDebug.error(`captureDocument`, e);
                });
            }
            function resetTimer() {
                if (int != null) {
                    clearInterval(int);
                    int = null;
                }
            }
            function done() {
                resetTimer();
                if (!_resolved) {
                    resolve(captureDocument());
                }
            }
            let bool;
            // CAPTURE WHEN AN EVENT FIRES ON THE DOCUMENT
            if (options.renderAfterDocumentEvent) {
                bool = true;
                jsdom.window.document.addEventListener(options.renderAfterDocumentEvent, () => done());
                // CAPTURE ONCE A SPECIFC ELEMENT EXISTS
            }
            if (options.renderAfterElementExists) {
                bool = true;
                // @ts-ignore
                int = setInterval(() => {
                    if (jsdom.window.document.querySelector(options.renderAfterElementExists))
                        done();
                }, 100);
                // CAPTURE AFTER A NUMBER OF MILLISECONDS
            }
            if (bool) {
                setTimeout(done, (options.renderAfterTimeMax | 0) || 30000);
            }
            else if (options.renderAfterTime) {
                setTimeout(done, options.renderAfterTime);
                // DEFAULT: RUN IMMEDIATELY
            }
            else {
                done();
            }
        });
    }
}
JSDOMRenderer.DEFAULT_REFERRER = new URL(`https://prerenderer-renderer-jsdom`).toString();
JSDOMRenderer.DEFAULT_INJECT_PROPERTY = '__PRERENDER_INJECTED';
JSDOMRenderer.ID = 'JSDOMRenderer';
exports.JSDOMRenderer = JSDOMRenderer;
exports.default = JSDOMRenderer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQXdEO0FBQ3hELHdEQUErQjtBQUMvQiw2REFBK0M7QUFvRC9DLE1BQWEsYUFBYTtJQWtCekIsWUFBWSxlQUFzQztRQVp4QyxxQkFBZ0IsR0FBMEIsRUFBRSxDQUFDO1FBRzdDLGlCQUFZLEdBQUcsSUFBSSxzQkFBTyxDQUFDLHNCQUFPLEVBQUU7WUFDN0MsS0FBSyxFQUFFLElBQUk7WUFDWCxJQUFJLEVBQUUsSUFBSTtZQUNWLGFBQWEsQ0FBQyxJQUFJO2dCQUVqQixPQUFPLElBQUksYUFBYSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUM7WUFDM0QsQ0FBQztTQUNELENBQUMsQ0FBQztRQUlGLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRXRELElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixJQUFJLElBQUk7WUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO1FBRXJHLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQ3pFO1lBQ0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUMsdUJBQXVCLENBQUE7U0FDNUU7UUFFRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQ3BDO1lBQ0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1NBQ2xDO0lBQ0YsQ0FBQztJQUVELFlBQVk7UUFFWCxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUE7SUFDcEMsQ0FB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UUFBUSxFQUFFLENBQUM7QUFDNUUscUNBQXVCLEdBQUcsc0JBQXNCLENBQUM7QUFDakQsZ0JBQUUsR0FBRyxlQUFlLENBQUM7QUFKN0Isc0NBOE5DO0FBNERELGtCQUFlLGFBQWEsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERPTVdpbmRvdywgSlNET00sIFZpcnR1YWxDb25zb2xlIH0gZnJvbSAnanNkb20nXG5pbXBvcnQgQmx1ZWJpcmQgZnJvbSAnYmx1ZWJpcmQnXG5pbXBvcnQgY29uc29sZSwgeyBDb25zb2xlIH0gZnJvbSAnZGVidWctY29sb3IyJ1xuXG5leHBvcnQgaW50ZXJmYWNlIElKU0RPTVJlbmRlcmVyT3B0aW9uc1xue1xuXHQvKipcblx0ICogMCAoTm8gbGltaXQpXG5cdCAqXG5cdCAqIFRoZSBudW1iZXIgb2Ygcm91dGVzIGFsbG93ZWQgdG8gYmUgcmVuZGVyZWQgYXQgdGhlIHNhbWUgdGltZS4gVXNlZnVsIGZvciBicmVha2luZyBkb3duIG1hc3NpdmUgYmF0Y2hlcyBvZiByb3V0ZXMgaW50byBzbWFsbGVyIGNodW5rcy5cblx0ICovXG5cdG1heENvbmN1cnJlbnRSb3V0ZXM/OiBudW1iZXIsXG5cdC8qKlxuXHQgKiBBbiBvYmplY3QgdG8gaW5qZWN0IGludG8gdGhlIGdsb2JhbCBzY29wZSBvZiB0aGUgcmVuZGVyZWQgcGFnZSBiZWZvcmUgaXQgZmluaXNoZXMgbG9hZGluZy4gTXVzdCBiZSBKU09OLnN0cmluZ2lmaXktYWJsZS4gVGhlIHByb3BlcnR5IGluamVjdGVkIHRvIGlzIHdpbmRvd1snX19QUkVSRU5ERVJfSU5KRUNURUQnXSBieSBkZWZhdWx0LlxuXHQgKi9cblx0aW5qZWN0Pzogb2JqZWN0LFxuXHQvKipcblx0ICogVGhlIHByb3BlcnR5IHRvIG1vdW50IGluamVjdCB0byBkdXJpbmcgcmVuZGVyaW5nLlxuXHQgKi9cblx0aW5qZWN0UHJvcGVydHk/OiBzdHJpbmcsXG5cdC8qKlxuXHQgKiBXYWl0IHRvIHJlbmRlciB1bnRpbCB0aGUgc3BlY2lmaWVkIGV2ZW50IGlzIGZpcmVkIG9uIHRoZSBkb2N1bWVudC4gKFlvdSBjYW4gZmlyZSBhbiBldmVudCBsaWtlIHNvOiBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY3VzdG9tLXJlbmRlci10cmlnZ2VyJykpXG5cdCAqL1xuXHRyZW5kZXJBZnRlckRvY3VtZW50RXZlbnQ/OiBzdHJpbmcsXG5cdC8qKlxuXHQgKiAoU2VsZWN0b3IpXG5cdCAqXG5cdCAqIFdhaXQgdG8gcmVuZGVyIHVudGlsIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBpcyBkZXRlY3RlZCB1c2luZyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yXG5cdCAqL1xuXHRyZW5kZXJBZnRlckVsZW1lbnRFeGlzdHM/OiBzdHJpbmcsXG5cdC8qKlxuXHQgKiAoTWlsbGlzZWNvbmRzKVxuXHQgKlxuXHQgKiBXYWl0IHRvIHJlbmRlciB1bnRpbCBhIGNlcnRhaW4gYW1vdW50IG9mIHRpbWUgaGFzIHBhc3NlZC5cblx0ICovXG5cdHJlbmRlckFmdGVyVGltZT86IG51bWJlcixcblxuXHQvKipcblx0ICogdGhlIG1heCB0aW1lb3V0XG5cdCAqL1xuXHRyZW5kZXJBZnRlclRpbWVNYXg/OiBudW1iZXIsXG5cblx0LyoqXG5cdCAqIGRlbGF5IGFmdGVyIHJlbmRlckFmdGVyRG9jdW1lbnRFdmVudCByZW5kZXJBZnRlckVsZW1lbnRFeGlzdHNcblx0ICovXG5cdHJlbmRlckFmdGVyRGVsYXk/OiBudW1iZXIsXG5cblx0cmVmZXJyZXI/OiBzdHJpbmcgfCBVUkwsXG5cblx0ZGlzYWJsZUxvZz86IGJvb2xlYW4sXG59XG5cbmV4cG9ydCB0eXBlIElSb3V0ZXMgPSBzdHJpbmdbXTtcblxuZXhwb3J0IGNsYXNzIEpTRE9NUmVuZGVyZXJcbntcblx0c3RhdGljIERFRkFVTFRfUkVGRVJSRVIgPSBuZXcgVVJMKGBodHRwczovL3ByZXJlbmRlcmVyLXJlbmRlcmVyLWpzZG9tYCkudG9TdHJpbmcoKTtcblx0c3RhdGljIERFRkFVTFRfSU5KRUNUX1BST1BFUlRZID0gJ19fUFJFUkVOREVSX0lOSkVDVEVEJztcblx0c3RhdGljIElEID0gJ0pTRE9NUmVuZGVyZXInO1xuXG5cdHByb3RlY3RlZCBfcmVuZGVyZXJPcHRpb25zOiBJSlNET01SZW5kZXJlck9wdGlvbnMgPSB7fTtcblx0cHJvdGVjdGVkIF92aXJ0dWFsQ29uc29sZTogVmlydHVhbENvbnNvbGU7XG5cblx0cHJvdGVjdGVkIGNvbnNvbGVEZWJ1ZyA9IG5ldyBDb25zb2xlKGNvbnNvbGUsIHtcblx0XHRsYWJlbDogdHJ1ZSxcblx0XHR0aW1lOiB0cnVlLFxuXHRcdGxhYmVsRm9ybWF0Rm4oZGF0YSk6IHN0cmluZ1xuXHRcdHtcblx0XHRcdHJldHVybiBgWyR7SlNET01SZW5kZXJlci5JRH06JHtkYXRhLm5hbWUudG9VcHBlckNhc2UoKX1dYDtcblx0XHR9XG5cdH0pO1xuXG5cdGNvbnN0cnVjdG9yKHJlbmRlcmVyT3B0aW9uczogSUpTRE9NUmVuZGVyZXJPcHRpb25zKVxuXHR7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLl9yZW5kZXJlck9wdGlvbnMsIHJlbmRlcmVyT3B0aW9ucyk7XG5cblx0XHRpZiAodGhpcy5fcmVuZGVyZXJPcHRpb25zLm1heENvbmN1cnJlbnRSb3V0ZXMgPT0gbnVsbCkgdGhpcy5fcmVuZGVyZXJPcHRpb25zLm1heENvbmN1cnJlbnRSb3V0ZXMgPSAwO1xuXG5cdFx0aWYgKHRoaXMuX3JlbmRlcmVyT3B0aW9ucy5pbmplY3QgJiYgIXRoaXMuX3JlbmRlcmVyT3B0aW9ucy5pbmplY3RQcm9wZXJ0eSlcblx0XHR7XG5cdFx0XHR0aGlzLl9yZW5kZXJlck9wdGlvbnMuaW5qZWN0UHJvcGVydHkgPSBKU0RPTVJlbmRlcmVyLkRFRkFVTFRfSU5KRUNUX1BST1BFUlRZXG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX3JlbmRlcmVyT3B0aW9ucy5kaXNhYmxlTG9nKVxuXHRcdHtcblx0XHRcdHRoaXMuY29uc29sZURlYnVnLmVuYWJsZWQgPSBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRpbmplY3RPYmplY3QoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3JlbmRlcmVyT3B0aW9ucy5pbmplY3Rcblx0fVxuXG5cdGluaXRpYWxpemUoKVxuXHR7XG5cdFx0Ly8gTk9PUFxuXHRcdHJldHVybiBCbHVlYmlyZC5yZXNvbHZlKClcblx0fVxuXG5cdGdldFZpcnR1YWxDb25zb2xlKClcblx0e1xuXHRcdHJldHVybiB0aGlzLl92aXJ0dWFsQ29uc29sZSB8fCAodGhpcy5fdmlydHVhbENvbnNvbGUgPSBuZXcgVmlydHVhbENvbnNvbGUoKSk7XG5cdH1cblxuXHRyZW5kZXJSb3V0ZXMocm91dGVzOiBJUm91dGVzLCBQcmVyZW5kZXJlcjoge1xuXHRcdGdldE9wdGlvbnMoKTogSVByZXJlbmRlcmVyT3B0aW9uc1xuXHR9KTogQmx1ZWJpcmQ8SVJlc3VsdFtdPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRyZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZSgpXG5cdFx0XHQudGhlbigoKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCByb290T3B0aW9ucyA9IFByZXJlbmRlcmVyLmdldE9wdGlvbnMoKTtcblxuXHRcdFx0XHRjb25zdCBfcmVuZGVyZXJPcHRpb25zID0gdGhpcy5fcmVuZGVyZXJPcHRpb25zO1xuXHRcdFx0XHRjb25zdCB2aXJ0dWFsQ29uc29sZSA9IHNlbGYuZ2V0VmlydHVhbENvbnNvbGUoKTtcblxuXHRcdFx0XHR2aXJ0dWFsQ29uc29sZS5vbignanNkb21FcnJvcicsIGUgPT4gc2VsZi5jb25zb2xlRGVidWcuZXJyb3IoJ2pzZG9tRXJyb3InLCBlKSk7XG5cblx0XHRcdFx0Y29uc3QgcmVmZXJyZXIgPSBfcmVuZGVyZXJPcHRpb25zLnJlZmVycmVyXG5cdFx0XHRcdFx0PyBfcmVuZGVyZXJPcHRpb25zLnJlZmVycmVyLnRvU3RyaW5nKClcblx0XHRcdFx0XHQ6IEpTRE9NUmVuZGVyZXIuREVGQVVMVF9SRUZFUlJFUjtcblxuXHRcdFx0XHRyZXR1cm4gQmx1ZWJpcmRcblx0XHRcdFx0XHQucmVzb2x2ZShyb3V0ZXMpXG5cdFx0XHRcdFx0Lm1hcChhc3luYyAocm91dGUpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0c2VsZi5jb25zb2xlRGVidWcuZGVidWcoYHJvdXRlOnN0YXJ0YCwgcm91dGUpO1xuXG5cdFx0XHRcdFx0XHRjb25zdCBqc2RvbSA9IGF3YWl0IEpTRE9NLmZyb21VUkwoYGh0dHA6Ly8xMjcuMC4wLjE6JHtyb290T3B0aW9ucy5zZXJ2ZXIucG9ydH0ke3JvdXRlfWAsIHtcblx0XHRcdFx0XHRcdFx0cmVzb3VyY2VzOiAndXNhYmxlJyxcblx0XHRcdFx0XHRcdFx0cnVuU2NyaXB0czogJ2Rhbmdlcm91c2x5Jyxcblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRwcmV0ZW5kVG9CZVZpc3VhbDogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0aW5jbHVkZU5vZGVMb2NhdGlvbnM6IHRydWUsXG5cblx0XHRcdFx0XHRcdFx0cmVmZXJyZXIsXG5cblx0XHRcdFx0XHRcdFx0VmlydHVhbENvbnNvbGU6IHZpcnR1YWxDb25zb2xlLFxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdGlmIChfcmVuZGVyZXJPcHRpb25zLmluamVjdClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0anNkb20ud2luZG93W19yZW5kZXJlck9wdGlvbnMuaW5qZWN0UHJvcGVydHldID0gc2VsZi5pbmplY3RPYmplY3QoKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0anNkb20ud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24gKGV2ZW50KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvL3NlbGYuY29uc29sZURlYnVnLmVycm9yKGB3aW5kb3cuZXJyb3JgLCByb3V0ZSwgZXZlbnQuZXJyb3IpXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIHNlbGYuZ2V0UGFnZUNvbnRlbnRzKGpzZG9tLCBfcmVuZGVyZXJPcHRpb25zLCByb3V0ZSlcblx0XHRcdFx0XHRcdFx0LnRhcChmdW5jdGlvbiAoKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0c2VsZi5jb25zb2xlRGVidWcuZGVidWcoYHJvdXRlOmVuZGAsIHJvdXRlKTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC50YXBDYXRjaChlID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0c2VsZi5jb25zb2xlRGVidWcuZXJyb3IoYHJlbmRlclJvdXRlc2AsIGUubWVzc2FnZSlcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdDtcblx0XHRcdH0pXG5cdFx0XHQudGFwKCgpID0+IHtcblx0XHRcdFx0c2VsZi5jb25zb2xlRGVidWcuc3VjY2VzcyhgcmVuZGVyUm91dGVzOmRvbmVgLCByb3V0ZXMsIHJvdXRlcy5sZW5ndGgpO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdGRlc3Ryb3koKVxuXHR7XG5cdFx0Ly8gTk9PUFxuXHR9XG5cblx0cHJvdGVjdGVkIGdldFBhZ2VDb250ZW50cyhqc2RvbTogSlNET00sIG9wdGlvbnM6IElKU0RPTVJlbmRlcmVyT3B0aW9ucywgb3JpZ2luYWxSb3V0ZTogc3RyaW5nKTogQmx1ZWJpcmQ8SVJlc3VsdD5cblx0e1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRyZXR1cm4gbmV3IEJsdWViaXJkPElSZXN1bHQ+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+XG5cdFx0e1xuXHRcdFx0bGV0IGludDogbnVtYmVyO1xuXG5cdFx0XHRsZXQgX3Jlc29sdmVkOiBib29sZWFuO1xuXG5cdFx0XHRhc3luYyBmdW5jdGlvbiBjYXB0dXJlRG9jdW1lbnQoKVxuXHRcdFx0e1xuXHRcdFx0XHRfcmVzb2x2ZWQgPSB0cnVlO1xuXHRcdFx0XHRyZXNldFRpbWVyKCk7XG5cblx0XHRcdFx0cmV0dXJuIEJsdWViaXJkXG5cdFx0XHRcdFx0LmRlbGF5KG9wdGlvbnMucmVuZGVyQWZ0ZXJEZWxheSB8IDApXG5cdFx0XHRcdFx0LnRoZW4oKCkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zdCByZXN1bHQ6IElSZXN1bHQgPSB7XG5cdFx0XHRcdFx0XHRcdG9yaWdpbmFsUm91dGU6IG9yaWdpbmFsUm91dGUsXG5cdFx0XHRcdFx0XHRcdHJvdXRlOiBvcmlnaW5hbFJvdXRlLFxuXHRcdFx0XHRcdFx0XHRodG1sOiBqc2RvbS5zZXJpYWxpemUoKSxcblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdGpzZG9tLndpbmRvdy5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHJlc3VsdFxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRhcCgoKSA9PiB7XG5cdFx0XHRcdFx0XHRzZWxmLmNvbnNvbGVEZWJ1Zy5zdWNjZXNzKGBjYXB0dXJlRG9jdW1lbnQ6ZG9uZWAsIG9yaWdpbmFsUm91dGUpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRhcENhdGNoKGUgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzZWxmLmNvbnNvbGVEZWJ1Zy5lcnJvcihgY2FwdHVyZURvY3VtZW50YCwgZSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIHJlc2V0VGltZXIoKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoaW50ICE9IG51bGwpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjbGVhckludGVydmFsKGludClcblx0XHRcdFx0XHRpbnQgPSBudWxsO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGRvbmUoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXNldFRpbWVyKCk7XG5cblx0XHRcdFx0aWYgKCFfcmVzb2x2ZWQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXNvbHZlKGNhcHR1cmVEb2N1bWVudCgpKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0XHQvLyBDQVBUVVJFIFdIRU4gQU4gRVZFTlQgRklSRVMgT04gVEhFIERPQ1VNRU5UXG5cdFx0XHRpZiAob3B0aW9ucy5yZW5kZXJBZnRlckRvY3VtZW50RXZlbnQpXG5cdFx0XHR7XG5cdFx0XHRcdGJvb2wgPSB0cnVlO1xuXG5cdFx0XHRcdGpzZG9tLndpbmRvdy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKG9wdGlvbnMucmVuZGVyQWZ0ZXJEb2N1bWVudEV2ZW50LCAoKSA9PiBkb25lKCkpXG5cblx0XHRcdFx0Ly8gQ0FQVFVSRSBPTkNFIEEgU1BFQ0lGQyBFTEVNRU5UIEVYSVNUU1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob3B0aW9ucy5yZW5kZXJBZnRlckVsZW1lbnRFeGlzdHMpXG5cdFx0XHR7XG5cdFx0XHRcdGJvb2wgPSB0cnVlO1xuXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0aW50ID0gc2V0SW50ZXJ2YWwoKCkgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChqc2RvbS53aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihvcHRpb25zLnJlbmRlckFmdGVyRWxlbWVudEV4aXN0cykpIGRvbmUoKVxuXHRcdFx0XHR9LCAxMDApXG5cblx0XHRcdFx0Ly8gQ0FQVFVSRSBBRlRFUiBBIE5VTUJFUiBPRiBNSUxMSVNFQ09ORFNcblx0XHRcdH1cblxuXHRcdFx0aWYgKGJvb2wpXG5cdFx0XHR7XG5cdFx0XHRcdHNldFRpbWVvdXQoZG9uZSwgKG9wdGlvbnMucmVuZGVyQWZ0ZXJUaW1lTWF4IHwgMCkgfHwgMzAwMDApXG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChvcHRpb25zLnJlbmRlckFmdGVyVGltZSlcblx0XHRcdHtcblx0XHRcdFx0c2V0VGltZW91dChkb25lLCBvcHRpb25zLnJlbmRlckFmdGVyVGltZSlcblxuXHRcdFx0XHQvLyBERUZBVUxUOiBSVU4gSU1NRURJQVRFTFlcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0ZG9uZSgpXG5cdFx0XHR9XG5cdFx0fSlcblx0fVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElQb3N0UHJvY2Vzc0NvbnRleHRcbntcblx0LyoqXG5cdCAqIFRoZSBwcmVyZW5kZXJlZCByb3V0ZSwgYWZ0ZXIgZm9sbG93aW5nIHJlZGlyZWN0cy5cblx0ICovXG5cdHJvdXRlOiBzdHJpbmdcblx0LyoqXG5cdCAqIFRoZSBvcmlnaW5hbCByb3V0ZSBwYXNzZWQsIGJlZm9yZSByZWRpcmVjdHMuXG5cdCAqL1xuXHRvcmlnaW5hbFJvdXRlOiBzdHJpbmdcblx0LyoqXG5cdCAqIFRoZSBwYXRoIHRvIHdyaXRlIHRoZSByZW5kZXJlZCBIVE1MIHRvLlxuXHQgKi9cblx0aHRtbDogc3RyaW5nXG5cdC8qKlxuXHQgKiBUaGUgcGF0aCB0byB3cml0ZSB0aGUgcmVuZGVyZWQgSFRNTCB0by5cblx0ICogVGhpcyBpcyBudWxsIChhdXRvbWF0aWNhbGx5IGNhbGN1bGF0ZWQgYWZ0ZXIgcG9zdFByb2Nlc3MpXG5cdCAqIHVubGVzcyBleHBsaWNpdGx5IHNldC5cblx0ICovXG5cdG91dHB1dFBhdGg/OiBzdHJpbmdcbn1cblxuZXhwb3J0IHR5cGUgSVJlc29sdmFibGU8Uj4gPSBSIHwgUHJvbWlzZUxpa2U8Uj47XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVByZXJlbmRlcmVyT3B0aW9uc1xue1xuXHRzdGF0aWNEaXI/OiBzdHJpbmcsXG5cdG91dHB1dERpcj86IHN0cmluZyxcblx0aW5kZXhQYXRoPzogc3RyaW5nLFxuXG5cdC8qKlxuXHQgKiBUaGUgcG9zdFByb2Nlc3MoT2JqZWN0IGNvbnRleHQpOiBPYmplY3QgfCBQcm9taXNlIGZ1bmN0aW9uIGluIHlvdXIgcmVuZGVyZXIgY29uZmlndXJhdGlvbiBhbGxvd3MgeW91IHRvIGFkanVzdCB0aGUgb3V0cHV0IG9mIHByZXJlbmRlci1zcGEtcGx1Z2luIGJlZm9yZSB3cml0aW5nIGl0IHRvIGEgZmlsZS5cblx0ICogSXQgaXMgY2FsbGVkIG9uY2UgcGVyIHJlbmRlcmVkIHJvdXRlIGFuZCBpcyBwYXNzZWQgYSBjb250ZXh0IG9iamVjdCBpbiB0aGUgZm9ybSBvZjpcblx0ICpcblx0ICogQHBhcmFtIHtJUG9zdFByb2Nlc3NDb250ZXh0fSBjb250ZXh0XG5cdCAqIEByZXR1cm5zIHtJUmVzb2x2YWJsZTxJUG9zdFByb2Nlc3NDb250ZXh0Pn1cblx0ICovXG5cdHBvc3RQcm9jZXNzPyhjb250ZXh0OiBJUG9zdFByb2Nlc3NDb250ZXh0KTogSVJlc29sdmFibGU8SVBvc3RQcm9jZXNzQ29udGV4dD4sXG5cblx0c2VydmVyPzoge1xuXHRcdC8qKlxuXHRcdCAqIFRoZSBwb3J0IGZvciB0aGUgYXBwIHNlcnZlciB0byBydW4gb24uXG5cdFx0ICovXG5cdFx0cG9ydD86IG51bWJlcixcblx0XHQvKipcblx0XHQgKiBQcm94eSBjb25maWd1cmF0aW9uLiBIYXMgdGhlIHNhbWUgc2lnbmF0dXJlIGFzIHdlYnBhY2stZGV2LXNlcnZlclxuXHRcdCAqL1xuXHRcdHByb3h5Pzogb2JqZWN0LFxuXHR9LFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElSZXN1bHRcbntcblx0b3JpZ2luYWxSb3V0ZTogc3RyaW5nLFxuXHRyb3V0ZTogc3RyaW5nLFxuXHRodG1sOiBzdHJpbmcsXG59XG5cbmV4cG9ydCBkZWZhdWx0IEpTRE9NUmVuZGVyZXJcbiJdfQ==
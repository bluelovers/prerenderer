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
        const startTime = Date.now();
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
        })
            .finally(() => {
            self.consoleDebug.debug(`renderRoutes:end`, routes, `used`, (Date.now() - startTime) / 1000, 'sec');
        });
    }
    destroy() {
        // NOOP
    }
    getPageContents(jsdom, options, originalRoute) {
        options = options || {};
        const self = this;
        return new bluebird_1.default(async (resolve, reject) => {
            const startTime = Date.now();
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
                })
                    .finally(() => {
                    self.consoleDebug.debug(`captureDocument:end`, originalRoute, `used`, (Date.now() - startTime) / 1000, 'sec');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQXdEO0FBQ3hELHdEQUErQjtBQUMvQiw2REFBK0M7QUFvRC9DLE1BQWEsYUFBYTtJQWtCekIsWUFBWSxlQUFzQztRQVp4QyxxQkFBZ0IsR0FBMEIsRUFBRSxDQUFDO1FBRzdDLGlCQUFZLEdBQUcsSUFBSSxzQkFBTyxDQUFDLHNCQUFPLEVBQUU7WUFDN0MsS0FBSyxFQUFFLElBQUk7WUFDWCxJQUFJLEVBQUUsSUFBSTtZQUNWLGFBQWEsQ0FBQyxJQUFJO2dCQUVqQixPQUFPLElBQUksYUFBYSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUM7WUFDM0QsQ0FBQztTQUNELENBQUMsQ0FBQztRQUlGLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRXRELElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixJQUFJLElBQUk7WUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO1FBRXJHLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQ3pFO1lBQ0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUMsdUJBQXVCLENBQUE7U0FDNUU7UUFFRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQ3BDO1lBQ0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1NBQ2xDO0lBQ0YsQ0FBQztJQUVELFlBQVk7UUFFWCxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUE7SUFDcEMsQ0FB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QyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLENBQUM7d0JBQUUsSUFBSSxFQUFFLENBQUE7Z0JBQ2xGLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtnQkFFUCx5Q0FBeUM7YUFDekM7WUFFRCxJQUFJLElBQUksRUFDUjtnQkFDQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFBO2FBQzNEO2lCQUNJLElBQUksT0FBTyxDQUFDLGVBQWUsRUFDaEM7Z0JBQ0MsVUFBVSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7Z0JBRXpDLDJCQUEyQjthQUMzQjtpQkFFRDtnQkFDQyxJQUFJLEVBQUUsQ0FBQTthQUNOO1FBQ0YsQ0FBQyxDQUFDLENBQUE7SUFDSCxDQUFDOztBQXBPTSw4QkFBZ0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQzVFLHFDQUF1QixHQUFHLHNCQUFzQixDQUFDO0FBQ2pELGdCQUFFLEdBQUcsZUFBZSxDQUFDO0FBSjdCLHNDQXVPQztBQTRERCxrQkFBZSxhQUFhLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBET01XaW5kb3csIEpTRE9NLCBWaXJ0dWFsQ29uc29sZSB9IGZyb20gJ2pzZG9tJ1xuaW1wb3J0IEJsdWViaXJkIGZyb20gJ2JsdWViaXJkJ1xuaW1wb3J0IGNvbnNvbGUsIHsgQ29uc29sZSB9IGZyb20gJ2RlYnVnLWNvbG9yMidcblxuZXhwb3J0IGludGVyZmFjZSBJSlNET01SZW5kZXJlck9wdGlvbnNcbntcblx0LyoqXG5cdCAqIDAgKE5vIGxpbWl0KVxuXHQgKlxuXHQgKiBUaGUgbnVtYmVyIG9mIHJvdXRlcyBhbGxvd2VkIHRvIGJlIHJlbmRlcmVkIGF0IHRoZSBzYW1lIHRpbWUuIFVzZWZ1bCBmb3IgYnJlYWtpbmcgZG93biBtYXNzaXZlIGJhdGNoZXMgb2Ygcm91dGVzIGludG8gc21hbGxlciBjaHVua3MuXG5cdCAqL1xuXHRtYXhDb25jdXJyZW50Um91dGVzPzogbnVtYmVyLFxuXHQvKipcblx0ICogQW4gb2JqZWN0IHRvIGluamVjdCBpbnRvIHRoZSBnbG9iYWwgc2NvcGUgb2YgdGhlIHJlbmRlcmVkIHBhZ2UgYmVmb3JlIGl0IGZpbmlzaGVzIGxvYWRpbmcuIE11c3QgYmUgSlNPTi5zdHJpbmdpZml5LWFibGUuIFRoZSBwcm9wZXJ0eSBpbmplY3RlZCB0byBpcyB3aW5kb3dbJ19fUFJFUkVOREVSX0lOSkVDVEVEJ10gYnkgZGVmYXVsdC5cblx0ICovXG5cdGluamVjdD86IG9iamVjdCxcblx0LyoqXG5cdCAqIFRoZSBwcm9wZXJ0eSB0byBtb3VudCBpbmplY3QgdG8gZHVyaW5nIHJlbmRlcmluZy5cblx0ICovXG5cdGluamVjdFByb3BlcnR5Pzogc3RyaW5nLFxuXHQvKipcblx0ICogV2FpdCB0byByZW5kZXIgdW50aWwgdGhlIHNwZWNpZmllZCBldmVudCBpcyBmaXJlZCBvbiB0aGUgZG9jdW1lbnQuIChZb3UgY2FuIGZpcmUgYW4gZXZlbnQgbGlrZSBzbzogZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoJ2N1c3RvbS1yZW5kZXItdHJpZ2dlcicpKVxuXHQgKi9cblx0cmVuZGVyQWZ0ZXJEb2N1bWVudEV2ZW50Pzogc3RyaW5nLFxuXHQvKipcblx0ICogKFNlbGVjdG9yKVxuXHQgKlxuXHQgKiBXYWl0IHRvIHJlbmRlciB1bnRpbCB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgaXMgZGV0ZWN0ZWQgdXNpbmcgZG9jdW1lbnQucXVlcnlTZWxlY3RvclxuXHQgKi9cblx0cmVuZGVyQWZ0ZXJFbGVtZW50RXhpc3RzPzogc3RyaW5nLFxuXHQvKipcblx0ICogKE1pbGxpc2Vjb25kcylcblx0ICpcblx0ICogV2FpdCB0byByZW5kZXIgdW50aWwgYSBjZXJ0YWluIGFtb3VudCBvZiB0aW1lIGhhcyBwYXNzZWQuXG5cdCAqL1xuXHRyZW5kZXJBZnRlclRpbWU/OiBudW1iZXIsXG5cblx0LyoqXG5cdCAqIHRoZSBtYXggdGltZW91dFxuXHQgKi9cblx0cmVuZGVyQWZ0ZXJUaW1lTWF4PzogbnVtYmVyLFxuXG5cdC8qKlxuXHQgKiBkZWxheSBhZnRlciByZW5kZXJBZnRlckRvY3VtZW50RXZlbnQgcmVuZGVyQWZ0ZXJFbGVtZW50RXhpc3RzXG5cdCAqL1xuXHRyZW5kZXJBZnRlckRlbGF5PzogbnVtYmVyLFxuXG5cdHJlZmVycmVyPzogc3RyaW5nIHwgVVJMLFxuXG5cdGRpc2FibGVMb2c/OiBib29sZWFuLFxufVxuXG5leHBvcnQgdHlwZSBJUm91dGVzID0gc3RyaW5nW107XG5cbmV4cG9ydCBjbGFzcyBKU0RPTVJlbmRlcmVyXG57XG5cdHN0YXRpYyBERUZBVUxUX1JFRkVSUkVSID0gbmV3IFVSTChgaHR0cHM6Ly9wcmVyZW5kZXJlci1yZW5kZXJlci1qc2RvbWApLnRvU3RyaW5nKCk7XG5cdHN0YXRpYyBERUZBVUxUX0lOSkVDVF9QUk9QRVJUWSA9ICdfX1BSRVJFTkRFUl9JTkpFQ1RFRCc7XG5cdHN0YXRpYyBJRCA9ICdKU0RPTVJlbmRlcmVyJztcblxuXHRwcm90ZWN0ZWQgX3JlbmRlcmVyT3B0aW9uczogSUpTRE9NUmVuZGVyZXJPcHRpb25zID0ge307XG5cdHByb3RlY3RlZCBfdmlydHVhbENvbnNvbGU6IFZpcnR1YWxDb25zb2xlO1xuXG5cdHByb3RlY3RlZCBjb25zb2xlRGVidWcgPSBuZXcgQ29uc29sZShjb25zb2xlLCB7XG5cdFx0bGFiZWw6IHRydWUsXG5cdFx0dGltZTogdHJ1ZSxcblx0XHRsYWJlbEZvcm1hdEZuKGRhdGEpOiBzdHJpbmdcblx0XHR7XG5cdFx0XHRyZXR1cm4gYFske0pTRE9NUmVuZGVyZXIuSUR9OiR7ZGF0YS5uYW1lLnRvVXBwZXJDYXNlKCl9XWA7XG5cdFx0fVxuXHR9KTtcblxuXHRjb25zdHJ1Y3RvcihyZW5kZXJlck9wdGlvbnM6IElKU0RPTVJlbmRlcmVyT3B0aW9ucylcblx0e1xuXHRcdE9iamVjdC5hc3NpZ24odGhpcy5fcmVuZGVyZXJPcHRpb25zLCByZW5kZXJlck9wdGlvbnMpO1xuXG5cdFx0aWYgKHRoaXMuX3JlbmRlcmVyT3B0aW9ucy5tYXhDb25jdXJyZW50Um91dGVzID09IG51bGwpIHRoaXMuX3JlbmRlcmVyT3B0aW9ucy5tYXhDb25jdXJyZW50Um91dGVzID0gMDtcblxuXHRcdGlmICh0aGlzLl9yZW5kZXJlck9wdGlvbnMuaW5qZWN0ICYmICF0aGlzLl9yZW5kZXJlck9wdGlvbnMuaW5qZWN0UHJvcGVydHkpXG5cdFx0e1xuXHRcdFx0dGhpcy5fcmVuZGVyZXJPcHRpb25zLmluamVjdFByb3BlcnR5ID0gSlNET01SZW5kZXJlci5ERUZBVUxUX0lOSkVDVF9QUk9QRVJUWVxuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9yZW5kZXJlck9wdGlvbnMuZGlzYWJsZUxvZylcblx0XHR7XG5cdFx0XHR0aGlzLmNvbnNvbGVEZWJ1Zy5lbmFibGVkID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0aW5qZWN0T2JqZWN0KClcblx0e1xuXHRcdHJldHVybiB0aGlzLl9yZW5kZXJlck9wdGlvbnMuaW5qZWN0XG5cdH1cblxuXHRpbml0aWFsaXplKClcblx0e1xuXHRcdC8vIE5PT1Bcblx0XHRyZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZSgpXG5cdH1cblxuXHRnZXRWaXJ0dWFsQ29uc29sZSgpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fdmlydHVhbENvbnNvbGUgfHwgKHRoaXMuX3ZpcnR1YWxDb25zb2xlID0gbmV3IFZpcnR1YWxDb25zb2xlKCkpO1xuXHR9XG5cblx0cmVuZGVyUm91dGVzKHJvdXRlczogSVJvdXRlcywgUHJlcmVuZGVyZXI6IHtcblx0XHRnZXRPcHRpb25zKCk6IElQcmVyZW5kZXJlck9wdGlvbnNcblx0fSk6IEJsdWViaXJkPElSZXN1bHRbXT5cblx0e1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG5cblx0XHRyZXR1cm4gQmx1ZWJpcmQucmVzb2x2ZSgpXG5cdFx0XHQudGhlbigoKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRjb25zdCByb290T3B0aW9ucyA9IFByZXJlbmRlcmVyLmdldE9wdGlvbnMoKTtcblxuXHRcdFx0XHRjb25zdCBfcmVuZGVyZXJPcHRpb25zID0gdGhpcy5fcmVuZGVyZXJPcHRpb25zO1xuXHRcdFx0XHRjb25zdCB2aXJ0dWFsQ29uc29sZSA9IHNlbGYuZ2V0VmlydHVhbENvbnNvbGUoKTtcblxuXHRcdFx0XHR2aXJ0dWFsQ29uc29sZS5vbignanNkb21FcnJvcicsIGUgPT4gc2VsZi5jb25zb2xlRGVidWcuZXJyb3IoJ2pzZG9tRXJyb3InLCBlKSk7XG5cblx0XHRcdFx0Y29uc3QgcmVmZXJyZXIgPSBfcmVuZGVyZXJPcHRpb25zLnJlZmVycmVyXG5cdFx0XHRcdFx0PyBfcmVuZGVyZXJPcHRpb25zLnJlZmVycmVyLnRvU3RyaW5nKClcblx0XHRcdFx0XHQ6IEpTRE9NUmVuZGVyZXIuREVGQVVMVF9SRUZFUlJFUjtcblxuXHRcdFx0XHRyZXR1cm4gQmx1ZWJpcmRcblx0XHRcdFx0XHQucmVzb2x2ZShyb3V0ZXMpXG5cdFx0XHRcdFx0Lm1hcChhc3luYyAocm91dGUpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0c2VsZi5jb25zb2xlRGVidWcuZGVidWcoYHJvdXRlOnN0YXJ0YCwgcm91dGUpO1xuXG5cdFx0XHRcdFx0XHRjb25zdCBqc2RvbSA9IGF3YWl0IEpTRE9NLmZyb21VUkwoYGh0dHA6Ly8xMjcuMC4wLjE6JHtyb290T3B0aW9ucy5zZXJ2ZXIucG9ydH0ke3JvdXRlfWAsIHtcblx0XHRcdFx0XHRcdFx0cmVzb3VyY2VzOiAndXNhYmxlJyxcblx0XHRcdFx0XHRcdFx0cnVuU2NyaXB0czogJ2Rhbmdlcm91c2x5Jyxcblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRwcmV0ZW5kVG9CZVZpc3VhbDogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0aW5jbHVkZU5vZGVMb2NhdGlvbnM6IHRydWUsXG5cblx0XHRcdFx0XHRcdFx0cmVmZXJyZXIsXG5cblx0XHRcdFx0XHRcdFx0VmlydHVhbENvbnNvbGU6IHZpcnR1YWxDb25zb2xlLFxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdGlmIChfcmVuZGVyZXJPcHRpb25zLmluamVjdClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0anNkb20ud2luZG93W19yZW5kZXJlck9wdGlvbnMuaW5qZWN0UHJvcGVydHldID0gc2VsZi5pbmplY3RPYmplY3QoKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0anNkb20ud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZnVuY3Rpb24gKGV2ZW50KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvL3NlbGYuY29uc29sZURlYnVnLmVycm9yKGB3aW5kb3cuZXJyb3JgLCByb3V0ZSwgZXZlbnQuZXJyb3IpXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIHNlbGYuZ2V0UGFnZUNvbnRlbnRzKGpzZG9tLCBfcmVuZGVyZXJPcHRpb25zLCByb3V0ZSlcblx0XHRcdFx0XHRcdFx0LnRhcChmdW5jdGlvbiAoKVxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0c2VsZi5jb25zb2xlRGVidWcuZGVidWcoYHJvdXRlOmVuZGAsIHJvdXRlKTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC50YXBDYXRjaChlID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0c2VsZi5jb25zb2xlRGVidWcuZXJyb3IoYHJlbmRlclJvdXRlc2AsIGUubWVzc2FnZSlcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdDtcblx0XHRcdH0pXG5cdFx0XHQudGFwKCgpID0+IHtcblx0XHRcdFx0c2VsZi5jb25zb2xlRGVidWcuc3VjY2VzcyhgcmVuZGVyUm91dGVzOmRvbmVgLCByb3V0ZXMsIHJvdXRlcy5sZW5ndGgpO1xuXHRcdFx0fSlcblx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0c2VsZi5jb25zb2xlRGVidWcuZGVidWcoYHJlbmRlclJvdXRlczplbmRgLCByb3V0ZXMsIGB1c2VkYCwgKERhdGUubm93KCkgLSBzdGFydFRpbWUpIC8gMTAwMCAsICdzZWMnKTtcblx0XHRcdH0pXG5cdFx0XHQ7XG5cdH1cblxuXHRkZXN0cm95KClcblx0e1xuXHRcdC8vIE5PT1Bcblx0fVxuXG5cdHByb3RlY3RlZCBnZXRQYWdlQ29udGVudHMoanNkb206IEpTRE9NLCBvcHRpb25zOiBJSlNET01SZW5kZXJlck9wdGlvbnMsIG9yaWdpbmFsUm91dGU6IHN0cmluZyk6IEJsdWViaXJkPElSZXN1bHQ+XG5cdHtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXG5cdFx0cmV0dXJuIG5ldyBCbHVlYmlyZDxJUmVzdWx0Pihhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PlxuXHRcdHtcblx0XHRcdGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG5cblx0XHRcdGxldCBpbnQ6IG51bWJlcjtcblxuXHRcdFx0bGV0IF9yZXNvbHZlZDogYm9vbGVhbjtcblxuXHRcdFx0YXN5bmMgZnVuY3Rpb24gY2FwdHVyZURvY3VtZW50KClcblx0XHRcdHtcblx0XHRcdFx0X3Jlc29sdmVkID0gdHJ1ZTtcblx0XHRcdFx0cmVzZXRUaW1lcigpO1xuXG5cdFx0XHRcdHJldHVybiBCbHVlYmlyZFxuXHRcdFx0XHRcdC5kZWxheShvcHRpb25zLnJlbmRlckFmdGVyRGVsYXkgfCAwKVxuXHRcdFx0XHRcdC50aGVuKCgpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29uc3QgcmVzdWx0OiBJUmVzdWx0ID0ge1xuXHRcdFx0XHRcdFx0XHRvcmlnaW5hbFJvdXRlOiBvcmlnaW5hbFJvdXRlLFxuXHRcdFx0XHRcdFx0XHRyb3V0ZTogb3JpZ2luYWxSb3V0ZSxcblx0XHRcdFx0XHRcdFx0aHRtbDoganNkb20uc2VyaWFsaXplKCksXG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRqc2RvbS53aW5kb3cuY2xvc2UoKTtcblx0XHRcdFx0XHRcdHJldHVybiByZXN1bHRcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC50YXAoKCkgPT4ge1xuXHRcdFx0XHRcdFx0c2VsZi5jb25zb2xlRGVidWcuc3VjY2VzcyhgY2FwdHVyZURvY3VtZW50OmRvbmVgLCBvcmlnaW5hbFJvdXRlKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC50YXBDYXRjaChlID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0c2VsZi5jb25zb2xlRGVidWcuZXJyb3IoYGNhcHR1cmVEb2N1bWVudGAsIGUpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHRcdFx0c2VsZi5jb25zb2xlRGVidWcuZGVidWcoYGNhcHR1cmVEb2N1bWVudDplbmRgLCBvcmlnaW5hbFJvdXRlLCBgdXNlZGAsIChEYXRlLm5vdygpIC0gc3RhcnRUaW1lKSAvIDEwMDAgLCAnc2VjJyk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIHJlc2V0VGltZXIoKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoaW50ICE9IG51bGwpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjbGVhckludGVydmFsKGludClcblx0XHRcdFx0XHRpbnQgPSBudWxsO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGRvbmUoKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXNldFRpbWVyKCk7XG5cblx0XHRcdFx0aWYgKCFfcmVzb2x2ZWQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXNvbHZlKGNhcHR1cmVEb2N1bWVudCgpKVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGxldCBib29sOiBib29sZWFuO1xuXG5cdFx0XHQvLyBDQVBUVVJFIFdIRU4gQU4gRVZFTlQgRklSRVMgT04gVEhFIERPQ1VNRU5UXG5cdFx0XHRpZiAob3B0aW9ucy5yZW5kZXJBZnRlckRvY3VtZW50RXZlbnQpXG5cdFx0XHR7XG5cdFx0XHRcdGJvb2wgPSB0cnVlO1xuXG5cdFx0XHRcdGpzZG9tLndpbmRvdy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKG9wdGlvbnMucmVuZGVyQWZ0ZXJEb2N1bWVudEV2ZW50LCAoKSA9PiBkb25lKCkpXG5cblx0XHRcdFx0Ly8gQ0FQVFVSRSBPTkNFIEEgU1BFQ0lGQyBFTEVNRU5UIEVYSVNUU1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob3B0aW9ucy5yZW5kZXJBZnRlckVsZW1lbnRFeGlzdHMpXG5cdFx0XHR7XG5cdFx0XHRcdGJvb2wgPSB0cnVlO1xuXG5cdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0aW50ID0gc2V0SW50ZXJ2YWwoKCkgPT5cblx0XHRcdFx0e1xuXHRcdFx0XHRcdGlmIChqc2RvbS53aW5kb3cuZG9jdW1lbnQucXVlcnlTZWxlY3RvcihvcHRpb25zLnJlbmRlckFmdGVyRWxlbWVudEV4aXN0cykpIGRvbmUoKVxuXHRcdFx0XHR9LCAxMDApXG5cblx0XHRcdFx0Ly8gQ0FQVFVSRSBBRlRFUiBBIE5VTUJFUiBPRiBNSUxMSVNFQ09ORFNcblx0XHRcdH1cblxuXHRcdFx0aWYgKGJvb2wpXG5cdFx0XHR7XG5cdFx0XHRcdHNldFRpbWVvdXQoZG9uZSwgKG9wdGlvbnMucmVuZGVyQWZ0ZXJUaW1lTWF4IHwgMCkgfHwgMzAwMDApXG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChvcHRpb25zLnJlbmRlckFmdGVyVGltZSlcblx0XHRcdHtcblx0XHRcdFx0c2V0VGltZW91dChkb25lLCBvcHRpb25zLnJlbmRlckFmdGVyVGltZSlcblxuXHRcdFx0XHQvLyBERUZBVUxUOiBSVU4gSU1NRURJQVRFTFlcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0ZG9uZSgpXG5cdFx0XHR9XG5cdFx0fSlcblx0fVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElQb3N0UHJvY2Vzc0NvbnRleHRcbntcblx0LyoqXG5cdCAqIFRoZSBwcmVyZW5kZXJlZCByb3V0ZSwgYWZ0ZXIgZm9sbG93aW5nIHJlZGlyZWN0cy5cblx0ICovXG5cdHJvdXRlOiBzdHJpbmdcblx0LyoqXG5cdCAqIFRoZSBvcmlnaW5hbCByb3V0ZSBwYXNzZWQsIGJlZm9yZSByZWRpcmVjdHMuXG5cdCAqL1xuXHRvcmlnaW5hbFJvdXRlOiBzdHJpbmdcblx0LyoqXG5cdCAqIFRoZSBwYXRoIHRvIHdyaXRlIHRoZSByZW5kZXJlZCBIVE1MIHRvLlxuXHQgKi9cblx0aHRtbDogc3RyaW5nXG5cdC8qKlxuXHQgKiBUaGUgcGF0aCB0byB3cml0ZSB0aGUgcmVuZGVyZWQgSFRNTCB0by5cblx0ICogVGhpcyBpcyBudWxsIChhdXRvbWF0aWNhbGx5IGNhbGN1bGF0ZWQgYWZ0ZXIgcG9zdFByb2Nlc3MpXG5cdCAqIHVubGVzcyBleHBsaWNpdGx5IHNldC5cblx0ICovXG5cdG91dHB1dFBhdGg/OiBzdHJpbmdcbn1cblxuZXhwb3J0IHR5cGUgSVJlc29sdmFibGU8Uj4gPSBSIHwgUHJvbWlzZUxpa2U8Uj47XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVByZXJlbmRlcmVyT3B0aW9uc1xue1xuXHRzdGF0aWNEaXI/OiBzdHJpbmcsXG5cdG91dHB1dERpcj86IHN0cmluZyxcblx0aW5kZXhQYXRoPzogc3RyaW5nLFxuXG5cdC8qKlxuXHQgKiBUaGUgcG9zdFByb2Nlc3MoT2JqZWN0IGNvbnRleHQpOiBPYmplY3QgfCBQcm9taXNlIGZ1bmN0aW9uIGluIHlvdXIgcmVuZGVyZXIgY29uZmlndXJhdGlvbiBhbGxvd3MgeW91IHRvIGFkanVzdCB0aGUgb3V0cHV0IG9mIHByZXJlbmRlci1zcGEtcGx1Z2luIGJlZm9yZSB3cml0aW5nIGl0IHRvIGEgZmlsZS5cblx0ICogSXQgaXMgY2FsbGVkIG9uY2UgcGVyIHJlbmRlcmVkIHJvdXRlIGFuZCBpcyBwYXNzZWQgYSBjb250ZXh0IG9iamVjdCBpbiB0aGUgZm9ybSBvZjpcblx0ICpcblx0ICogQHBhcmFtIHtJUG9zdFByb2Nlc3NDb250ZXh0fSBjb250ZXh0XG5cdCAqIEByZXR1cm5zIHtJUmVzb2x2YWJsZTxJUG9zdFByb2Nlc3NDb250ZXh0Pn1cblx0ICovXG5cdHBvc3RQcm9jZXNzPyhjb250ZXh0OiBJUG9zdFByb2Nlc3NDb250ZXh0KTogSVJlc29sdmFibGU8SVBvc3RQcm9jZXNzQ29udGV4dD4sXG5cblx0c2VydmVyPzoge1xuXHRcdC8qKlxuXHRcdCAqIFRoZSBwb3J0IGZvciB0aGUgYXBwIHNlcnZlciB0byBydW4gb24uXG5cdFx0ICovXG5cdFx0cG9ydD86IG51bWJlcixcblx0XHQvKipcblx0XHQgKiBQcm94eSBjb25maWd1cmF0aW9uLiBIYXMgdGhlIHNhbWUgc2lnbmF0dXJlIGFzIHdlYnBhY2stZGV2LXNlcnZlclxuXHRcdCAqL1xuXHRcdHByb3h5Pzogb2JqZWN0LFxuXHR9LFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElSZXN1bHRcbntcblx0b3JpZ2luYWxSb3V0ZTogc3RyaW5nLFxuXHRyb3V0ZTogc3RyaW5nLFxuXHRodG1sOiBzdHJpbmcsXG59XG5cbmV4cG9ydCBkZWZhdWx0IEpTRE9NUmVuZGVyZXJcbiJdfQ==
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
            //virtualConsole.on('jsdomError', e => self.consoleDebug.error('jsdomError', e));
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
                    virtualConsole,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQXdEO0FBQ3hELHdEQUErQjtBQUMvQiw2REFBK0M7QUFvRC9DLE1BQWEsYUFBYTtJQWtCekIsWUFBWSxlQUFzQztRQVp4QyxxQkFBZ0IsR0FBMEIsRUFBRSxDQUFDO1FBRzdDLGlCQUFZLEdBQUcsSUFBSSxzQkFBTyxDQUFDLHNCQUFPLEVBQUU7WUFDN0MsS0FBSyxFQUFFLElBQUk7WUFDWCxJQUFJLEVBQUUsSUFBSTtZQUNWLGFBQWEsQ0FBQyxJQUFJO2dCQUVqQixPQUFPLElBQUksYUFBYSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUM7WUFDM0QsQ0FBQztTQUNELENBQUMsQ0FBQztRQUlGLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRXRELElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixJQUFJLElBQUk7WUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO1FBRXJHLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQ3pFO1lBQ0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUMsdUJBQXVCLENBQUE7U0FDNUU7UUFFRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQ3BDO1lBQ0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1NBQ2xDO0lBQ0YsQ0FBQztJQUVELFlBQVk7UUFFWCxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUE7SUFDcEMsQ0FBQztJQUVELFVBQVU7UUFFVCxPQUFPO1FBQ1AsT0FBTyxrQkFBUSxDQUFDLE9BQU8sRUFBRSxDQUFBO0lBQzFCLENBQUM7SUFFRCxpQkFBaUI7UUFFaEIsT0FBTyxJQUFJLENBQUMsZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLHNCQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQzlFLENBQUM7SUFFRCxZQUFZLENBQUMsTUFBZSxFQUFFLFdBRTdCO1FBRUEsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUU3QixPQUFPLGtCQUFRLENBQUMsT0FBTyxFQUFFO2FBQ3ZCLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFFVixNQUFNLFdBQVcsR0FBRyxXQUFXLENBQUMsVUFBVSxFQUFFLENBQUM7WUFFN0MsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7WUFDL0MsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFFaEQsaUZBQWlGO1lBRWpGLE1BQU0sUUFBUSxHQUFHLGdCQUFnQixDQUFDLFFBQVE7Z0JBQ3pDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFO2dCQUN0QyxDQUFDLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDO1lBRWxDLE9BQU8sa0JBQVE7aUJBQ2IsT0FBTyxDQUFDLE1BQU0sQ0FBQztpQkFDZixHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO2dCQUVwQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBRTlDLE1BQU0sS0FBSyxHQUFHLE1BQU0sYUFBSyxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsV0FBVyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsS0FBSyxFQUFFLEVBQUU7b0JBQ3hGLFNBQVMsRUFBRSxRQUFRO29CQUNuQixVQUFVLEVBQUUsYUFBYTtvQkFDekIsYUFBYTtvQkFDYixpQkFBaUIsRUFBRSxJQUFJO29CQUN2QixvQkFBb0IsRUFBRSxJQUFJO29CQUUxQixRQUFRO29CQUVSLGNBQWMsRUFBRSxjQUFjO29CQUM5QixjQUFjO2lCQUNkLENBQUMsQ0FBQztnQkFFSCxJQUFJLGdCQUFnQixDQUFDLE1BQU0sRUFDM0I7b0JBQ0MsS0FBSyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7aUJBQ3BFO2dCQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFVBQVUsS0FBSztvQkFFckQsNkRBQTZEO2dCQUM5RCxDQUFDLENBQUMsQ0FBQztnQkFFSCxPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFFLEtBQUssQ0FBQztxQkFDekQsR0FBRyxDQUFDO29CQUVKLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDN0MsQ0FBQyxDQUFDLENBQUE7WUFDSixDQUFDLENBQUM7aUJBQ0QsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUViLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDbkQsQ0FBQyxDQUFDLENBQ0Q7UUFDSCxDQUFDLENBQUM7YUFDRCxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ1QsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2RSxDQUFDLENBQUM7YUFDRCxPQUFPLENBQUMsR0FBRyxFQUFFO1lBQ2IsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUMsR0FBRyxJQUFJLEVBQUcsS0FBSyxDQUFDLENBQUM7UUFDdEcsQ0FBQyxDQUFDLENBQ0Q7SUFDSCxDQUFDO0lBRUQsT0FBTztRQUVOLE9BQU87SUFDUixDQUFDO0lBRVMsZUFBZSxDQUFDLEtBQVksRUFBRSxPQUE4QixFQUFFLGFBQXFCO1FBRTVGLE9BQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFDO1FBRXhCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQztRQUVsQixPQUFPLElBQUksa0JBQVEsQ0FBVSxLQUFLLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBRXRELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUU3QixJQUFJLEdBQVcsQ0FBQztZQUVoQixJQUFJLFNBQWtCLENBQUM7WUFFdkIsS0FBSyxVQUFVLGVBQWU7Z0JBRTdCLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ2pCLFVBQVUsRUFBRSxDQUFDO2dCQUViLE9BQU8sa0JBQVE7cUJBQ2IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7cUJBQ25DLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBRVYsTUFBTSxNQUFNLEdBQVk7d0JBQ3ZCLGFBQWEsRUFBRSxhQUFhO3dCQUM1QixLQUFLLEVBQUUsYUFBYTt3QkFDcEIsSUFBSSxFQUFFLEtBQUssQ0FBQyxTQUFTLEVBQUU7cUJBQ3ZCLENBQUM7b0JBRUYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztvQkFDckIsT0FBTyxNQUFNLENBQUE7Z0JBQ2QsQ0FBQyxDQUFDO3FCQUNELEdBQUcsQ0FBQyxHQUFHLEVBQUU7b0JBQ1QsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ2xFLENBQUMsQ0FBQztxQkFDRCxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBRWIsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQy9DLENBQUMsQ0FBQztxQkFDRCxPQUFPLENBQUMsR0FBRyxFQUFFO29CQUNiLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLHFCQUFxQixFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDLEdBQUcsSUFBSSxFQUFHLEtBQUssQ0FBQyxDQUFDO2dCQUNoSCxDQUFDLENBQUMsQ0FDRDtZQUNILENBQUM7WUFFRCxTQUFTLFVBQVU7Z0JBRWxCLElBQUksR0FBRyxJQUFJLElBQUksRUFDZjtvQkFDQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUE7b0JBQ2xCLEdBQUcsR0FBRyxJQUFJLENBQUM7aUJBQ1g7WUFDRixDQUFDO1lBRUQsU0FBUyxJQUFJO2dCQUVaLFVBQVUsRUFBRSxDQUFDO2dCQUViLElBQUksQ0FBQyxTQUFTLEVBQ2Q7b0JBQ0MsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUE7aUJBQzFCO1lBQ0YsQ0FBQztZQUVELElBQUksSUFBYSxDQUFDO1lBRWxCLDhDQUE4QztZQUM5QyxJQUFJLE9BQU8sQ0FBQyx3QkFBd0IsRUFDcEM7Z0JBQ0MsSUFBSSxHQUFHLElBQUksQ0FBQztnQkFFWixLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtnQkFFdEYsd0NBQXdDO2FBQ3hDO1lBRUQsSUFBSSxPQUFPLENBQUMsd0JBQXdCLEVBQ3BDO2dCQUNDLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBRVosYUFBYTtnQkFDYixHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRTtvQkFFdEIsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLHdCQUF3QixDQUFDO3dCQUFFLElBQUksRUFBRSxDQUFBO2dCQUNsRixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUE7Z0JBRVAseUNBQXlDO2FBQ3pDO1lBRUQsSUFBSSxJQUFJLEVBQ1I7Z0JBQ0MsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQTthQUMzRDtpQkFDSSxJQUFJLE9BQU8sQ0FBQyxlQUFlLEVBQ2hDO2dCQUNDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO2dCQUV6QywyQkFBMkI7YUFDM0I7aUJBRUQ7Z0JBQ0MsSUFBSSxFQUFFLENBQUE7YUFDTjtRQUNGLENBQUMsQ0FBQyxDQUFBO0lBQ0gsQ0FBQzs7QUFyT00sOEJBQWdCLEdBQUcsSUFBSSxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUM1RSxxQ0FBdUIsR0FBRyxzQkFBc0IsQ0FBQztBQUNqRCxnQkFBRSxHQUFHLGVBQWUsQ0FBQztBQUo3QixzQ0F3T0M7QUE0REQsa0JBQWUsYUFBYSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRE9NV2luZG93LCBKU0RPTSwgVmlydHVhbENvbnNvbGUgfSBmcm9tICdqc2RvbSdcbmltcG9ydCBCbHVlYmlyZCBmcm9tICdibHVlYmlyZCdcbmltcG9ydCBjb25zb2xlLCB7IENvbnNvbGUgfSBmcm9tICdkZWJ1Zy1jb2xvcjInXG5cbmV4cG9ydCBpbnRlcmZhY2UgSUpTRE9NUmVuZGVyZXJPcHRpb25zXG57XG5cdC8qKlxuXHQgKiAwIChObyBsaW1pdClcblx0ICpcblx0ICogVGhlIG51bWJlciBvZiByb3V0ZXMgYWxsb3dlZCB0byBiZSByZW5kZXJlZCBhdCB0aGUgc2FtZSB0aW1lLiBVc2VmdWwgZm9yIGJyZWFraW5nIGRvd24gbWFzc2l2ZSBiYXRjaGVzIG9mIHJvdXRlcyBpbnRvIHNtYWxsZXIgY2h1bmtzLlxuXHQgKi9cblx0bWF4Q29uY3VycmVudFJvdXRlcz86IG51bWJlcixcblx0LyoqXG5cdCAqIEFuIG9iamVjdCB0byBpbmplY3QgaW50byB0aGUgZ2xvYmFsIHNjb3BlIG9mIHRoZSByZW5kZXJlZCBwYWdlIGJlZm9yZSBpdCBmaW5pc2hlcyBsb2FkaW5nLiBNdXN0IGJlIEpTT04uc3RyaW5naWZpeS1hYmxlLiBUaGUgcHJvcGVydHkgaW5qZWN0ZWQgdG8gaXMgd2luZG93WydfX1BSRVJFTkRFUl9JTkpFQ1RFRCddIGJ5IGRlZmF1bHQuXG5cdCAqL1xuXHRpbmplY3Q/OiBvYmplY3QsXG5cdC8qKlxuXHQgKiBUaGUgcHJvcGVydHkgdG8gbW91bnQgaW5qZWN0IHRvIGR1cmluZyByZW5kZXJpbmcuXG5cdCAqL1xuXHRpbmplY3RQcm9wZXJ0eT86IHN0cmluZyxcblx0LyoqXG5cdCAqIFdhaXQgdG8gcmVuZGVyIHVudGlsIHRoZSBzcGVjaWZpZWQgZXZlbnQgaXMgZmlyZWQgb24gdGhlIGRvY3VtZW50LiAoWW91IGNhbiBmaXJlIGFuIGV2ZW50IGxpa2Ugc286IGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjdXN0b20tcmVuZGVyLXRyaWdnZXInKSlcblx0ICovXG5cdHJlbmRlckFmdGVyRG9jdW1lbnRFdmVudD86IHN0cmluZyxcblx0LyoqXG5cdCAqIChTZWxlY3Rvcilcblx0ICpcblx0ICogV2FpdCB0byByZW5kZXIgdW50aWwgdGhlIHNwZWNpZmllZCBlbGVtZW50IGlzIGRldGVjdGVkIHVzaW5nIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Jcblx0ICovXG5cdHJlbmRlckFmdGVyRWxlbWVudEV4aXN0cz86IHN0cmluZyxcblx0LyoqXG5cdCAqIChNaWxsaXNlY29uZHMpXG5cdCAqXG5cdCAqIFdhaXQgdG8gcmVuZGVyIHVudGlsIGEgY2VydGFpbiBhbW91bnQgb2YgdGltZSBoYXMgcGFzc2VkLlxuXHQgKi9cblx0cmVuZGVyQWZ0ZXJUaW1lPzogbnVtYmVyLFxuXG5cdC8qKlxuXHQgKiB0aGUgbWF4IHRpbWVvdXRcblx0ICovXG5cdHJlbmRlckFmdGVyVGltZU1heD86IG51bWJlcixcblxuXHQvKipcblx0ICogZGVsYXkgYWZ0ZXIgcmVuZGVyQWZ0ZXJEb2N1bWVudEV2ZW50IHJlbmRlckFmdGVyRWxlbWVudEV4aXN0c1xuXHQgKi9cblx0cmVuZGVyQWZ0ZXJEZWxheT86IG51bWJlcixcblxuXHRyZWZlcnJlcj86IHN0cmluZyB8IFVSTCxcblxuXHRkaXNhYmxlTG9nPzogYm9vbGVhbixcbn1cblxuZXhwb3J0IHR5cGUgSVJvdXRlcyA9IHN0cmluZ1tdO1xuXG5leHBvcnQgY2xhc3MgSlNET01SZW5kZXJlclxue1xuXHRzdGF0aWMgREVGQVVMVF9SRUZFUlJFUiA9IG5ldyBVUkwoYGh0dHBzOi8vcHJlcmVuZGVyZXItcmVuZGVyZXItanNkb21gKS50b1N0cmluZygpO1xuXHRzdGF0aWMgREVGQVVMVF9JTkpFQ1RfUFJPUEVSVFkgPSAnX19QUkVSRU5ERVJfSU5KRUNURUQnO1xuXHRzdGF0aWMgSUQgPSAnSlNET01SZW5kZXJlcic7XG5cblx0cHJvdGVjdGVkIF9yZW5kZXJlck9wdGlvbnM6IElKU0RPTVJlbmRlcmVyT3B0aW9ucyA9IHt9O1xuXHRwcm90ZWN0ZWQgX3ZpcnR1YWxDb25zb2xlOiBWaXJ0dWFsQ29uc29sZTtcblxuXHRwcm90ZWN0ZWQgY29uc29sZURlYnVnID0gbmV3IENvbnNvbGUoY29uc29sZSwge1xuXHRcdGxhYmVsOiB0cnVlLFxuXHRcdHRpbWU6IHRydWUsXG5cdFx0bGFiZWxGb3JtYXRGbihkYXRhKTogc3RyaW5nXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGBbJHtKU0RPTVJlbmRlcmVyLklEfToke2RhdGEubmFtZS50b1VwcGVyQ2FzZSgpfV1gO1xuXHRcdH1cblx0fSk7XG5cblx0Y29uc3RydWN0b3IocmVuZGVyZXJPcHRpb25zOiBJSlNET01SZW5kZXJlck9wdGlvbnMpXG5cdHtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMuX3JlbmRlcmVyT3B0aW9ucywgcmVuZGVyZXJPcHRpb25zKTtcblxuXHRcdGlmICh0aGlzLl9yZW5kZXJlck9wdGlvbnMubWF4Q29uY3VycmVudFJvdXRlcyA9PSBudWxsKSB0aGlzLl9yZW5kZXJlck9wdGlvbnMubWF4Q29uY3VycmVudFJvdXRlcyA9IDA7XG5cblx0XHRpZiAodGhpcy5fcmVuZGVyZXJPcHRpb25zLmluamVjdCAmJiAhdGhpcy5fcmVuZGVyZXJPcHRpb25zLmluamVjdFByb3BlcnR5KVxuXHRcdHtcblx0XHRcdHRoaXMuX3JlbmRlcmVyT3B0aW9ucy5pbmplY3RQcm9wZXJ0eSA9IEpTRE9NUmVuZGVyZXIuREVGQVVMVF9JTkpFQ1RfUFJPUEVSVFlcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fcmVuZGVyZXJPcHRpb25zLmRpc2FibGVMb2cpXG5cdFx0e1xuXHRcdFx0dGhpcy5jb25zb2xlRGVidWcuZW5hYmxlZCA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdGluamVjdE9iamVjdCgpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcmVuZGVyZXJPcHRpb25zLmluamVjdFxuXHR9XG5cblx0aW5pdGlhbGl6ZSgpXG5cdHtcblx0XHQvLyBOT09QXG5cdFx0cmV0dXJuIEJsdWViaXJkLnJlc29sdmUoKVxuXHR9XG5cblx0Z2V0VmlydHVhbENvbnNvbGUoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3ZpcnR1YWxDb25zb2xlIHx8ICh0aGlzLl92aXJ0dWFsQ29uc29sZSA9IG5ldyBWaXJ0dWFsQ29uc29sZSgpKTtcblx0fVxuXG5cdHJlbmRlclJvdXRlcyhyb3V0ZXM6IElSb3V0ZXMsIFByZXJlbmRlcmVyOiB7XG5cdFx0Z2V0T3B0aW9ucygpOiBJUHJlcmVuZGVyZXJPcHRpb25zXG5cdH0pOiBCbHVlYmlyZDxJUmVzdWx0W10+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG5cdFx0cmV0dXJuIEJsdWViaXJkLnJlc29sdmUoKVxuXHRcdFx0LnRoZW4oKCkgPT5cblx0XHRcdHtcblx0XHRcdFx0Y29uc3Qgcm9vdE9wdGlvbnMgPSBQcmVyZW5kZXJlci5nZXRPcHRpb25zKCk7XG5cblx0XHRcdFx0Y29uc3QgX3JlbmRlcmVyT3B0aW9ucyA9IHRoaXMuX3JlbmRlcmVyT3B0aW9ucztcblx0XHRcdFx0Y29uc3QgdmlydHVhbENvbnNvbGUgPSBzZWxmLmdldFZpcnR1YWxDb25zb2xlKCk7XG5cblx0XHRcdFx0Ly92aXJ0dWFsQ29uc29sZS5vbignanNkb21FcnJvcicsIGUgPT4gc2VsZi5jb25zb2xlRGVidWcuZXJyb3IoJ2pzZG9tRXJyb3InLCBlKSk7XG5cblx0XHRcdFx0Y29uc3QgcmVmZXJyZXIgPSBfcmVuZGVyZXJPcHRpb25zLnJlZmVycmVyXG5cdFx0XHRcdFx0PyBfcmVuZGVyZXJPcHRpb25zLnJlZmVycmVyLnRvU3RyaW5nKClcblx0XHRcdFx0XHQ6IEpTRE9NUmVuZGVyZXIuREVGQVVMVF9SRUZFUlJFUjtcblxuXHRcdFx0XHRyZXR1cm4gQmx1ZWJpcmRcblx0XHRcdFx0XHQucmVzb2x2ZShyb3V0ZXMpXG5cdFx0XHRcdFx0Lm1hcChhc3luYyAocm91dGUpID0+XG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0c2VsZi5jb25zb2xlRGVidWcuZGVidWcoYHJvdXRlOnN0YXJ0YCwgcm91dGUpO1xuXG5cdFx0XHRcdFx0XHRjb25zdCBqc2RvbSA9IGF3YWl0IEpTRE9NLmZyb21VUkwoYGh0dHA6Ly8xMjcuMC4wLjE6JHtyb290T3B0aW9ucy5zZXJ2ZXIucG9ydH0ke3JvdXRlfWAsIHtcblx0XHRcdFx0XHRcdFx0cmVzb3VyY2VzOiAndXNhYmxlJyxcblx0XHRcdFx0XHRcdFx0cnVuU2NyaXB0czogJ2Rhbmdlcm91c2x5Jyxcblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRwcmV0ZW5kVG9CZVZpc3VhbDogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0aW5jbHVkZU5vZGVMb2NhdGlvbnM6IHRydWUsXG5cblx0XHRcdFx0XHRcdFx0cmVmZXJyZXIsXG5cblx0XHRcdFx0XHRcdFx0VmlydHVhbENvbnNvbGU6IHZpcnR1YWxDb25zb2xlLFxuXHRcdFx0XHRcdFx0XHR2aXJ0dWFsQ29uc29sZSxcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRpZiAoX3JlbmRlcmVyT3B0aW9ucy5pbmplY3QpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGpzZG9tLndpbmRvd1tfcmVuZGVyZXJPcHRpb25zLmluamVjdFByb3BlcnR5XSA9IHNlbGYuaW5qZWN0T2JqZWN0KCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGpzZG9tLndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGZ1bmN0aW9uIChldmVudClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly9zZWxmLmNvbnNvbGVEZWJ1Zy5lcnJvcihgd2luZG93LmVycm9yYCwgcm91dGUsIGV2ZW50LmVycm9yKVxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHJldHVybiBzZWxmLmdldFBhZ2VDb250ZW50cyhqc2RvbSwgX3JlbmRlcmVyT3B0aW9ucywgcm91dGUpXG5cdFx0XHRcdFx0XHRcdC50YXAoZnVuY3Rpb24gKClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLmRlYnVnKGByb3V0ZTplbmRgLCByb3V0ZSk7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGFwQ2F0Y2goZSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLmVycm9yKGByZW5kZXJSb3V0ZXNgLCBlLm1lc3NhZ2UpXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHR9KVxuXHRcdFx0LnRhcCgoKSA9PiB7XG5cdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLnN1Y2Nlc3MoYHJlbmRlclJvdXRlczpkb25lYCwgcm91dGVzLCByb3V0ZXMubGVuZ3RoKTtcblx0XHRcdH0pXG5cdFx0XHQuZmluYWxseSgoKSA9PiB7XG5cdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLmRlYnVnKGByZW5kZXJSb3V0ZXM6ZW5kYCwgcm91dGVzLCBgdXNlZGAsIChEYXRlLm5vdygpIC0gc3RhcnRUaW1lKSAvIDEwMDAgLCAnc2VjJyk7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0ZGVzdHJveSgpXG5cdHtcblx0XHQvLyBOT09QXG5cdH1cblxuXHRwcm90ZWN0ZWQgZ2V0UGFnZUNvbnRlbnRzKGpzZG9tOiBKU0RPTSwgb3B0aW9uczogSUpTRE9NUmVuZGVyZXJPcHRpb25zLCBvcmlnaW5hbFJvdXRlOiBzdHJpbmcpOiBCbHVlYmlyZDxJUmVzdWx0PlxuXHR7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHJldHVybiBuZXcgQmx1ZWJpcmQ8SVJlc3VsdD4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT5cblx0XHR7XG5cdFx0XHRjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG5cdFx0XHRsZXQgaW50OiBudW1iZXI7XG5cblx0XHRcdGxldCBfcmVzb2x2ZWQ6IGJvb2xlYW47XG5cblx0XHRcdGFzeW5jIGZ1bmN0aW9uIGNhcHR1cmVEb2N1bWVudCgpXG5cdFx0XHR7XG5cdFx0XHRcdF9yZXNvbHZlZCA9IHRydWU7XG5cdFx0XHRcdHJlc2V0VGltZXIoKTtcblxuXHRcdFx0XHRyZXR1cm4gQmx1ZWJpcmRcblx0XHRcdFx0XHQuZGVsYXkob3B0aW9ucy5yZW5kZXJBZnRlckRlbGF5IHwgMClcblx0XHRcdFx0XHQudGhlbigoKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnN0IHJlc3VsdDogSVJlc3VsdCA9IHtcblx0XHRcdFx0XHRcdFx0b3JpZ2luYWxSb3V0ZTogb3JpZ2luYWxSb3V0ZSxcblx0XHRcdFx0XHRcdFx0cm91dGU6IG9yaWdpbmFsUm91dGUsXG5cdFx0XHRcdFx0XHRcdGh0bWw6IGpzZG9tLnNlcmlhbGl6ZSgpLFxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0anNkb20ud2luZG93LmNsb3NlKCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGFwKCgpID0+IHtcblx0XHRcdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLnN1Y2Nlc3MoYGNhcHR1cmVEb2N1bWVudDpkb25lYCwgb3JpZ2luYWxSb3V0ZSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGFwQ2F0Y2goZSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLmVycm9yKGBjYXB0dXJlRG9jdW1lbnRgLCBlKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLmRlYnVnKGBjYXB0dXJlRG9jdW1lbnQ6ZW5kYCwgb3JpZ2luYWxSb3V0ZSwgYHVzZWRgLCAoRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSkgLyAxMDAwICwgJ3NlYycpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiByZXNldFRpbWVyKClcblx0XHRcdHtcblx0XHRcdFx0aWYgKGludCAhPSBudWxsKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2xlYXJJbnRlcnZhbChpbnQpXG5cdFx0XHRcdFx0aW50ID0gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBkb25lKClcblx0XHRcdHtcblx0XHRcdFx0cmVzZXRUaW1lcigpO1xuXG5cdFx0XHRcdGlmICghX3Jlc29sdmVkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmVzb2x2ZShjYXB0dXJlRG9jdW1lbnQoKSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRsZXQgYm9vbDogYm9vbGVhbjtcblxuXHRcdFx0Ly8gQ0FQVFVSRSBXSEVOIEFOIEVWRU5UIEZJUkVTIE9OIFRIRSBET0NVTUVOVFxuXHRcdFx0aWYgKG9wdGlvbnMucmVuZGVyQWZ0ZXJEb2N1bWVudEV2ZW50KVxuXHRcdFx0e1xuXHRcdFx0XHRib29sID0gdHJ1ZTtcblxuXHRcdFx0XHRqc2RvbS53aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihvcHRpb25zLnJlbmRlckFmdGVyRG9jdW1lbnRFdmVudCwgKCkgPT4gZG9uZSgpKVxuXG5cdFx0XHRcdC8vIENBUFRVUkUgT05DRSBBIFNQRUNJRkMgRUxFTUVOVCBFWElTVFNcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9wdGlvbnMucmVuZGVyQWZ0ZXJFbGVtZW50RXhpc3RzKVxuXHRcdFx0e1xuXHRcdFx0XHRib29sID0gdHJ1ZTtcblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGludCA9IHNldEludGVydmFsKCgpID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoanNkb20ud2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iob3B0aW9ucy5yZW5kZXJBZnRlckVsZW1lbnRFeGlzdHMpKSBkb25lKClcblx0XHRcdFx0fSwgMTAwKVxuXG5cdFx0XHRcdC8vIENBUFRVUkUgQUZURVIgQSBOVU1CRVIgT0YgTUlMTElTRUNPTkRTXG5cdFx0XHR9XG5cblx0XHRcdGlmIChib29sKVxuXHRcdFx0e1xuXHRcdFx0XHRzZXRUaW1lb3V0KGRvbmUsIChvcHRpb25zLnJlbmRlckFmdGVyVGltZU1heCB8IDApIHx8IDMwMDAwKVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAob3B0aW9ucy5yZW5kZXJBZnRlclRpbWUpXG5cdFx0XHR7XG5cdFx0XHRcdHNldFRpbWVvdXQoZG9uZSwgb3B0aW9ucy5yZW5kZXJBZnRlclRpbWUpXG5cblx0XHRcdFx0Ly8gREVGQVVMVDogUlVOIElNTUVESUFURUxZXG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdGRvbmUoKVxuXHRcdFx0fVxuXHRcdH0pXG5cdH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUG9zdFByb2Nlc3NDb250ZXh0XG57XG5cdC8qKlxuXHQgKiBUaGUgcHJlcmVuZGVyZWQgcm91dGUsIGFmdGVyIGZvbGxvd2luZyByZWRpcmVjdHMuXG5cdCAqL1xuXHRyb3V0ZTogc3RyaW5nXG5cdC8qKlxuXHQgKiBUaGUgb3JpZ2luYWwgcm91dGUgcGFzc2VkLCBiZWZvcmUgcmVkaXJlY3RzLlxuXHQgKi9cblx0b3JpZ2luYWxSb3V0ZTogc3RyaW5nXG5cdC8qKlxuXHQgKiBUaGUgcGF0aCB0byB3cml0ZSB0aGUgcmVuZGVyZWQgSFRNTCB0by5cblx0ICovXG5cdGh0bWw6IHN0cmluZ1xuXHQvKipcblx0ICogVGhlIHBhdGggdG8gd3JpdGUgdGhlIHJlbmRlcmVkIEhUTUwgdG8uXG5cdCAqIFRoaXMgaXMgbnVsbCAoYXV0b21hdGljYWxseSBjYWxjdWxhdGVkIGFmdGVyIHBvc3RQcm9jZXNzKVxuXHQgKiB1bmxlc3MgZXhwbGljaXRseSBzZXQuXG5cdCAqL1xuXHRvdXRwdXRQYXRoPzogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIElSZXNvbHZhYmxlPFI+ID0gUiB8IFByb21pc2VMaWtlPFI+O1xuXG5leHBvcnQgaW50ZXJmYWNlIElQcmVyZW5kZXJlck9wdGlvbnNcbntcblx0c3RhdGljRGlyPzogc3RyaW5nLFxuXHRvdXRwdXREaXI/OiBzdHJpbmcsXG5cdGluZGV4UGF0aD86IHN0cmluZyxcblxuXHQvKipcblx0ICogVGhlIHBvc3RQcm9jZXNzKE9iamVjdCBjb250ZXh0KTogT2JqZWN0IHwgUHJvbWlzZSBmdW5jdGlvbiBpbiB5b3VyIHJlbmRlcmVyIGNvbmZpZ3VyYXRpb24gYWxsb3dzIHlvdSB0byBhZGp1c3QgdGhlIG91dHB1dCBvZiBwcmVyZW5kZXItc3BhLXBsdWdpbiBiZWZvcmUgd3JpdGluZyBpdCB0byBhIGZpbGUuXG5cdCAqIEl0IGlzIGNhbGxlZCBvbmNlIHBlciByZW5kZXJlZCByb3V0ZSBhbmQgaXMgcGFzc2VkIGEgY29udGV4dCBvYmplY3QgaW4gdGhlIGZvcm0gb2Y6XG5cdCAqXG5cdCAqIEBwYXJhbSB7SVBvc3RQcm9jZXNzQ29udGV4dH0gY29udGV4dFxuXHQgKiBAcmV0dXJucyB7SVJlc29sdmFibGU8SVBvc3RQcm9jZXNzQ29udGV4dD59XG5cdCAqL1xuXHRwb3N0UHJvY2Vzcz8oY29udGV4dDogSVBvc3RQcm9jZXNzQ29udGV4dCk6IElSZXNvbHZhYmxlPElQb3N0UHJvY2Vzc0NvbnRleHQ+LFxuXG5cdHNlcnZlcj86IHtcblx0XHQvKipcblx0XHQgKiBUaGUgcG9ydCBmb3IgdGhlIGFwcCBzZXJ2ZXIgdG8gcnVuIG9uLlxuXHRcdCAqL1xuXHRcdHBvcnQ/OiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICogUHJveHkgY29uZmlndXJhdGlvbi4gSGFzIHRoZSBzYW1lIHNpZ25hdHVyZSBhcyB3ZWJwYWNrLWRldi1zZXJ2ZXJcblx0XHQgKi9cblx0XHRwcm94eT86IG9iamVjdCxcblx0fSxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUmVzdWx0XG57XG5cdG9yaWdpbmFsUm91dGU6IHN0cmluZyxcblx0cm91dGU6IHN0cmluZyxcblx0aHRtbDogc3RyaW5nLFxufVxuXG5leHBvcnQgZGVmYXVsdCBKU0RPTVJlbmRlcmVyXG4iXX0=
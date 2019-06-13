"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var jsdom_1 = require("jsdom");
var bluebird_1 = __importDefault(require("bluebird"));
var debug_color2_1 = __importStar(require("debug-color2"));
var JSDOMRenderer = /** @class */ (function () {
    function JSDOMRenderer(rendererOptions) {
        this._rendererOptions = {};
        this.consoleDebug = new debug_color2_1.Console(debug_color2_1.default, {
            label: true,
            time: true,
            labelFormatFn: function (data) {
                return "[" + JSDOMRenderer.ID + ":" + data.name.toUpperCase() + "]";
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
    JSDOMRenderer.prototype.injectObject = function () {
        return this._rendererOptions.inject;
    };
    JSDOMRenderer.prototype.initialize = function () {
        // NOOP
        return bluebird_1.default.resolve();
    };
    JSDOMRenderer.prototype.getVirtualConsole = function () {
        return this._virtualConsole || (this._virtualConsole = new jsdom_1.VirtualConsole());
    };
    JSDOMRenderer.prototype.renderRoutes = function (routes, Prerenderer) {
        var _this = this;
        var self = this;
        var startTime = Date.now();
        return bluebird_1.default.resolve()
            .then(function () {
            var rootOptions = Prerenderer.getOptions();
            var _rendererOptions = _this._rendererOptions;
            var virtualConsole = self.getVirtualConsole();
            virtualConsole.on('jsdomError', function (e) { return self.consoleDebug.error('jsdomError', e); });
            var referrer = _rendererOptions.referrer
                ? _rendererOptions.referrer.toString()
                : JSDOMRenderer.DEFAULT_REFERRER;
            return bluebird_1.default
                .resolve(routes)
                .map(function (route) { return __awaiter(_this, void 0, void 0, function () {
                var jsdom;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            self.consoleDebug.debug("route:start", route);
                            return [4 /*yield*/, jsdom_1.JSDOM.fromURL("http://127.0.0.1:" + rootOptions.server.port + route, {
                                    resources: 'usable',
                                    runScripts: 'dangerously',
                                    // @ts-ignore
                                    pretendToBeVisual: true,
                                    includeNodeLocations: true,
                                    referrer: referrer,
                                    VirtualConsole: virtualConsole,
                                })];
                        case 1:
                            jsdom = _a.sent();
                            if (_rendererOptions.inject) {
                                jsdom.window[_rendererOptions.injectProperty] = self.injectObject();
                            }
                            jsdom.window.addEventListener('error', function (event) {
                                //self.consoleDebug.error(`window.error`, route, event.error)
                            });
                            return [2 /*return*/, self.getPageContents(jsdom, _rendererOptions, route)
                                    .tap(function () {
                                    self.consoleDebug.debug("route:end", route);
                                })];
                    }
                });
            }); })
                .tapCatch(function (e) {
                self.consoleDebug.error("renderRoutes", e.message);
            });
        })
            .tap(function () {
            self.consoleDebug.success("renderRoutes:done", routes, routes.length);
        })
            .finally(function () {
            self.consoleDebug.debug("renderRoutes:end", routes, "used", (Date.now() - startTime) / 1000, 'sec');
        });
    };
    JSDOMRenderer.prototype.destroy = function () {
        // NOOP
    };
    JSDOMRenderer.prototype.getPageContents = function (jsdom, options, originalRoute) {
        var _this = this;
        options = options || {};
        var self = this;
        return new bluebird_1.default(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            function captureDocument() {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        _resolved = true;
                        resetTimer();
                        return [2 /*return*/, bluebird_1.default
                                .delay(options.renderAfterDelay | 0)
                                .then(function () {
                                var result = {
                                    originalRoute: originalRoute,
                                    route: originalRoute,
                                    html: jsdom.serialize(),
                                };
                                jsdom.window.close();
                                return result;
                            })
                                .tap(function () {
                                self.consoleDebug.success("captureDocument:done", originalRoute);
                            })
                                .tapCatch(function (e) {
                                self.consoleDebug.error("captureDocument", e);
                            })
                                .finally(function () {
                                self.consoleDebug.debug("captureDocument:end", originalRoute, "used", (Date.now() - startTime) / 1000, 'sec');
                            })];
                    });
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
            var startTime, int, _resolved, bool;
            return __generator(this, function (_a) {
                startTime = Date.now();
                // CAPTURE WHEN AN EVENT FIRES ON THE DOCUMENT
                if (options.renderAfterDocumentEvent) {
                    bool = true;
                    jsdom.window.document.addEventListener(options.renderAfterDocumentEvent, function () { return done(); });
                    // CAPTURE ONCE A SPECIFC ELEMENT EXISTS
                }
                if (options.renderAfterElementExists) {
                    bool = true;
                    // @ts-ignore
                    int = setInterval(function () {
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
                return [2 /*return*/];
            });
        }); });
    };
    JSDOMRenderer.DEFAULT_REFERRER = new URL("https://prerenderer-renderer-jsdom").toString();
    JSDOMRenderer.DEFAULT_INJECT_PROPERTY = '__PRERENDER_INJECTED';
    JSDOMRenderer.ID = 'JSDOMRenderer';
    return JSDOMRenderer;
}());
exports.JSDOMRenderer = JSDOMRenderer;
exports.default = JSDOMRenderer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQkFBd0Q7QUFDeEQsc0RBQStCO0FBQy9CLDJEQUErQztBQW9EL0M7SUFrQkMsdUJBQVksZUFBc0M7UUFaeEMscUJBQWdCLEdBQTBCLEVBQUUsQ0FBQztRQUc3QyxpQkFBWSxHQUFHLElBQUksc0JBQU8sQ0FBQyxzQkFBTyxFQUFFO1lBQzdDLEtBQUssRUFBRSxJQUFJO1lBQ1gsSUFBSSxFQUFFLElBQUk7WUFDVixhQUFhLEVBQWIsVUFBYyxJQUFJO2dCQUVqQixPQUFPLE1BQUksYUFBYSxDQUFDLEVBQUUsU0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxNQUFHLENBQUM7WUFDM0QsQ0FBQztTQUNELENBQUMsQ0FBQztRQUlGLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRXRELElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixJQUFJLElBQUk7WUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO1FBRXJHLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQ3pFO1lBQ0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUMsdUJBQXVCLENBQUE7U0FDNUU7UUFFRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQ3BDO1lBQ0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1NBQ2xDO0lBQ0YsQ0FBQztJQUVELG9DQUFZLEdBQVo7UUFFQyxPQUFPLElBQUks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NEJBQUUsSUFBSSxFQUFFLENBQUE7b0JBQ2xGLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQTtvQkFFUCx5Q0FBeUM7aUJBQ3pDO2dCQUVELElBQUksSUFBSSxFQUNSO29CQUNDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUE7aUJBQzNEO3FCQUNJLElBQUksT0FBTyxDQUFDLGVBQWUsRUFDaEM7b0JBQ0MsVUFBVSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUE7b0JBRXpDLDJCQUEyQjtpQkFDM0I7cUJBRUQ7b0JBQ0MsSUFBSSxFQUFFLENBQUE7aUJBQ047OzthQUNELENBQUMsQ0FBQTtJQUNILENBQUM7SUFwT00sOEJBQWdCLEdBQUcsSUFBSSxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUM1RSxxQ0FBdUIsR0FBRyxzQkFBc0IsQ0FBQztJQUNqRCxnQkFBRSxHQUFHLGVBQWUsQ0FBQztJQW1PN0Isb0JBQUM7Q0FBQSxBQXZPRCxJQXVPQztBQXZPWSxzQ0FBYTtBQW1TMUIsa0JBQWUsYUFBYSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRE9NV2luZG93LCBKU0RPTSwgVmlydHVhbENvbnNvbGUgfSBmcm9tICdqc2RvbSdcbmltcG9ydCBCbHVlYmlyZCBmcm9tICdibHVlYmlyZCdcbmltcG9ydCBjb25zb2xlLCB7IENvbnNvbGUgfSBmcm9tICdkZWJ1Zy1jb2xvcjInXG5cbmV4cG9ydCBpbnRlcmZhY2UgSUpTRE9NUmVuZGVyZXJPcHRpb25zXG57XG5cdC8qKlxuXHQgKiAwIChObyBsaW1pdClcblx0ICpcblx0ICogVGhlIG51bWJlciBvZiByb3V0ZXMgYWxsb3dlZCB0byBiZSByZW5kZXJlZCBhdCB0aGUgc2FtZSB0aW1lLiBVc2VmdWwgZm9yIGJyZWFraW5nIGRvd24gbWFzc2l2ZSBiYXRjaGVzIG9mIHJvdXRlcyBpbnRvIHNtYWxsZXIgY2h1bmtzLlxuXHQgKi9cblx0bWF4Q29uY3VycmVudFJvdXRlcz86IG51bWJlcixcblx0LyoqXG5cdCAqIEFuIG9iamVjdCB0byBpbmplY3QgaW50byB0aGUgZ2xvYmFsIHNjb3BlIG9mIHRoZSByZW5kZXJlZCBwYWdlIGJlZm9yZSBpdCBmaW5pc2hlcyBsb2FkaW5nLiBNdXN0IGJlIEpTT04uc3RyaW5naWZpeS1hYmxlLiBUaGUgcHJvcGVydHkgaW5qZWN0ZWQgdG8gaXMgd2luZG93WydfX1BSRVJFTkRFUl9JTkpFQ1RFRCddIGJ5IGRlZmF1bHQuXG5cdCAqL1xuXHRpbmplY3Q/OiBvYmplY3QsXG5cdC8qKlxuXHQgKiBUaGUgcHJvcGVydHkgdG8gbW91bnQgaW5qZWN0IHRvIGR1cmluZyByZW5kZXJpbmcuXG5cdCAqL1xuXHRpbmplY3RQcm9wZXJ0eT86IHN0cmluZyxcblx0LyoqXG5cdCAqIFdhaXQgdG8gcmVuZGVyIHVudGlsIHRoZSBzcGVjaWZpZWQgZXZlbnQgaXMgZmlyZWQgb24gdGhlIGRvY3VtZW50LiAoWW91IGNhbiBmaXJlIGFuIGV2ZW50IGxpa2Ugc286IGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjdXN0b20tcmVuZGVyLXRyaWdnZXInKSlcblx0ICovXG5cdHJlbmRlckFmdGVyRG9jdW1lbnRFdmVudD86IHN0cmluZyxcblx0LyoqXG5cdCAqIChTZWxlY3Rvcilcblx0ICpcblx0ICogV2FpdCB0byByZW5kZXIgdW50aWwgdGhlIHNwZWNpZmllZCBlbGVtZW50IGlzIGRldGVjdGVkIHVzaW5nIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Jcblx0ICovXG5cdHJlbmRlckFmdGVyRWxlbWVudEV4aXN0cz86IHN0cmluZyxcblx0LyoqXG5cdCAqIChNaWxsaXNlY29uZHMpXG5cdCAqXG5cdCAqIFdhaXQgdG8gcmVuZGVyIHVudGlsIGEgY2VydGFpbiBhbW91bnQgb2YgdGltZSBoYXMgcGFzc2VkLlxuXHQgKi9cblx0cmVuZGVyQWZ0ZXJUaW1lPzogbnVtYmVyLFxuXG5cdC8qKlxuXHQgKiB0aGUgbWF4IHRpbWVvdXRcblx0ICovXG5cdHJlbmRlckFmdGVyVGltZU1heD86IG51bWJlcixcblxuXHQvKipcblx0ICogZGVsYXkgYWZ0ZXIgcmVuZGVyQWZ0ZXJEb2N1bWVudEV2ZW50IHJlbmRlckFmdGVyRWxlbWVudEV4aXN0c1xuXHQgKi9cblx0cmVuZGVyQWZ0ZXJEZWxheT86IG51bWJlcixcblxuXHRyZWZlcnJlcj86IHN0cmluZyB8IFVSTCxcblxuXHRkaXNhYmxlTG9nPzogYm9vbGVhbixcbn1cblxuZXhwb3J0IHR5cGUgSVJvdXRlcyA9IHN0cmluZ1tdO1xuXG5leHBvcnQgY2xhc3MgSlNET01SZW5kZXJlclxue1xuXHRzdGF0aWMgREVGQVVMVF9SRUZFUlJFUiA9IG5ldyBVUkwoYGh0dHBzOi8vcHJlcmVuZGVyZXItcmVuZGVyZXItanNkb21gKS50b1N0cmluZygpO1xuXHRzdGF0aWMgREVGQVVMVF9JTkpFQ1RfUFJPUEVSVFkgPSAnX19QUkVSRU5ERVJfSU5KRUNURUQnO1xuXHRzdGF0aWMgSUQgPSAnSlNET01SZW5kZXJlcic7XG5cblx0cHJvdGVjdGVkIF9yZW5kZXJlck9wdGlvbnM6IElKU0RPTVJlbmRlcmVyT3B0aW9ucyA9IHt9O1xuXHRwcm90ZWN0ZWQgX3ZpcnR1YWxDb25zb2xlOiBWaXJ0dWFsQ29uc29sZTtcblxuXHRwcm90ZWN0ZWQgY29uc29sZURlYnVnID0gbmV3IENvbnNvbGUoY29uc29sZSwge1xuXHRcdGxhYmVsOiB0cnVlLFxuXHRcdHRpbWU6IHRydWUsXG5cdFx0bGFiZWxGb3JtYXRGbihkYXRhKTogc3RyaW5nXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGBbJHtKU0RPTVJlbmRlcmVyLklEfToke2RhdGEubmFtZS50b1VwcGVyQ2FzZSgpfV1gO1xuXHRcdH1cblx0fSk7XG5cblx0Y29uc3RydWN0b3IocmVuZGVyZXJPcHRpb25zOiBJSlNET01SZW5kZXJlck9wdGlvbnMpXG5cdHtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMuX3JlbmRlcmVyT3B0aW9ucywgcmVuZGVyZXJPcHRpb25zKTtcblxuXHRcdGlmICh0aGlzLl9yZW5kZXJlck9wdGlvbnMubWF4Q29uY3VycmVudFJvdXRlcyA9PSBudWxsKSB0aGlzLl9yZW5kZXJlck9wdGlvbnMubWF4Q29uY3VycmVudFJvdXRlcyA9IDA7XG5cblx0XHRpZiAodGhpcy5fcmVuZGVyZXJPcHRpb25zLmluamVjdCAmJiAhdGhpcy5fcmVuZGVyZXJPcHRpb25zLmluamVjdFByb3BlcnR5KVxuXHRcdHtcblx0XHRcdHRoaXMuX3JlbmRlcmVyT3B0aW9ucy5pbmplY3RQcm9wZXJ0eSA9IEpTRE9NUmVuZGVyZXIuREVGQVVMVF9JTkpFQ1RfUFJPUEVSVFlcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fcmVuZGVyZXJPcHRpb25zLmRpc2FibGVMb2cpXG5cdFx0e1xuXHRcdFx0dGhpcy5jb25zb2xlRGVidWcuZW5hYmxlZCA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdGluamVjdE9iamVjdCgpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcmVuZGVyZXJPcHRpb25zLmluamVjdFxuXHR9XG5cblx0aW5pdGlhbGl6ZSgpXG5cdHtcblx0XHQvLyBOT09QXG5cdFx0cmV0dXJuIEJsdWViaXJkLnJlc29sdmUoKVxuXHR9XG5cblx0Z2V0VmlydHVhbENvbnNvbGUoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3ZpcnR1YWxDb25zb2xlIHx8ICh0aGlzLl92aXJ0dWFsQ29uc29sZSA9IG5ldyBWaXJ0dWFsQ29uc29sZSgpKTtcblx0fVxuXG5cdHJlbmRlclJvdXRlcyhyb3V0ZXM6IElSb3V0ZXMsIFByZXJlbmRlcmVyOiB7XG5cdFx0Z2V0T3B0aW9ucygpOiBJUHJlcmVuZGVyZXJPcHRpb25zXG5cdH0pOiBCbHVlYmlyZDxJUmVzdWx0W10+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblx0XHRjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG5cdFx0cmV0dXJuIEJsdWViaXJkLnJlc29sdmUoKVxuXHRcdFx0LnRoZW4oKCkgPT5cblx0XHRcdHtcblx0XHRcdFx0Y29uc3Qgcm9vdE9wdGlvbnMgPSBQcmVyZW5kZXJlci5nZXRPcHRpb25zKCk7XG5cblx0XHRcdFx0Y29uc3QgX3JlbmRlcmVyT3B0aW9ucyA9IHRoaXMuX3JlbmRlcmVyT3B0aW9ucztcblx0XHRcdFx0Y29uc3QgdmlydHVhbENvbnNvbGUgPSBzZWxmLmdldFZpcnR1YWxDb25zb2xlKCk7XG5cblx0XHRcdFx0dmlydHVhbENvbnNvbGUub24oJ2pzZG9tRXJyb3InLCBlID0+IHNlbGYuY29uc29sZURlYnVnLmVycm9yKCdqc2RvbUVycm9yJywgZSkpO1xuXG5cdFx0XHRcdGNvbnN0IHJlZmVycmVyID0gX3JlbmRlcmVyT3B0aW9ucy5yZWZlcnJlclxuXHRcdFx0XHRcdD8gX3JlbmRlcmVyT3B0aW9ucy5yZWZlcnJlci50b1N0cmluZygpXG5cdFx0XHRcdFx0OiBKU0RPTVJlbmRlcmVyLkRFRkFVTFRfUkVGRVJSRVI7XG5cblx0XHRcdFx0cmV0dXJuIEJsdWViaXJkXG5cdFx0XHRcdFx0LnJlc29sdmUocm91dGVzKVxuXHRcdFx0XHRcdC5tYXAoYXN5bmMgKHJvdXRlKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLmRlYnVnKGByb3V0ZTpzdGFydGAsIHJvdXRlKTtcblxuXHRcdFx0XHRcdFx0Y29uc3QganNkb20gPSBhd2FpdCBKU0RPTS5mcm9tVVJMKGBodHRwOi8vMTI3LjAuMC4xOiR7cm9vdE9wdGlvbnMuc2VydmVyLnBvcnR9JHtyb3V0ZX1gLCB7XG5cdFx0XHRcdFx0XHRcdHJlc291cmNlczogJ3VzYWJsZScsXG5cdFx0XHRcdFx0XHRcdHJ1blNjcmlwdHM6ICdkYW5nZXJvdXNseScsXG5cdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0cHJldGVuZFRvQmVWaXN1YWw6IHRydWUsXG5cdFx0XHRcdFx0XHRcdGluY2x1ZGVOb2RlTG9jYXRpb25zOiB0cnVlLFxuXG5cdFx0XHRcdFx0XHRcdHJlZmVycmVyLFxuXG5cdFx0XHRcdFx0XHRcdFZpcnR1YWxDb25zb2xlOiB2aXJ0dWFsQ29uc29sZSxcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRpZiAoX3JlbmRlcmVyT3B0aW9ucy5pbmplY3QpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGpzZG9tLndpbmRvd1tfcmVuZGVyZXJPcHRpb25zLmluamVjdFByb3BlcnR5XSA9IHNlbGYuaW5qZWN0T2JqZWN0KCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGpzZG9tLndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGZ1bmN0aW9uIChldmVudClcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly9zZWxmLmNvbnNvbGVEZWJ1Zy5lcnJvcihgd2luZG93LmVycm9yYCwgcm91dGUsIGV2ZW50LmVycm9yKVxuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHJldHVybiBzZWxmLmdldFBhZ2VDb250ZW50cyhqc2RvbSwgX3JlbmRlcmVyT3B0aW9ucywgcm91dGUpXG5cdFx0XHRcdFx0XHRcdC50YXAoZnVuY3Rpb24gKClcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLmRlYnVnKGByb3V0ZTplbmRgLCByb3V0ZSk7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGFwQ2F0Y2goZSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLmVycm9yKGByZW5kZXJSb3V0ZXNgLCBlLm1lc3NhZ2UpXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQ7XG5cdFx0XHR9KVxuXHRcdFx0LnRhcCgoKSA9PiB7XG5cdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLnN1Y2Nlc3MoYHJlbmRlclJvdXRlczpkb25lYCwgcm91dGVzLCByb3V0ZXMubGVuZ3RoKTtcblx0XHRcdH0pXG5cdFx0XHQuZmluYWxseSgoKSA9PiB7XG5cdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLmRlYnVnKGByZW5kZXJSb3V0ZXM6ZW5kYCwgcm91dGVzLCBgdXNlZGAsIChEYXRlLm5vdygpIC0gc3RhcnRUaW1lKSAvIDEwMDAgLCAnc2VjJyk7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0ZGVzdHJveSgpXG5cdHtcblx0XHQvLyBOT09QXG5cdH1cblxuXHRwcm90ZWN0ZWQgZ2V0UGFnZUNvbnRlbnRzKGpzZG9tOiBKU0RPTSwgb3B0aW9uczogSUpTRE9NUmVuZGVyZXJPcHRpb25zLCBvcmlnaW5hbFJvdXRlOiBzdHJpbmcpOiBCbHVlYmlyZDxJUmVzdWx0PlxuXHR7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHJldHVybiBuZXcgQmx1ZWJpcmQ8SVJlc3VsdD4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT5cblx0XHR7XG5cdFx0XHRjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuXG5cdFx0XHRsZXQgaW50OiBudW1iZXI7XG5cblx0XHRcdGxldCBfcmVzb2x2ZWQ6IGJvb2xlYW47XG5cblx0XHRcdGFzeW5jIGZ1bmN0aW9uIGNhcHR1cmVEb2N1bWVudCgpXG5cdFx0XHR7XG5cdFx0XHRcdF9yZXNvbHZlZCA9IHRydWU7XG5cdFx0XHRcdHJlc2V0VGltZXIoKTtcblxuXHRcdFx0XHRyZXR1cm4gQmx1ZWJpcmRcblx0XHRcdFx0XHQuZGVsYXkob3B0aW9ucy5yZW5kZXJBZnRlckRlbGF5IHwgMClcblx0XHRcdFx0XHQudGhlbigoKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnN0IHJlc3VsdDogSVJlc3VsdCA9IHtcblx0XHRcdFx0XHRcdFx0b3JpZ2luYWxSb3V0ZTogb3JpZ2luYWxSb3V0ZSxcblx0XHRcdFx0XHRcdFx0cm91dGU6IG9yaWdpbmFsUm91dGUsXG5cdFx0XHRcdFx0XHRcdGh0bWw6IGpzZG9tLnNlcmlhbGl6ZSgpLFxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0anNkb20ud2luZG93LmNsb3NlKCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGFwKCgpID0+IHtcblx0XHRcdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLnN1Y2Nlc3MoYGNhcHR1cmVEb2N1bWVudDpkb25lYCwgb3JpZ2luYWxSb3V0ZSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGFwQ2F0Y2goZSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLmVycm9yKGBjYXB0dXJlRG9jdW1lbnRgLCBlKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLmRlYnVnKGBjYXB0dXJlRG9jdW1lbnQ6ZW5kYCwgb3JpZ2luYWxSb3V0ZSwgYHVzZWRgLCAoRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSkgLyAxMDAwICwgJ3NlYycpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiByZXNldFRpbWVyKClcblx0XHRcdHtcblx0XHRcdFx0aWYgKGludCAhPSBudWxsKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2xlYXJJbnRlcnZhbChpbnQpXG5cdFx0XHRcdFx0aW50ID0gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBkb25lKClcblx0XHRcdHtcblx0XHRcdFx0cmVzZXRUaW1lcigpO1xuXG5cdFx0XHRcdGlmICghX3Jlc29sdmVkKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmVzb2x2ZShjYXB0dXJlRG9jdW1lbnQoKSlcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRsZXQgYm9vbDogYm9vbGVhbjtcblxuXHRcdFx0Ly8gQ0FQVFVSRSBXSEVOIEFOIEVWRU5UIEZJUkVTIE9OIFRIRSBET0NVTUVOVFxuXHRcdFx0aWYgKG9wdGlvbnMucmVuZGVyQWZ0ZXJEb2N1bWVudEV2ZW50KVxuXHRcdFx0e1xuXHRcdFx0XHRib29sID0gdHJ1ZTtcblxuXHRcdFx0XHRqc2RvbS53aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihvcHRpb25zLnJlbmRlckFmdGVyRG9jdW1lbnRFdmVudCwgKCkgPT4gZG9uZSgpKVxuXG5cdFx0XHRcdC8vIENBUFRVUkUgT05DRSBBIFNQRUNJRkMgRUxFTUVOVCBFWElTVFNcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9wdGlvbnMucmVuZGVyQWZ0ZXJFbGVtZW50RXhpc3RzKVxuXHRcdFx0e1xuXHRcdFx0XHRib29sID0gdHJ1ZTtcblxuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGludCA9IHNldEludGVydmFsKCgpID0+XG5cdFx0XHRcdHtcblx0XHRcdFx0XHRpZiAoanNkb20ud2luZG93LmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iob3B0aW9ucy5yZW5kZXJBZnRlckVsZW1lbnRFeGlzdHMpKSBkb25lKClcblx0XHRcdFx0fSwgMTAwKVxuXG5cdFx0XHRcdC8vIENBUFRVUkUgQUZURVIgQSBOVU1CRVIgT0YgTUlMTElTRUNPTkRTXG5cdFx0XHR9XG5cblx0XHRcdGlmIChib29sKVxuXHRcdFx0e1xuXHRcdFx0XHRzZXRUaW1lb3V0KGRvbmUsIChvcHRpb25zLnJlbmRlckFmdGVyVGltZU1heCB8IDApIHx8IDMwMDAwKVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAob3B0aW9ucy5yZW5kZXJBZnRlclRpbWUpXG5cdFx0XHR7XG5cdFx0XHRcdHNldFRpbWVvdXQoZG9uZSwgb3B0aW9ucy5yZW5kZXJBZnRlclRpbWUpXG5cblx0XHRcdFx0Ly8gREVGQVVMVDogUlVOIElNTUVESUFURUxZXG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdGRvbmUoKVxuXHRcdFx0fVxuXHRcdH0pXG5cdH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUG9zdFByb2Nlc3NDb250ZXh0XG57XG5cdC8qKlxuXHQgKiBUaGUgcHJlcmVuZGVyZWQgcm91dGUsIGFmdGVyIGZvbGxvd2luZyByZWRpcmVjdHMuXG5cdCAqL1xuXHRyb3V0ZTogc3RyaW5nXG5cdC8qKlxuXHQgKiBUaGUgb3JpZ2luYWwgcm91dGUgcGFzc2VkLCBiZWZvcmUgcmVkaXJlY3RzLlxuXHQgKi9cblx0b3JpZ2luYWxSb3V0ZTogc3RyaW5nXG5cdC8qKlxuXHQgKiBUaGUgcGF0aCB0byB3cml0ZSB0aGUgcmVuZGVyZWQgSFRNTCB0by5cblx0ICovXG5cdGh0bWw6IHN0cmluZ1xuXHQvKipcblx0ICogVGhlIHBhdGggdG8gd3JpdGUgdGhlIHJlbmRlcmVkIEhUTUwgdG8uXG5cdCAqIFRoaXMgaXMgbnVsbCAoYXV0b21hdGljYWxseSBjYWxjdWxhdGVkIGFmdGVyIHBvc3RQcm9jZXNzKVxuXHQgKiB1bmxlc3MgZXhwbGljaXRseSBzZXQuXG5cdCAqL1xuXHRvdXRwdXRQYXRoPzogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIElSZXNvbHZhYmxlPFI+ID0gUiB8IFByb21pc2VMaWtlPFI+O1xuXG5leHBvcnQgaW50ZXJmYWNlIElQcmVyZW5kZXJlck9wdGlvbnNcbntcblx0c3RhdGljRGlyPzogc3RyaW5nLFxuXHRvdXRwdXREaXI/OiBzdHJpbmcsXG5cdGluZGV4UGF0aD86IHN0cmluZyxcblxuXHQvKipcblx0ICogVGhlIHBvc3RQcm9jZXNzKE9iamVjdCBjb250ZXh0KTogT2JqZWN0IHwgUHJvbWlzZSBmdW5jdGlvbiBpbiB5b3VyIHJlbmRlcmVyIGNvbmZpZ3VyYXRpb24gYWxsb3dzIHlvdSB0byBhZGp1c3QgdGhlIG91dHB1dCBvZiBwcmVyZW5kZXItc3BhLXBsdWdpbiBiZWZvcmUgd3JpdGluZyBpdCB0byBhIGZpbGUuXG5cdCAqIEl0IGlzIGNhbGxlZCBvbmNlIHBlciByZW5kZXJlZCByb3V0ZSBhbmQgaXMgcGFzc2VkIGEgY29udGV4dCBvYmplY3QgaW4gdGhlIGZvcm0gb2Y6XG5cdCAqXG5cdCAqIEBwYXJhbSB7SVBvc3RQcm9jZXNzQ29udGV4dH0gY29udGV4dFxuXHQgKiBAcmV0dXJucyB7SVJlc29sdmFibGU8SVBvc3RQcm9jZXNzQ29udGV4dD59XG5cdCAqL1xuXHRwb3N0UHJvY2Vzcz8oY29udGV4dDogSVBvc3RQcm9jZXNzQ29udGV4dCk6IElSZXNvbHZhYmxlPElQb3N0UHJvY2Vzc0NvbnRleHQ+LFxuXG5cdHNlcnZlcj86IHtcblx0XHQvKipcblx0XHQgKiBUaGUgcG9ydCBmb3IgdGhlIGFwcCBzZXJ2ZXIgdG8gcnVuIG9uLlxuXHRcdCAqL1xuXHRcdHBvcnQ/OiBudW1iZXIsXG5cdFx0LyoqXG5cdFx0ICogUHJveHkgY29uZmlndXJhdGlvbi4gSGFzIHRoZSBzYW1lIHNpZ25hdHVyZSBhcyB3ZWJwYWNrLWRldi1zZXJ2ZXJcblx0XHQgKi9cblx0XHRwcm94eT86IG9iamVjdCxcblx0fSxcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJUmVzdWx0XG57XG5cdG9yaWdpbmFsUm91dGU6IHN0cmluZyxcblx0cm91dGU6IHN0cmluZyxcblx0aHRtbDogc3RyaW5nLFxufVxuXG5leHBvcnQgZGVmYXVsdCBKU0RPTVJlbmRlcmVyXG4iXX0=
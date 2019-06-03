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
            var int, _resolved, bool;
            return __generator(this, function (_a) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQkFBd0Q7QUFDeEQsc0RBQStCO0FBQy9CLDJEQUErQztBQW9EL0M7SUFrQkMsdUJBQVksZUFBc0M7UUFaeEMscUJBQWdCLEdBQTBCLEVBQUUsQ0FBQztRQUc3QyxpQkFBWSxHQUFHLElBQUksc0JBQU8sQ0FBQyxzQkFBTyxFQUFFO1lBQzdDLEtBQUssRUFBRSxJQUFJO1lBQ1gsSUFBSSxFQUFFLElBQUk7WUFDVixhQUFhLEVBQWIsVUFBYyxJQUFJO2dCQUVqQixPQUFPLE1BQUksYUFBYSxDQUFDLEVBQUUsU0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxNQUFHLENBQUM7WUFDM0QsQ0FBQztTQUNELENBQUMsQ0FBQztRQUlGLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRXRELElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixJQUFJLElBQUk7WUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO1FBRXJHLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQ3pFO1lBQ0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUMsdUJBQXVCLENBQUE7U0FDNUU7UUFFRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQ3BDO1lBQ0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1NBQ2xDO0lBQ0YsQ0FBQztJQUVELG9DQUFZLEdBQVo7UUFFQyxPQUFPLElBQUks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RyxzQkFBc0IsQ0FBQztJQUNqRCxnQkFBRSxHQUFHLGVBQWUsQ0FBQztJQTBON0Isb0JBQUM7Q0FBQSxBQTlORCxJQThOQztBQTlOWSxzQ0FBYTtBQTBSMUIsa0JBQWUsYUFBYSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRE9NV2luZG93LCBKU0RPTSwgVmlydHVhbENvbnNvbGUgfSBmcm9tICdqc2RvbSdcbmltcG9ydCBCbHVlYmlyZCBmcm9tICdibHVlYmlyZCdcbmltcG9ydCBjb25zb2xlLCB7IENvbnNvbGUgfSBmcm9tICdkZWJ1Zy1jb2xvcjInXG5cbmV4cG9ydCBpbnRlcmZhY2UgSUpTRE9NUmVuZGVyZXJPcHRpb25zXG57XG5cdC8qKlxuXHQgKiAwIChObyBsaW1pdClcblx0ICpcblx0ICogVGhlIG51bWJlciBvZiByb3V0ZXMgYWxsb3dlZCB0byBiZSByZW5kZXJlZCBhdCB0aGUgc2FtZSB0aW1lLiBVc2VmdWwgZm9yIGJyZWFraW5nIGRvd24gbWFzc2l2ZSBiYXRjaGVzIG9mIHJvdXRlcyBpbnRvIHNtYWxsZXIgY2h1bmtzLlxuXHQgKi9cblx0bWF4Q29uY3VycmVudFJvdXRlcz86IG51bWJlcixcblx0LyoqXG5cdCAqIEFuIG9iamVjdCB0byBpbmplY3QgaW50byB0aGUgZ2xvYmFsIHNjb3BlIG9mIHRoZSByZW5kZXJlZCBwYWdlIGJlZm9yZSBpdCBmaW5pc2hlcyBsb2FkaW5nLiBNdXN0IGJlIEpTT04uc3RyaW5naWZpeS1hYmxlLiBUaGUgcHJvcGVydHkgaW5qZWN0ZWQgdG8gaXMgd2luZG93WydfX1BSRVJFTkRFUl9JTkpFQ1RFRCddIGJ5IGRlZmF1bHQuXG5cdCAqL1xuXHRpbmplY3Q/OiBvYmplY3QsXG5cdC8qKlxuXHQgKiBUaGUgcHJvcGVydHkgdG8gbW91bnQgaW5qZWN0IHRvIGR1cmluZyByZW5kZXJpbmcuXG5cdCAqL1xuXHRpbmplY3RQcm9wZXJ0eT86IHN0cmluZyxcblx0LyoqXG5cdCAqIFdhaXQgdG8gcmVuZGVyIHVudGlsIHRoZSBzcGVjaWZpZWQgZXZlbnQgaXMgZmlyZWQgb24gdGhlIGRvY3VtZW50LiAoWW91IGNhbiBmaXJlIGFuIGV2ZW50IGxpa2Ugc286IGRvY3VtZW50LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdjdXN0b20tcmVuZGVyLXRyaWdnZXInKSlcblx0ICovXG5cdHJlbmRlckFmdGVyRG9jdW1lbnRFdmVudD86IHN0cmluZyxcblx0LyoqXG5cdCAqIChTZWxlY3Rvcilcblx0ICpcblx0ICogV2FpdCB0byByZW5kZXIgdW50aWwgdGhlIHNwZWNpZmllZCBlbGVtZW50IGlzIGRldGVjdGVkIHVzaW5nIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Jcblx0ICovXG5cdHJlbmRlckFmdGVyRWxlbWVudEV4aXN0cz86IHN0cmluZyxcblx0LyoqXG5cdCAqIChNaWxsaXNlY29uZHMpXG5cdCAqXG5cdCAqIFdhaXQgdG8gcmVuZGVyIHVudGlsIGEgY2VydGFpbiBhbW91bnQgb2YgdGltZSBoYXMgcGFzc2VkLlxuXHQgKi9cblx0cmVuZGVyQWZ0ZXJUaW1lPzogbnVtYmVyLFxuXG5cdC8qKlxuXHQgKiB0aGUgbWF4IHRpbWVvdXRcblx0ICovXG5cdHJlbmRlckFmdGVyVGltZU1heD86IG51bWJlcixcblxuXHQvKipcblx0ICogZGVsYXkgYWZ0ZXIgcmVuZGVyQWZ0ZXJEb2N1bWVudEV2ZW50IHJlbmRlckFmdGVyRWxlbWVudEV4aXN0c1xuXHQgKi9cblx0cmVuZGVyQWZ0ZXJEZWxheT86IG51bWJlcixcblxuXHRyZWZlcnJlcj86IHN0cmluZyB8IFVSTCxcblxuXHRkaXNhYmxlTG9nPzogYm9vbGVhbixcbn1cblxuZXhwb3J0IHR5cGUgSVJvdXRlcyA9IHN0cmluZ1tdO1xuXG5leHBvcnQgY2xhc3MgSlNET01SZW5kZXJlclxue1xuXHRzdGF0aWMgREVGQVVMVF9SRUZFUlJFUiA9IG5ldyBVUkwoYGh0dHBzOi8vcHJlcmVuZGVyZXItcmVuZGVyZXItanNkb21gKS50b1N0cmluZygpO1xuXHRzdGF0aWMgREVGQVVMVF9JTkpFQ1RfUFJPUEVSVFkgPSAnX19QUkVSRU5ERVJfSU5KRUNURUQnO1xuXHRzdGF0aWMgSUQgPSAnSlNET01SZW5kZXJlcic7XG5cblx0cHJvdGVjdGVkIF9yZW5kZXJlck9wdGlvbnM6IElKU0RPTVJlbmRlcmVyT3B0aW9ucyA9IHt9O1xuXHRwcm90ZWN0ZWQgX3ZpcnR1YWxDb25zb2xlOiBWaXJ0dWFsQ29uc29sZTtcblxuXHRwcm90ZWN0ZWQgY29uc29sZURlYnVnID0gbmV3IENvbnNvbGUoY29uc29sZSwge1xuXHRcdGxhYmVsOiB0cnVlLFxuXHRcdHRpbWU6IHRydWUsXG5cdFx0bGFiZWxGb3JtYXRGbihkYXRhKTogc3RyaW5nXG5cdFx0e1xuXHRcdFx0cmV0dXJuIGBbJHtKU0RPTVJlbmRlcmVyLklEfToke2RhdGEubmFtZS50b1VwcGVyQ2FzZSgpfV1gO1xuXHRcdH1cblx0fSk7XG5cblx0Y29uc3RydWN0b3IocmVuZGVyZXJPcHRpb25zOiBJSlNET01SZW5kZXJlck9wdGlvbnMpXG5cdHtcblx0XHRPYmplY3QuYXNzaWduKHRoaXMuX3JlbmRlcmVyT3B0aW9ucywgcmVuZGVyZXJPcHRpb25zKTtcblxuXHRcdGlmICh0aGlzLl9yZW5kZXJlck9wdGlvbnMubWF4Q29uY3VycmVudFJvdXRlcyA9PSBudWxsKSB0aGlzLl9yZW5kZXJlck9wdGlvbnMubWF4Q29uY3VycmVudFJvdXRlcyA9IDA7XG5cblx0XHRpZiAodGhpcy5fcmVuZGVyZXJPcHRpb25zLmluamVjdCAmJiAhdGhpcy5fcmVuZGVyZXJPcHRpb25zLmluamVjdFByb3BlcnR5KVxuXHRcdHtcblx0XHRcdHRoaXMuX3JlbmRlcmVyT3B0aW9ucy5pbmplY3RQcm9wZXJ0eSA9IEpTRE9NUmVuZGVyZXIuREVGQVVMVF9JTkpFQ1RfUFJPUEVSVFlcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fcmVuZGVyZXJPcHRpb25zLmRpc2FibGVMb2cpXG5cdFx0e1xuXHRcdFx0dGhpcy5jb25zb2xlRGVidWcuZW5hYmxlZCA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdGluamVjdE9iamVjdCgpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fcmVuZGVyZXJPcHRpb25zLmluamVjdFxuXHR9XG5cblx0aW5pdGlhbGl6ZSgpXG5cdHtcblx0XHQvLyBOT09QXG5cdFx0cmV0dXJuIEJsdWViaXJkLnJlc29sdmUoKVxuXHR9XG5cblx0Z2V0VmlydHVhbENvbnNvbGUoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3ZpcnR1YWxDb25zb2xlIHx8ICh0aGlzLl92aXJ0dWFsQ29uc29sZSA9IG5ldyBWaXJ0dWFsQ29uc29sZSgpKTtcblx0fVxuXG5cdHJlbmRlclJvdXRlcyhyb3V0ZXM6IElSb3V0ZXMsIFByZXJlbmRlcmVyOiB7XG5cdFx0Z2V0T3B0aW9ucygpOiBJUHJlcmVuZGVyZXJPcHRpb25zXG5cdH0pOiBCbHVlYmlyZDxJUmVzdWx0W10+XG5cdHtcblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHJldHVybiBCbHVlYmlyZC5yZXNvbHZlKClcblx0XHRcdC50aGVuKCgpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHJvb3RPcHRpb25zID0gUHJlcmVuZGVyZXIuZ2V0T3B0aW9ucygpO1xuXG5cdFx0XHRcdGNvbnN0IF9yZW5kZXJlck9wdGlvbnMgPSB0aGlzLl9yZW5kZXJlck9wdGlvbnM7XG5cdFx0XHRcdGNvbnN0IHZpcnR1YWxDb25zb2xlID0gc2VsZi5nZXRWaXJ0dWFsQ29uc29sZSgpO1xuXG5cdFx0XHRcdHZpcnR1YWxDb25zb2xlLm9uKCdqc2RvbUVycm9yJywgZSA9PiBzZWxmLmNvbnNvbGVEZWJ1Zy5lcnJvcignanNkb21FcnJvcicsIGUpKTtcblxuXHRcdFx0XHRjb25zdCByZWZlcnJlciA9IF9yZW5kZXJlck9wdGlvbnMucmVmZXJyZXJcblx0XHRcdFx0XHQ/IF9yZW5kZXJlck9wdGlvbnMucmVmZXJyZXIudG9TdHJpbmcoKVxuXHRcdFx0XHRcdDogSlNET01SZW5kZXJlci5ERUZBVUxUX1JFRkVSUkVSO1xuXG5cdFx0XHRcdHJldHVybiBCbHVlYmlyZFxuXHRcdFx0XHRcdC5yZXNvbHZlKHJvdXRlcylcblx0XHRcdFx0XHQubWFwKGFzeW5jIChyb3V0ZSkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzZWxmLmNvbnNvbGVEZWJ1Zy5kZWJ1Zyhgcm91dGU6c3RhcnRgLCByb3V0ZSk7XG5cblx0XHRcdFx0XHRcdGNvbnN0IGpzZG9tID0gYXdhaXQgSlNET00uZnJvbVVSTChgaHR0cDovLzEyNy4wLjAuMToke3Jvb3RPcHRpb25zLnNlcnZlci5wb3J0fSR7cm91dGV9YCwge1xuXHRcdFx0XHRcdFx0XHRyZXNvdXJjZXM6ICd1c2FibGUnLFxuXHRcdFx0XHRcdFx0XHRydW5TY3JpcHRzOiAnZGFuZ2Vyb3VzbHknLFxuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdHByZXRlbmRUb0JlVmlzdWFsOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRpbmNsdWRlTm9kZUxvY2F0aW9uczogdHJ1ZSxcblxuXHRcdFx0XHRcdFx0XHRyZWZlcnJlcixcblxuXHRcdFx0XHRcdFx0XHRWaXJ0dWFsQ29uc29sZTogdmlydHVhbENvbnNvbGUsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0aWYgKF9yZW5kZXJlck9wdGlvbnMuaW5qZWN0KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRqc2RvbS53aW5kb3dbX3JlbmRlcmVyT3B0aW9ucy5pbmplY3RQcm9wZXJ0eV0gPSBzZWxmLmluamVjdE9iamVjdCgpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRqc2RvbS53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbiAoZXZlbnQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vc2VsZi5jb25zb2xlRGVidWcuZXJyb3IoYHdpbmRvdy5lcnJvcmAsIHJvdXRlLCBldmVudC5lcnJvcilcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gc2VsZi5nZXRQYWdlQ29udGVudHMoanNkb20sIF9yZW5kZXJlck9wdGlvbnMsIHJvdXRlKVxuXHRcdFx0XHRcdFx0XHQudGFwKGZ1bmN0aW9uICgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRzZWxmLmNvbnNvbGVEZWJ1Zy5kZWJ1Zyhgcm91dGU6ZW5kYCwgcm91dGUpO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRhcENhdGNoKGUgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzZWxmLmNvbnNvbGVEZWJ1Zy5lcnJvcihgcmVuZGVyUm91dGVzYCwgZS5tZXNzYWdlKVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXHRcdFx0fSlcblx0XHRcdC50YXAoKCkgPT4ge1xuXHRcdFx0XHRzZWxmLmNvbnNvbGVEZWJ1Zy5zdWNjZXNzKGByZW5kZXJSb3V0ZXM6ZG9uZWAsIHJvdXRlcywgcm91dGVzLmxlbmd0aCk7XG5cdFx0XHR9KVxuXHRcdFx0O1xuXHR9XG5cblx0ZGVzdHJveSgpXG5cdHtcblx0XHQvLyBOT09QXG5cdH1cblxuXHRwcm90ZWN0ZWQgZ2V0UGFnZUNvbnRlbnRzKGpzZG9tOiBKU0RPTSwgb3B0aW9uczogSUpTRE9NUmVuZGVyZXJPcHRpb25zLCBvcmlnaW5hbFJvdXRlOiBzdHJpbmcpOiBCbHVlYmlyZDxJUmVzdWx0PlxuXHR7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHRjb25zdCBzZWxmID0gdGhpcztcblxuXHRcdHJldHVybiBuZXcgQmx1ZWJpcmQ8SVJlc3VsdD4oYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT5cblx0XHR7XG5cdFx0XHRsZXQgaW50OiBudW1iZXI7XG5cblx0XHRcdGxldCBfcmVzb2x2ZWQ6IGJvb2xlYW47XG5cblx0XHRcdGFzeW5jIGZ1bmN0aW9uIGNhcHR1cmVEb2N1bWVudCgpXG5cdFx0XHR7XG5cdFx0XHRcdF9yZXNvbHZlZCA9IHRydWU7XG5cdFx0XHRcdHJlc2V0VGltZXIoKTtcblxuXHRcdFx0XHRyZXR1cm4gQmx1ZWJpcmRcblx0XHRcdFx0XHQuZGVsYXkob3B0aW9ucy5yZW5kZXJBZnRlckRlbGF5IHwgMClcblx0XHRcdFx0XHQudGhlbigoKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnN0IHJlc3VsdDogSVJlc3VsdCA9IHtcblx0XHRcdFx0XHRcdFx0b3JpZ2luYWxSb3V0ZTogb3JpZ2luYWxSb3V0ZSxcblx0XHRcdFx0XHRcdFx0cm91dGU6IG9yaWdpbmFsUm91dGUsXG5cdFx0XHRcdFx0XHRcdGh0bWw6IGpzZG9tLnNlcmlhbGl6ZSgpLFxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0anNkb20ud2luZG93LmNsb3NlKCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGFwKCgpID0+IHtcblx0XHRcdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLnN1Y2Nlc3MoYGNhcHR1cmVEb2N1bWVudDpkb25lYCwgb3JpZ2luYWxSb3V0ZSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGFwQ2F0Y2goZSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLmVycm9yKGBjYXB0dXJlRG9jdW1lbnRgLCBlKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdDtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gcmVzZXRUaW1lcigpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChpbnQgIT0gbnVsbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNsZWFySW50ZXJ2YWwoaW50KVxuXHRcdFx0XHRcdGludCA9IG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gZG9uZSgpXG5cdFx0XHR7XG5cdFx0XHRcdHJlc2V0VGltZXIoKTtcblxuXHRcdFx0XHRpZiAoIV9yZXNvbHZlZClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJlc29sdmUoY2FwdHVyZURvY3VtZW50KCkpXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cblx0XHRcdC8vIENBUFRVUkUgV0hFTiBBTiBFVkVOVCBGSVJFUyBPTiBUSEUgRE9DVU1FTlRcblx0XHRcdGlmIChvcHRpb25zLnJlbmRlckFmdGVyRG9jdW1lbnRFdmVudClcblx0XHRcdHtcblx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cblx0XHRcdFx0anNkb20ud2luZG93LmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIob3B0aW9ucy5yZW5kZXJBZnRlckRvY3VtZW50RXZlbnQsICgpID0+IGRvbmUoKSlcblxuXHRcdFx0XHQvLyBDQVBUVVJFIE9OQ0UgQSBTUEVDSUZDIEVMRU1FTlQgRVhJU1RTXG5cdFx0XHR9XG5cblx0XHRcdGlmIChvcHRpb25zLnJlbmRlckFmdGVyRWxlbWVudEV4aXN0cylcblx0XHRcdHtcblx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRpbnQgPSBzZXRJbnRlcnZhbCgoKSA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKGpzZG9tLndpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKG9wdGlvbnMucmVuZGVyQWZ0ZXJFbGVtZW50RXhpc3RzKSkgZG9uZSgpXG5cdFx0XHRcdH0sIDEwMClcblxuXHRcdFx0XHQvLyBDQVBUVVJFIEFGVEVSIEEgTlVNQkVSIE9GIE1JTExJU0VDT05EU1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYm9vbClcblx0XHRcdHtcblx0XHRcdFx0c2V0VGltZW91dChkb25lLCAob3B0aW9ucy5yZW5kZXJBZnRlclRpbWVNYXggfCAwKSB8fCAzMDAwMClcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKG9wdGlvbnMucmVuZGVyQWZ0ZXJUaW1lKVxuXHRcdFx0e1xuXHRcdFx0XHRzZXRUaW1lb3V0KGRvbmUsIG9wdGlvbnMucmVuZGVyQWZ0ZXJUaW1lKVxuXG5cdFx0XHRcdC8vIERFRkFVTFQ6IFJVTiBJTU1FRElBVEVMWVxuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRkb25lKClcblx0XHRcdH1cblx0XHR9KVxuXHR9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVBvc3RQcm9jZXNzQ29udGV4dFxue1xuXHQvKipcblx0ICogVGhlIHByZXJlbmRlcmVkIHJvdXRlLCBhZnRlciBmb2xsb3dpbmcgcmVkaXJlY3RzLlxuXHQgKi9cblx0cm91dGU6IHN0cmluZ1xuXHQvKipcblx0ICogVGhlIG9yaWdpbmFsIHJvdXRlIHBhc3NlZCwgYmVmb3JlIHJlZGlyZWN0cy5cblx0ICovXG5cdG9yaWdpbmFsUm91dGU6IHN0cmluZ1xuXHQvKipcblx0ICogVGhlIHBhdGggdG8gd3JpdGUgdGhlIHJlbmRlcmVkIEhUTUwgdG8uXG5cdCAqL1xuXHRodG1sOiBzdHJpbmdcblx0LyoqXG5cdCAqIFRoZSBwYXRoIHRvIHdyaXRlIHRoZSByZW5kZXJlZCBIVE1MIHRvLlxuXHQgKiBUaGlzIGlzIG51bGwgKGF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlZCBhZnRlciBwb3N0UHJvY2Vzcylcblx0ICogdW5sZXNzIGV4cGxpY2l0bHkgc2V0LlxuXHQgKi9cblx0b3V0cHV0UGF0aD86IHN0cmluZ1xufVxuXG5leHBvcnQgdHlwZSBJUmVzb2x2YWJsZTxSPiA9IFIgfCBQcm9taXNlTGlrZTxSPjtcblxuZXhwb3J0IGludGVyZmFjZSBJUHJlcmVuZGVyZXJPcHRpb25zXG57XG5cdHN0YXRpY0Rpcj86IHN0cmluZyxcblx0b3V0cHV0RGlyPzogc3RyaW5nLFxuXHRpbmRleFBhdGg/OiBzdHJpbmcsXG5cblx0LyoqXG5cdCAqIFRoZSBwb3N0UHJvY2VzcyhPYmplY3QgY29udGV4dCk6IE9iamVjdCB8IFByb21pc2UgZnVuY3Rpb24gaW4geW91ciByZW5kZXJlciBjb25maWd1cmF0aW9uIGFsbG93cyB5b3UgdG8gYWRqdXN0IHRoZSBvdXRwdXQgb2YgcHJlcmVuZGVyLXNwYS1wbHVnaW4gYmVmb3JlIHdyaXRpbmcgaXQgdG8gYSBmaWxlLlxuXHQgKiBJdCBpcyBjYWxsZWQgb25jZSBwZXIgcmVuZGVyZWQgcm91dGUgYW5kIGlzIHBhc3NlZCBhIGNvbnRleHQgb2JqZWN0IGluIHRoZSBmb3JtIG9mOlxuXHQgKlxuXHQgKiBAcGFyYW0ge0lQb3N0UHJvY2Vzc0NvbnRleHR9IGNvbnRleHRcblx0ICogQHJldHVybnMge0lSZXNvbHZhYmxlPElQb3N0UHJvY2Vzc0NvbnRleHQ+fVxuXHQgKi9cblx0cG9zdFByb2Nlc3M/KGNvbnRleHQ6IElQb3N0UHJvY2Vzc0NvbnRleHQpOiBJUmVzb2x2YWJsZTxJUG9zdFByb2Nlc3NDb250ZXh0PixcblxuXHRzZXJ2ZXI/OiB7XG5cdFx0LyoqXG5cdFx0ICogVGhlIHBvcnQgZm9yIHRoZSBhcHAgc2VydmVyIHRvIHJ1biBvbi5cblx0XHQgKi9cblx0XHRwb3J0PzogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIFByb3h5IGNvbmZpZ3VyYXRpb24uIEhhcyB0aGUgc2FtZSBzaWduYXR1cmUgYXMgd2VicGFjay1kZXYtc2VydmVyXG5cdFx0ICovXG5cdFx0cHJveHk/OiBvYmplY3QsXG5cdH0sXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVJlc3VsdFxue1xuXHRvcmlnaW5hbFJvdXRlOiBzdHJpbmcsXG5cdHJvdXRlOiBzdHJpbmcsXG5cdGh0bWw6IHN0cmluZyxcbn1cblxuZXhwb3J0IGRlZmF1bHQgSlNET01SZW5kZXJlclxuIl19
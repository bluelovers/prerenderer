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
            //virtualConsole.on('jsdomError', e => self.consoleDebug.error('jsdomError', e));
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
                                    virtualConsole: virtualConsole,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwrQkFBd0Q7QUFDeEQsc0RBQStCO0FBQy9CLDJEQUErQztBQW9EL0M7SUFrQkMsdUJBQVksZUFBc0M7UUFaeEMscUJBQWdCLEdBQTBCLEVBQUUsQ0FBQztRQUc3QyxpQkFBWSxHQUFHLElBQUksc0JBQU8sQ0FBQyxzQkFBTyxFQUFFO1lBQzdDLEtBQUssRUFBRSxJQUFJO1lBQ1gsSUFBSSxFQUFFLElBQUk7WUFDVixhQUFhLEVBQWIsVUFBYyxJQUFJO2dCQUVqQixPQUFPLE1BQUksYUFBYSxDQUFDLEVBQUUsU0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxNQUFHLENBQUM7WUFDM0QsQ0FBQztTQUNELENBQUMsQ0FBQztRQUlGLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBRXRELElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixJQUFJLElBQUk7WUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO1FBRXJHLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQ3pFO1lBQ0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUMsdUJBQXVCLENBQUE7U0FDNUU7UUFFRCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQ3BDO1lBQ0MsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1NBQ2xDO0lBQ0YsQ0FBQztJQUVELG9DQUFZLEdBQVo7UUFFQyxPQUFPLElBQUks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QyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFBO2lCQUMzRDtxQkFDSSxJQUFJLE9BQU8sQ0FBQyxlQUFlLEVBQ2hDO29CQUNDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO29CQUV6QywyQkFBMkI7aUJBQzNCO3FCQUVEO29CQUNDLElBQUksRUFBRSxDQUFBO2lCQUNOOzs7YUFDRCxDQUFDLENBQUE7SUFDSCxDQUFDO0lBck9NLDhCQUFnQixHQUFHLElBQUksR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDNUUscUNBQXVCLEdBQUcsc0JBQXNCLENBQUM7SUFDakQsZ0JBQUUsR0FBRyxlQUFlLENBQUM7SUFvTzdCLG9CQUFDO0NBQUEsQUF4T0QsSUF3T0M7QUF4T1ksc0NBQWE7QUFvUzFCLGtCQUFlLGFBQWEsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERPTVdpbmRvdywgSlNET00sIFZpcnR1YWxDb25zb2xlIH0gZnJvbSAnanNkb20nXG5pbXBvcnQgQmx1ZWJpcmQgZnJvbSAnYmx1ZWJpcmQnXG5pbXBvcnQgY29uc29sZSwgeyBDb25zb2xlIH0gZnJvbSAnZGVidWctY29sb3IyJ1xuXG5leHBvcnQgaW50ZXJmYWNlIElKU0RPTVJlbmRlcmVyT3B0aW9uc1xue1xuXHQvKipcblx0ICogMCAoTm8gbGltaXQpXG5cdCAqXG5cdCAqIFRoZSBudW1iZXIgb2Ygcm91dGVzIGFsbG93ZWQgdG8gYmUgcmVuZGVyZWQgYXQgdGhlIHNhbWUgdGltZS4gVXNlZnVsIGZvciBicmVha2luZyBkb3duIG1hc3NpdmUgYmF0Y2hlcyBvZiByb3V0ZXMgaW50byBzbWFsbGVyIGNodW5rcy5cblx0ICovXG5cdG1heENvbmN1cnJlbnRSb3V0ZXM/OiBudW1iZXIsXG5cdC8qKlxuXHQgKiBBbiBvYmplY3QgdG8gaW5qZWN0IGludG8gdGhlIGdsb2JhbCBzY29wZSBvZiB0aGUgcmVuZGVyZWQgcGFnZSBiZWZvcmUgaXQgZmluaXNoZXMgbG9hZGluZy4gTXVzdCBiZSBKU09OLnN0cmluZ2lmaXktYWJsZS4gVGhlIHByb3BlcnR5IGluamVjdGVkIHRvIGlzIHdpbmRvd1snX19QUkVSRU5ERVJfSU5KRUNURUQnXSBieSBkZWZhdWx0LlxuXHQgKi9cblx0aW5qZWN0Pzogb2JqZWN0LFxuXHQvKipcblx0ICogVGhlIHByb3BlcnR5IHRvIG1vdW50IGluamVjdCB0byBkdXJpbmcgcmVuZGVyaW5nLlxuXHQgKi9cblx0aW5qZWN0UHJvcGVydHk/OiBzdHJpbmcsXG5cdC8qKlxuXHQgKiBXYWl0IHRvIHJlbmRlciB1bnRpbCB0aGUgc3BlY2lmaWVkIGV2ZW50IGlzIGZpcmVkIG9uIHRoZSBkb2N1bWVudC4gKFlvdSBjYW4gZmlyZSBhbiBldmVudCBsaWtlIHNvOiBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY3VzdG9tLXJlbmRlci10cmlnZ2VyJykpXG5cdCAqL1xuXHRyZW5kZXJBZnRlckRvY3VtZW50RXZlbnQ/OiBzdHJpbmcsXG5cdC8qKlxuXHQgKiAoU2VsZWN0b3IpXG5cdCAqXG5cdCAqIFdhaXQgdG8gcmVuZGVyIHVudGlsIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBpcyBkZXRlY3RlZCB1c2luZyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yXG5cdCAqL1xuXHRyZW5kZXJBZnRlckVsZW1lbnRFeGlzdHM/OiBzdHJpbmcsXG5cdC8qKlxuXHQgKiAoTWlsbGlzZWNvbmRzKVxuXHQgKlxuXHQgKiBXYWl0IHRvIHJlbmRlciB1bnRpbCBhIGNlcnRhaW4gYW1vdW50IG9mIHRpbWUgaGFzIHBhc3NlZC5cblx0ICovXG5cdHJlbmRlckFmdGVyVGltZT86IG51bWJlcixcblxuXHQvKipcblx0ICogdGhlIG1heCB0aW1lb3V0XG5cdCAqL1xuXHRyZW5kZXJBZnRlclRpbWVNYXg/OiBudW1iZXIsXG5cblx0LyoqXG5cdCAqIGRlbGF5IGFmdGVyIHJlbmRlckFmdGVyRG9jdW1lbnRFdmVudCByZW5kZXJBZnRlckVsZW1lbnRFeGlzdHNcblx0ICovXG5cdHJlbmRlckFmdGVyRGVsYXk/OiBudW1iZXIsXG5cblx0cmVmZXJyZXI/OiBzdHJpbmcgfCBVUkwsXG5cblx0ZGlzYWJsZUxvZz86IGJvb2xlYW4sXG59XG5cbmV4cG9ydCB0eXBlIElSb3V0ZXMgPSBzdHJpbmdbXTtcblxuZXhwb3J0IGNsYXNzIEpTRE9NUmVuZGVyZXJcbntcblx0c3RhdGljIERFRkFVTFRfUkVGRVJSRVIgPSBuZXcgVVJMKGBodHRwczovL3ByZXJlbmRlcmVyLXJlbmRlcmVyLWpzZG9tYCkudG9TdHJpbmcoKTtcblx0c3RhdGljIERFRkFVTFRfSU5KRUNUX1BST1BFUlRZID0gJ19fUFJFUkVOREVSX0lOSkVDVEVEJztcblx0c3RhdGljIElEID0gJ0pTRE9NUmVuZGVyZXInO1xuXG5cdHByb3RlY3RlZCBfcmVuZGVyZXJPcHRpb25zOiBJSlNET01SZW5kZXJlck9wdGlvbnMgPSB7fTtcblx0cHJvdGVjdGVkIF92aXJ0dWFsQ29uc29sZTogVmlydHVhbENvbnNvbGU7XG5cblx0cHJvdGVjdGVkIGNvbnNvbGVEZWJ1ZyA9IG5ldyBDb25zb2xlKGNvbnNvbGUsIHtcblx0XHRsYWJlbDogdHJ1ZSxcblx0XHR0aW1lOiB0cnVlLFxuXHRcdGxhYmVsRm9ybWF0Rm4oZGF0YSk6IHN0cmluZ1xuXHRcdHtcblx0XHRcdHJldHVybiBgWyR7SlNET01SZW5kZXJlci5JRH06JHtkYXRhLm5hbWUudG9VcHBlckNhc2UoKX1dYDtcblx0XHR9XG5cdH0pO1xuXG5cdGNvbnN0cnVjdG9yKHJlbmRlcmVyT3B0aW9uczogSUpTRE9NUmVuZGVyZXJPcHRpb25zKVxuXHR7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLl9yZW5kZXJlck9wdGlvbnMsIHJlbmRlcmVyT3B0aW9ucyk7XG5cblx0XHRpZiAodGhpcy5fcmVuZGVyZXJPcHRpb25zLm1heENvbmN1cnJlbnRSb3V0ZXMgPT0gbnVsbCkgdGhpcy5fcmVuZGVyZXJPcHRpb25zLm1heENvbmN1cnJlbnRSb3V0ZXMgPSAwO1xuXG5cdFx0aWYgKHRoaXMuX3JlbmRlcmVyT3B0aW9ucy5pbmplY3QgJiYgIXRoaXMuX3JlbmRlcmVyT3B0aW9ucy5pbmplY3RQcm9wZXJ0eSlcblx0XHR7XG5cdFx0XHR0aGlzLl9yZW5kZXJlck9wdGlvbnMuaW5qZWN0UHJvcGVydHkgPSBKU0RPTVJlbmRlcmVyLkRFRkFVTFRfSU5KRUNUX1BST1BFUlRZXG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX3JlbmRlcmVyT3B0aW9ucy5kaXNhYmxlTG9nKVxuXHRcdHtcblx0XHRcdHRoaXMuY29uc29sZURlYnVnLmVuYWJsZWQgPSBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRpbmplY3RPYmplY3QoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3JlbmRlcmVyT3B0aW9ucy5pbmplY3Rcblx0fVxuXG5cdGluaXRpYWxpemUoKVxuXHR7XG5cdFx0Ly8gTk9PUFxuXHRcdHJldHVybiBCbHVlYmlyZC5yZXNvbHZlKClcblx0fVxuXG5cdGdldFZpcnR1YWxDb25zb2xlKClcblx0e1xuXHRcdHJldHVybiB0aGlzLl92aXJ0dWFsQ29uc29sZSB8fCAodGhpcy5fdmlydHVhbENvbnNvbGUgPSBuZXcgVmlydHVhbENvbnNvbGUoKSk7XG5cdH1cblxuXHRyZW5kZXJSb3V0ZXMocm91dGVzOiBJUm91dGVzLCBQcmVyZW5kZXJlcjoge1xuXHRcdGdldE9wdGlvbnMoKTogSVByZXJlbmRlcmVyT3B0aW9uc1xuXHR9KTogQmx1ZWJpcmQ8SVJlc3VsdFtdPlxuXHR7XG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cdFx0Y29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcblxuXHRcdHJldHVybiBCbHVlYmlyZC5yZXNvbHZlKClcblx0XHRcdC50aGVuKCgpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IHJvb3RPcHRpb25zID0gUHJlcmVuZGVyZXIuZ2V0T3B0aW9ucygpO1xuXG5cdFx0XHRcdGNvbnN0IF9yZW5kZXJlck9wdGlvbnMgPSB0aGlzLl9yZW5kZXJlck9wdGlvbnM7XG5cdFx0XHRcdGNvbnN0IHZpcnR1YWxDb25zb2xlID0gc2VsZi5nZXRWaXJ0dWFsQ29uc29sZSgpO1xuXG5cdFx0XHRcdC8vdmlydHVhbENvbnNvbGUub24oJ2pzZG9tRXJyb3InLCBlID0+IHNlbGYuY29uc29sZURlYnVnLmVycm9yKCdqc2RvbUVycm9yJywgZSkpO1xuXG5cdFx0XHRcdGNvbnN0IHJlZmVycmVyID0gX3JlbmRlcmVyT3B0aW9ucy5yZWZlcnJlclxuXHRcdFx0XHRcdD8gX3JlbmRlcmVyT3B0aW9ucy5yZWZlcnJlci50b1N0cmluZygpXG5cdFx0XHRcdFx0OiBKU0RPTVJlbmRlcmVyLkRFRkFVTFRfUkVGRVJSRVI7XG5cblx0XHRcdFx0cmV0dXJuIEJsdWViaXJkXG5cdFx0XHRcdFx0LnJlc29sdmUocm91dGVzKVxuXHRcdFx0XHRcdC5tYXAoYXN5bmMgKHJvdXRlKSA9PlxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHNlbGYuY29uc29sZURlYnVnLmRlYnVnKGByb3V0ZTpzdGFydGAsIHJvdXRlKTtcblxuXHRcdFx0XHRcdFx0Y29uc3QganNkb20gPSBhd2FpdCBKU0RPTS5mcm9tVVJMKGBodHRwOi8vMTI3LjAuMC4xOiR7cm9vdE9wdGlvbnMuc2VydmVyLnBvcnR9JHtyb3V0ZX1gLCB7XG5cdFx0XHRcdFx0XHRcdHJlc291cmNlczogJ3VzYWJsZScsXG5cdFx0XHRcdFx0XHRcdHJ1blNjcmlwdHM6ICdkYW5nZXJvdXNseScsXG5cdFx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdFx0cHJldGVuZFRvQmVWaXN1YWw6IHRydWUsXG5cdFx0XHRcdFx0XHRcdGluY2x1ZGVOb2RlTG9jYXRpb25zOiB0cnVlLFxuXG5cdFx0XHRcdFx0XHRcdHJlZmVycmVyLFxuXG5cdFx0XHRcdFx0XHRcdFZpcnR1YWxDb25zb2xlOiB2aXJ0dWFsQ29uc29sZSxcblx0XHRcdFx0XHRcdFx0dmlydHVhbENvbnNvbGUsXG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0aWYgKF9yZW5kZXJlck9wdGlvbnMuaW5qZWN0KVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRqc2RvbS53aW5kb3dbX3JlbmRlcmVyT3B0aW9ucy5pbmplY3RQcm9wZXJ0eV0gPSBzZWxmLmluamVjdE9iamVjdCgpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRqc2RvbS53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbiAoZXZlbnQpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdC8vc2VsZi5jb25zb2xlRGVidWcuZXJyb3IoYHdpbmRvdy5lcnJvcmAsIHJvdXRlLCBldmVudC5lcnJvcilcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRyZXR1cm4gc2VsZi5nZXRQYWdlQ29udGVudHMoanNkb20sIF9yZW5kZXJlck9wdGlvbnMsIHJvdXRlKVxuXHRcdFx0XHRcdFx0XHQudGFwKGZ1bmN0aW9uICgpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRzZWxmLmNvbnNvbGVEZWJ1Zy5kZWJ1Zyhgcm91dGU6ZW5kYCwgcm91dGUpO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRhcENhdGNoKGUgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzZWxmLmNvbnNvbGVEZWJ1Zy5lcnJvcihgcmVuZGVyUm91dGVzYCwgZS5tZXNzYWdlKVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0O1xuXHRcdFx0fSlcblx0XHRcdC50YXAoKCkgPT4ge1xuXHRcdFx0XHRzZWxmLmNvbnNvbGVEZWJ1Zy5zdWNjZXNzKGByZW5kZXJSb3V0ZXM6ZG9uZWAsIHJvdXRlcywgcm91dGVzLmxlbmd0aCk7XG5cdFx0XHR9KVxuXHRcdFx0LmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHRzZWxmLmNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgcmVuZGVyUm91dGVzOmVuZGAsIHJvdXRlcywgYHVzZWRgLCAoRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSkgLyAxMDAwICwgJ3NlYycpO1xuXHRcdFx0fSlcblx0XHRcdDtcblx0fVxuXG5cdGRlc3Ryb3koKVxuXHR7XG5cdFx0Ly8gTk9PUFxuXHR9XG5cblx0cHJvdGVjdGVkIGdldFBhZ2VDb250ZW50cyhqc2RvbTogSlNET00sIG9wdGlvbnM6IElKU0RPTVJlbmRlcmVyT3B0aW9ucywgb3JpZ2luYWxSb3V0ZTogc3RyaW5nKTogQmx1ZWJpcmQ8SVJlc3VsdD5cblx0e1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRyZXR1cm4gbmV3IEJsdWViaXJkPElSZXN1bHQ+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+XG5cdFx0e1xuXHRcdFx0Y29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcblxuXHRcdFx0bGV0IGludDogbnVtYmVyO1xuXG5cdFx0XHRsZXQgX3Jlc29sdmVkOiBib29sZWFuO1xuXG5cdFx0XHRhc3luYyBmdW5jdGlvbiBjYXB0dXJlRG9jdW1lbnQoKVxuXHRcdFx0e1xuXHRcdFx0XHRfcmVzb2x2ZWQgPSB0cnVlO1xuXHRcdFx0XHRyZXNldFRpbWVyKCk7XG5cblx0XHRcdFx0cmV0dXJuIEJsdWViaXJkXG5cdFx0XHRcdFx0LmRlbGF5KG9wdGlvbnMucmVuZGVyQWZ0ZXJEZWxheSB8IDApXG5cdFx0XHRcdFx0LnRoZW4oKCkgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb25zdCByZXN1bHQ6IElSZXN1bHQgPSB7XG5cdFx0XHRcdFx0XHRcdG9yaWdpbmFsUm91dGU6IG9yaWdpbmFsUm91dGUsXG5cdFx0XHRcdFx0XHRcdHJvdXRlOiBvcmlnaW5hbFJvdXRlLFxuXHRcdFx0XHRcdFx0XHRodG1sOiBqc2RvbS5zZXJpYWxpemUoKSxcblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdGpzZG9tLndpbmRvdy5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHJlc3VsdFxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRhcCgoKSA9PiB7XG5cdFx0XHRcdFx0XHRzZWxmLmNvbnNvbGVEZWJ1Zy5zdWNjZXNzKGBjYXB0dXJlRG9jdW1lbnQ6ZG9uZWAsIG9yaWdpbmFsUm91dGUpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnRhcENhdGNoKGUgPT5cblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzZWxmLmNvbnNvbGVEZWJ1Zy5lcnJvcihgY2FwdHVyZURvY3VtZW50YCwgZSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuZmluYWxseSgoKSA9PiB7XG5cdFx0XHRcdFx0XHRzZWxmLmNvbnNvbGVEZWJ1Zy5kZWJ1ZyhgY2FwdHVyZURvY3VtZW50OmVuZGAsIG9yaWdpbmFsUm91dGUsIGB1c2VkYCwgKERhdGUubm93KCkgLSBzdGFydFRpbWUpIC8gMTAwMCAsICdzZWMnKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdDtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gcmVzZXRUaW1lcigpXG5cdFx0XHR7XG5cdFx0XHRcdGlmIChpbnQgIT0gbnVsbClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNsZWFySW50ZXJ2YWwoaW50KVxuXHRcdFx0XHRcdGludCA9IG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gZG9uZSgpXG5cdFx0XHR7XG5cdFx0XHRcdHJlc2V0VGltZXIoKTtcblxuXHRcdFx0XHRpZiAoIV9yZXNvbHZlZClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJlc29sdmUoY2FwdHVyZURvY3VtZW50KCkpXG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cblx0XHRcdC8vIENBUFRVUkUgV0hFTiBBTiBFVkVOVCBGSVJFUyBPTiBUSEUgRE9DVU1FTlRcblx0XHRcdGlmIChvcHRpb25zLnJlbmRlckFmdGVyRG9jdW1lbnRFdmVudClcblx0XHRcdHtcblx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cblx0XHRcdFx0anNkb20ud2luZG93LmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIob3B0aW9ucy5yZW5kZXJBZnRlckRvY3VtZW50RXZlbnQsICgpID0+IGRvbmUoKSlcblxuXHRcdFx0XHQvLyBDQVBUVVJFIE9OQ0UgQSBTUEVDSUZDIEVMRU1FTlQgRVhJU1RTXG5cdFx0XHR9XG5cblx0XHRcdGlmIChvcHRpb25zLnJlbmRlckFmdGVyRWxlbWVudEV4aXN0cylcblx0XHRcdHtcblx0XHRcdFx0Ym9vbCA9IHRydWU7XG5cblx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRpbnQgPSBzZXRJbnRlcnZhbCgoKSA9PlxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0aWYgKGpzZG9tLndpbmRvdy5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKG9wdGlvbnMucmVuZGVyQWZ0ZXJFbGVtZW50RXhpc3RzKSkgZG9uZSgpXG5cdFx0XHRcdH0sIDEwMClcblxuXHRcdFx0XHQvLyBDQVBUVVJFIEFGVEVSIEEgTlVNQkVSIE9GIE1JTExJU0VDT05EU1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoYm9vbClcblx0XHRcdHtcblx0XHRcdFx0c2V0VGltZW91dChkb25lLCAob3B0aW9ucy5yZW5kZXJBZnRlclRpbWVNYXggfCAwKSB8fCAzMDAwMClcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKG9wdGlvbnMucmVuZGVyQWZ0ZXJUaW1lKVxuXHRcdFx0e1xuXHRcdFx0XHRzZXRUaW1lb3V0KGRvbmUsIG9wdGlvbnMucmVuZGVyQWZ0ZXJUaW1lKVxuXG5cdFx0XHRcdC8vIERFRkFVTFQ6IFJVTiBJTU1FRElBVEVMWVxuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRkb25lKClcblx0XHRcdH1cblx0XHR9KVxuXHR9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVBvc3RQcm9jZXNzQ29udGV4dFxue1xuXHQvKipcblx0ICogVGhlIHByZXJlbmRlcmVkIHJvdXRlLCBhZnRlciBmb2xsb3dpbmcgcmVkaXJlY3RzLlxuXHQgKi9cblx0cm91dGU6IHN0cmluZ1xuXHQvKipcblx0ICogVGhlIG9yaWdpbmFsIHJvdXRlIHBhc3NlZCwgYmVmb3JlIHJlZGlyZWN0cy5cblx0ICovXG5cdG9yaWdpbmFsUm91dGU6IHN0cmluZ1xuXHQvKipcblx0ICogVGhlIHBhdGggdG8gd3JpdGUgdGhlIHJlbmRlcmVkIEhUTUwgdG8uXG5cdCAqL1xuXHRodG1sOiBzdHJpbmdcblx0LyoqXG5cdCAqIFRoZSBwYXRoIHRvIHdyaXRlIHRoZSByZW5kZXJlZCBIVE1MIHRvLlxuXHQgKiBUaGlzIGlzIG51bGwgKGF1dG9tYXRpY2FsbHkgY2FsY3VsYXRlZCBhZnRlciBwb3N0UHJvY2Vzcylcblx0ICogdW5sZXNzIGV4cGxpY2l0bHkgc2V0LlxuXHQgKi9cblx0b3V0cHV0UGF0aD86IHN0cmluZ1xufVxuXG5leHBvcnQgdHlwZSBJUmVzb2x2YWJsZTxSPiA9IFIgfCBQcm9taXNlTGlrZTxSPjtcblxuZXhwb3J0IGludGVyZmFjZSBJUHJlcmVuZGVyZXJPcHRpb25zXG57XG5cdHN0YXRpY0Rpcj86IHN0cmluZyxcblx0b3V0cHV0RGlyPzogc3RyaW5nLFxuXHRpbmRleFBhdGg/OiBzdHJpbmcsXG5cblx0LyoqXG5cdCAqIFRoZSBwb3N0UHJvY2VzcyhPYmplY3QgY29udGV4dCk6IE9iamVjdCB8IFByb21pc2UgZnVuY3Rpb24gaW4geW91ciByZW5kZXJlciBjb25maWd1cmF0aW9uIGFsbG93cyB5b3UgdG8gYWRqdXN0IHRoZSBvdXRwdXQgb2YgcHJlcmVuZGVyLXNwYS1wbHVnaW4gYmVmb3JlIHdyaXRpbmcgaXQgdG8gYSBmaWxlLlxuXHQgKiBJdCBpcyBjYWxsZWQgb25jZSBwZXIgcmVuZGVyZWQgcm91dGUgYW5kIGlzIHBhc3NlZCBhIGNvbnRleHQgb2JqZWN0IGluIHRoZSBmb3JtIG9mOlxuXHQgKlxuXHQgKiBAcGFyYW0ge0lQb3N0UHJvY2Vzc0NvbnRleHR9IGNvbnRleHRcblx0ICogQHJldHVybnMge0lSZXNvbHZhYmxlPElQb3N0UHJvY2Vzc0NvbnRleHQ+fVxuXHQgKi9cblx0cG9zdFByb2Nlc3M/KGNvbnRleHQ6IElQb3N0UHJvY2Vzc0NvbnRleHQpOiBJUmVzb2x2YWJsZTxJUG9zdFByb2Nlc3NDb250ZXh0PixcblxuXHRzZXJ2ZXI/OiB7XG5cdFx0LyoqXG5cdFx0ICogVGhlIHBvcnQgZm9yIHRoZSBhcHAgc2VydmVyIHRvIHJ1biBvbi5cblx0XHQgKi9cblx0XHRwb3J0PzogbnVtYmVyLFxuXHRcdC8qKlxuXHRcdCAqIFByb3h5IGNvbmZpZ3VyYXRpb24uIEhhcyB0aGUgc2FtZSBzaWduYXR1cmUgYXMgd2VicGFjay1kZXYtc2VydmVyXG5cdFx0ICovXG5cdFx0cHJveHk/OiBvYmplY3QsXG5cdH0sXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVJlc3VsdFxue1xuXHRvcmlnaW5hbFJvdXRlOiBzdHJpbmcsXG5cdHJvdXRlOiBzdHJpbmcsXG5cdGh0bWw6IHN0cmluZyxcbn1cblxuZXhwb3J0IGRlZmF1bHQgSlNET01SZW5kZXJlclxuIl19
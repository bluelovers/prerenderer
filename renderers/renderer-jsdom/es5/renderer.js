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
Object.defineProperty(exports, "__esModule", { value: true });
var jsdom_1 = require("jsdom");
var bluebird_1 = __importDefault(require("bluebird"));
var JSDOMRenderer = /** @class */ (function () {
    function JSDOMRenderer(rendererOptions) {
        this._rendererOptions = {};
        Object.assign(this._rendererOptions, rendererOptions);
        if (this._rendererOptions.maxConcurrentRoutes == null)
            this._rendererOptions.maxConcurrentRoutes = 0;
        if (this._rendererOptions.inject && !this._rendererOptions.injectProperty) {
            this._rendererOptions.injectProperty = '__PRERENDER_INJECTED';
        }
    }
    JSDOMRenderer.prototype.initialize = function () {
        // NOOP
        return bluebird_1.default.resolve();
    };
    JSDOMRenderer.prototype.renderRoutes = function (routes, Prerenderer) {
        var _this = this;
        var rootOptions = Prerenderer.getOptions();
        var self = this;
        return bluebird_1.default
            .resolve(routes)
            .bind(self)
            .map(function (route) {
            return new bluebird_1.default(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                var jsdom, window;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, jsdom_1.JSDOM.fromURL("http://127.0.0.1:" + rootOptions.server.port + route, {
                                resources: 'usable',
                                runScripts: 'dangerously',
                            })];
                        case 1:
                            jsdom = _a.sent();
                            window = jsdom.window;
                            if (self._rendererOptions.inject) {
                                window[self._rendererOptions.injectProperty] = self._rendererOptions.inject;
                            }
                            window.addEventListener('error', function (event) {
                                console.error(event.error);
                            });
                            return [2 /*return*/, getPageContents(jsdom, self._rendererOptions, route)];
                    }
                });
            }); });
        })
            .tapCatch(function (e) {
            console.error(e);
        });
    };
    JSDOMRenderer.prototype.destroy = function () {
        // NOOP
    };
    return JSDOMRenderer;
}());
exports.JSDOMRenderer = JSDOMRenderer;
function getPageContents(jsdom, options, originalRoute) {
    options = options || {};
    var window = jsdom.window;
    var document = window.document;
    return new bluebird_1.default(function (resolve, reject) {
        var int;
        function captureDocument() {
            return __awaiter(this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(options.renderAfterDelay > 0)) return [3 /*break*/, 2];
                            return [4 /*yield*/, bluebird_1.default.delay(options.renderAfterDelay | 0)];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            result = {
                                originalRoute: originalRoute,
                                route: originalRoute,
                                html: jsdom.serialize(),
                            };
                            if (int != null) {
                                clearInterval(int);
                            }
                            window.close();
                            return [2 /*return*/, result];
                    }
                });
            });
        }
        var bool;
        // CAPTURE WHEN AN EVENT FIRES ON THE DOCUMENT
        if (options.renderAfterDocumentEvent) {
            bool = true;
            document.addEventListener(options.renderAfterDocumentEvent, function () { return resolve(captureDocument()); });
            // CAPTURE ONCE A SPECIFC ELEMENT EXISTS
        }
        if (options.renderAfterElementExists) {
            bool = true;
            // @ts-ignore
            int = setInterval(function () {
                if (document.querySelector(options.renderAfterElementExists))
                    resolve(captureDocument());
            }, 100);
            // CAPTURE AFTER A NUMBER OF MILLISECONDS
        }
        if (bool) {
            setTimeout(function () { return resolve(captureDocument()); }, (options.renderAfterTimeMax | 0) || 30000);
        }
        else if (options.renderAfterTime) {
            setTimeout(function () { return resolve(captureDocument()); }, options.renderAfterTime);
            // DEFAULT: RUN IMMEDIATELY
        }
        else {
            resolve(captureDocument());
        }
    });
}
exports.getPageContents = getPageContents;
exports.default = JSDOMRenderer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtCQUF3QztBQUN4QyxzREFBK0I7QUFnRC9CO0lBSUMsdUJBQVksZUFBc0M7UUFGeEMscUJBQWdCLEdBQTBCLEVBQUUsQ0FBQztRQUl0RCxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUV0RCxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsSUFBSSxJQUFJO1lBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQztRQUVyRyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUN6RTtZQUNDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLEdBQUcsc0JBQXNCLENBQUE7U0FDN0Q7SUFDRixDQUFDO0lBRUQsa0NBQVUsR0FBVjtRQUVDLE9BQU87UUFDUCxPQUFPLGtCQUFRLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDMUIsQ0FBQztJQUVELG9DQUFZLEdBQVosVUFBYSxNQUFlLEVBQUUsV0FFN0I7UUFGRCxpQkF3Q0M7UUFwQ0EsSUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBRTdDLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQztRQUVsQixPQUFPLGtCQUFRO2FBQ2IsT0FBTyxDQUFDLE1BQU0sQ0FBQzthQUNmLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDVixHQUFHLENBQUMsVUFBQyxLQUFLO1lBRVgsT0FBTyxJQUFJLGtCQUFRLENBQVUsVUFBTyxPQUFPLEVBQUUsTUFBTTs7OztnQ0FFcEMscUJBQU0sYUFBSyxDQUFDLE9BQU8s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TSxPQUFBLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUExQixDQUEwQixFQUFFLENBQUMsT0FBTyxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFBO1NBQ3ZGO2FBQ0ksSUFBSSxPQUFPLENBQUMsZUFBZSxFQUNoQztZQUNDLFVBQVUsQ0FBQyxjQUFNLE9BQUEsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDLEVBQTFCLENBQTBCLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFBO1lBRXJFLDJCQUEyQjtTQUMzQjthQUVEO1lBQ0MsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUE7U0FDMUI7SUFDRixDQUFDLENBQUMsQ0FBQTtBQUNILENBQUM7QUF6RUQsMENBeUVDO0FBRUQsa0JBQWUsYUFBYSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRE9NV2luZG93LCBKU0RPTSB9IGZyb20gJ2pzZG9tJ1xuaW1wb3J0IEJsdWViaXJkIGZyb20gJ2JsdWViaXJkJ1xuXG5leHBvcnQgaW50ZXJmYWNlIElKU0RPTVJlbmRlcmVyT3B0aW9uc1xue1xuXHQvKipcblx0ICogMCAoTm8gbGltaXQpXG5cdCAqXG5cdCAqIFRoZSBudW1iZXIgb2Ygcm91dGVzIGFsbG93ZWQgdG8gYmUgcmVuZGVyZWQgYXQgdGhlIHNhbWUgdGltZS4gVXNlZnVsIGZvciBicmVha2luZyBkb3duIG1hc3NpdmUgYmF0Y2hlcyBvZiByb3V0ZXMgaW50byBzbWFsbGVyIGNodW5rcy5cblx0ICovXG5cdG1heENvbmN1cnJlbnRSb3V0ZXM/OiBudW1iZXIsXG5cdC8qKlxuXHQgKiBBbiBvYmplY3QgdG8gaW5qZWN0IGludG8gdGhlIGdsb2JhbCBzY29wZSBvZiB0aGUgcmVuZGVyZWQgcGFnZSBiZWZvcmUgaXQgZmluaXNoZXMgbG9hZGluZy4gTXVzdCBiZSBKU09OLnN0cmluZ2lmaXktYWJsZS4gVGhlIHByb3BlcnR5IGluamVjdGVkIHRvIGlzIHdpbmRvd1snX19QUkVSRU5ERVJfSU5KRUNURUQnXSBieSBkZWZhdWx0LlxuXHQgKi9cblx0aW5qZWN0Pzogb2JqZWN0LFxuXHQvKipcblx0ICogVGhlIHByb3BlcnR5IHRvIG1vdW50IGluamVjdCB0byBkdXJpbmcgcmVuZGVyaW5nLlxuXHQgKi9cblx0aW5qZWN0UHJvcGVydHk/OiBzdHJpbmcsXG5cdC8qKlxuXHQgKiBXYWl0IHRvIHJlbmRlciB1bnRpbCB0aGUgc3BlY2lmaWVkIGV2ZW50IGlzIGZpcmVkIG9uIHRoZSBkb2N1bWVudC4gKFlvdSBjYW4gZmlyZSBhbiBldmVudCBsaWtlIHNvOiBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgnY3VzdG9tLXJlbmRlci10cmlnZ2VyJykpXG5cdCAqL1xuXHRyZW5kZXJBZnRlckRvY3VtZW50RXZlbnQ/OiBzdHJpbmcsXG5cdC8qKlxuXHQgKiAoU2VsZWN0b3IpXG5cdCAqXG5cdCAqIFdhaXQgdG8gcmVuZGVyIHVudGlsIHRoZSBzcGVjaWZpZWQgZWxlbWVudCBpcyBkZXRlY3RlZCB1c2luZyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yXG5cdCAqL1xuXHRyZW5kZXJBZnRlckVsZW1lbnRFeGlzdHM/OiBzdHJpbmcsXG5cdC8qKlxuXHQgKiAoTWlsbGlzZWNvbmRzKVxuXHQgKlxuXHQgKiBXYWl0IHRvIHJlbmRlciB1bnRpbCBhIGNlcnRhaW4gYW1vdW50IG9mIHRpbWUgaGFzIHBhc3NlZC5cblx0ICovXG5cdHJlbmRlckFmdGVyVGltZT86IG51bWJlcixcblxuXHQvKipcblx0ICogdGhlIG1heCB0aW1lb3V0XG5cdCAqL1xuXHRyZW5kZXJBZnRlclRpbWVNYXg/OiBudW1iZXIsXG5cblx0LyoqXG5cdCAqIGRlbGF5IGFmdGVyIHJlbmRlckFmdGVyRG9jdW1lbnRFdmVudCByZW5kZXJBZnRlckVsZW1lbnRFeGlzdHNcblx0ICovXG5cdHJlbmRlckFmdGVyRGVsYXk/OiBudW1iZXIsXG59XG5cbmV4cG9ydCB0eXBlIElSb3V0ZXMgPSBzdHJpbmdbXTtcblxuZXhwb3J0IGNsYXNzIEpTRE9NUmVuZGVyZXJcbntcblx0cHJvdGVjdGVkIF9yZW5kZXJlck9wdGlvbnM6IElKU0RPTVJlbmRlcmVyT3B0aW9ucyA9IHt9O1xuXG5cdGNvbnN0cnVjdG9yKHJlbmRlcmVyT3B0aW9uczogSUpTRE9NUmVuZGVyZXJPcHRpb25zKVxuXHR7XG5cdFx0T2JqZWN0LmFzc2lnbih0aGlzLl9yZW5kZXJlck9wdGlvbnMsIHJlbmRlcmVyT3B0aW9ucyk7XG5cblx0XHRpZiAodGhpcy5fcmVuZGVyZXJPcHRpb25zLm1heENvbmN1cnJlbnRSb3V0ZXMgPT0gbnVsbCkgdGhpcy5fcmVuZGVyZXJPcHRpb25zLm1heENvbmN1cnJlbnRSb3V0ZXMgPSAwO1xuXG5cdFx0aWYgKHRoaXMuX3JlbmRlcmVyT3B0aW9ucy5pbmplY3QgJiYgIXRoaXMuX3JlbmRlcmVyT3B0aW9ucy5pbmplY3RQcm9wZXJ0eSlcblx0XHR7XG5cdFx0XHR0aGlzLl9yZW5kZXJlck9wdGlvbnMuaW5qZWN0UHJvcGVydHkgPSAnX19QUkVSRU5ERVJfSU5KRUNURUQnXG5cdFx0fVxuXHR9XG5cblx0aW5pdGlhbGl6ZSgpXG5cdHtcblx0XHQvLyBOT09QXG5cdFx0cmV0dXJuIEJsdWViaXJkLnJlc29sdmUoKVxuXHR9XG5cblx0cmVuZGVyUm91dGVzKHJvdXRlczogSVJvdXRlcywgUHJlcmVuZGVyZXI6IHtcblx0XHRnZXRPcHRpb25zKCk6IElQcmVyZW5kZXJlck9wdGlvbnNcblx0fSk6IEJsdWViaXJkPElSZXN1bHRbXT5cblx0e1xuXHRcdGNvbnN0IHJvb3RPcHRpb25zID0gUHJlcmVuZGVyZXIuZ2V0T3B0aW9ucygpO1xuXG5cdFx0Y29uc3Qgc2VsZiA9IHRoaXM7XG5cblx0XHRyZXR1cm4gQmx1ZWJpcmRcblx0XHRcdC5yZXNvbHZlKHJvdXRlcylcblx0XHRcdC5iaW5kKHNlbGYpXG5cdFx0XHQubWFwKChyb3V0ZSkgPT5cblx0XHR7XG5cdFx0XHRyZXR1cm4gbmV3IEJsdWViaXJkPElSZXN1bHQ+KGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGNvbnN0IGpzZG9tID0gYXdhaXQgSlNET00uZnJvbVVSTChgaHR0cDovLzEyNy4wLjAuMToke3Jvb3RPcHRpb25zLnNlcnZlci5wb3J0fSR7cm91dGV9YCwge1xuXHRcdFx0XHRcdHJlc291cmNlczogJ3VzYWJsZScsXG5cdFx0XHRcdFx0cnVuU2NyaXB0czogJ2Rhbmdlcm91c2x5Jyxcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Y29uc3QgeyB3aW5kb3cgfSA9IGpzZG9tO1xuXG5cdFx0XHRcdGlmIChzZWxmLl9yZW5kZXJlck9wdGlvbnMuaW5qZWN0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0d2luZG93W3NlbGYuX3JlbmRlcmVyT3B0aW9ucy5pbmplY3RQcm9wZXJ0eV0gPSBzZWxmLl9yZW5kZXJlck9wdGlvbnMuaW5qZWN0XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbiAoZXZlbnQpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGV2ZW50LmVycm9yKVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRyZXR1cm4gZ2V0UGFnZUNvbnRlbnRzKGpzZG9tLCBzZWxmLl9yZW5kZXJlck9wdGlvbnMsIHJvdXRlKVxuXHRcdFx0fSlcblx0XHR9KVxuXHRcdFx0LnRhcENhdGNoKGUgPT5cblx0XHRcdHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcihlKVxuXHRcdFx0fSlcblx0XHQ7XG5cdH1cblxuXHRkZXN0cm95KClcblx0e1xuXHRcdC8vIE5PT1Bcblx0fVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElQb3N0UHJvY2Vzc0NvbnRleHRcbntcblx0LyoqXG5cdCAqIFRoZSBwcmVyZW5kZXJlZCByb3V0ZSwgYWZ0ZXIgZm9sbG93aW5nIHJlZGlyZWN0cy5cblx0ICovXG5cdHJvdXRlOiBzdHJpbmdcblx0LyoqXG5cdCAqIFRoZSBvcmlnaW5hbCByb3V0ZSBwYXNzZWQsIGJlZm9yZSByZWRpcmVjdHMuXG5cdCAqL1xuXHRvcmlnaW5hbFJvdXRlOiBzdHJpbmdcblx0LyoqXG5cdCAqIFRoZSBwYXRoIHRvIHdyaXRlIHRoZSByZW5kZXJlZCBIVE1MIHRvLlxuXHQgKi9cblx0aHRtbDogc3RyaW5nXG5cdC8qKlxuXHQgKiBUaGUgcGF0aCB0byB3cml0ZSB0aGUgcmVuZGVyZWQgSFRNTCB0by5cblx0ICogVGhpcyBpcyBudWxsIChhdXRvbWF0aWNhbGx5IGNhbGN1bGF0ZWQgYWZ0ZXIgcG9zdFByb2Nlc3MpXG5cdCAqIHVubGVzcyBleHBsaWNpdGx5IHNldC5cblx0ICovXG5cdG91dHB1dFBhdGg/OiBzdHJpbmdcbn1cblxuZXhwb3J0IHR5cGUgSVJlc29sdmFibGU8Uj4gPSBSIHwgUHJvbWlzZUxpa2U8Uj47XG5cbmV4cG9ydCBpbnRlcmZhY2UgSVByZXJlbmRlcmVyT3B0aW9uc1xue1xuXHRzdGF0aWNEaXI/OiBzdHJpbmcsXG5cdG91dHB1dERpcj86IHN0cmluZyxcblx0aW5kZXhQYXRoPzogc3RyaW5nLFxuXG5cdC8qKlxuXHQgKiBUaGUgcG9zdFByb2Nlc3MoT2JqZWN0IGNvbnRleHQpOiBPYmplY3QgfCBQcm9taXNlIGZ1bmN0aW9uIGluIHlvdXIgcmVuZGVyZXIgY29uZmlndXJhdGlvbiBhbGxvd3MgeW91IHRvIGFkanVzdCB0aGUgb3V0cHV0IG9mIHByZXJlbmRlci1zcGEtcGx1Z2luIGJlZm9yZSB3cml0aW5nIGl0IHRvIGEgZmlsZS5cblx0ICogSXQgaXMgY2FsbGVkIG9uY2UgcGVyIHJlbmRlcmVkIHJvdXRlIGFuZCBpcyBwYXNzZWQgYSBjb250ZXh0IG9iamVjdCBpbiB0aGUgZm9ybSBvZjpcblx0ICpcblx0ICogQHBhcmFtIHtJUG9zdFByb2Nlc3NDb250ZXh0fSBjb250ZXh0XG5cdCAqIEByZXR1cm5zIHtJUmVzb2x2YWJsZTxJUG9zdFByb2Nlc3NDb250ZXh0Pn1cblx0ICovXG5cdHBvc3RQcm9jZXNzPyhjb250ZXh0OiBJUG9zdFByb2Nlc3NDb250ZXh0KTogSVJlc29sdmFibGU8SVBvc3RQcm9jZXNzQ29udGV4dD4sXG5cblx0c2VydmVyPzoge1xuXHRcdC8qKlxuXHRcdCAqIFRoZSBwb3J0IGZvciB0aGUgYXBwIHNlcnZlciB0byBydW4gb24uXG5cdFx0ICovXG5cdFx0cG9ydD86IG51bWJlcixcblx0XHQvKipcblx0XHQgKiBQcm94eSBjb25maWd1cmF0aW9uLiBIYXMgdGhlIHNhbWUgc2lnbmF0dXJlIGFzIHdlYnBhY2stZGV2LXNlcnZlclxuXHRcdCAqL1xuXHRcdHByb3h5Pzogb2JqZWN0LFxuXHR9LFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIElSZXN1bHRcbntcblx0b3JpZ2luYWxSb3V0ZTogc3RyaW5nLFxuXHRyb3V0ZTogc3RyaW5nLFxuXHRodG1sOiBzdHJpbmcsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQYWdlQ29udGVudHMoanNkb206IEpTRE9NLCBvcHRpb25zOiBJSlNET01SZW5kZXJlck9wdGlvbnMsIG9yaWdpbmFsUm91dGU6IHN0cmluZyk6IEJsdWViaXJkPElSZXN1bHQ+XG57XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdGNvbnN0IHsgd2luZG93IH0gPSBqc2RvbTtcblx0Y29uc3QgeyBkb2N1bWVudCB9ID0gd2luZG93O1xuXG5cdHJldHVybiBuZXcgQmx1ZWJpcmQ8SVJlc3VsdD4oKHJlc29sdmUsIHJlamVjdCkgPT5cblx0e1xuXHRcdGxldCBpbnQ6IG51bWJlcjtcblxuXHRcdGFzeW5jIGZ1bmN0aW9uIGNhcHR1cmVEb2N1bWVudCgpXG5cdFx0e1xuXHRcdFx0aWYgKG9wdGlvbnMucmVuZGVyQWZ0ZXJEZWxheSA+IDApXG5cdFx0XHR7XG5cdFx0XHRcdGF3YWl0IEJsdWViaXJkLmRlbGF5KG9wdGlvbnMucmVuZGVyQWZ0ZXJEZWxheSB8IDApXG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IHJlc3VsdDogSVJlc3VsdCA9IHtcblx0XHRcdFx0b3JpZ2luYWxSb3V0ZTogb3JpZ2luYWxSb3V0ZSxcblx0XHRcdFx0cm91dGU6IG9yaWdpbmFsUm91dGUsXG5cdFx0XHRcdGh0bWw6IGpzZG9tLnNlcmlhbGl6ZSgpLFxuXHRcdFx0fTtcblxuXHRcdFx0aWYgKGludCAhPSBudWxsKVxuXHRcdFx0e1xuXHRcdFx0XHRjbGVhckludGVydmFsKGludClcblx0XHRcdH1cblxuXHRcdFx0d2luZG93LmNsb3NlKCk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0XG5cdFx0fVxuXG5cdFx0bGV0IGJvb2w6IGJvb2xlYW47XG5cblx0XHQvLyBDQVBUVVJFIFdIRU4gQU4gRVZFTlQgRklSRVMgT04gVEhFIERPQ1VNRU5UXG5cdFx0aWYgKG9wdGlvbnMucmVuZGVyQWZ0ZXJEb2N1bWVudEV2ZW50KVxuXHRcdHtcblx0XHRcdGJvb2wgPSB0cnVlO1xuXG5cdFx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKG9wdGlvbnMucmVuZGVyQWZ0ZXJEb2N1bWVudEV2ZW50LCAoKSA9PiByZXNvbHZlKGNhcHR1cmVEb2N1bWVudCgpKSlcblxuXHRcdFx0Ly8gQ0FQVFVSRSBPTkNFIEEgU1BFQ0lGQyBFTEVNRU5UIEVYSVNUU1xuXHRcdH1cblxuXHRcdGlmIChvcHRpb25zLnJlbmRlckFmdGVyRWxlbWVudEV4aXN0cylcblx0XHR7XG5cdFx0XHRib29sID0gdHJ1ZTtcblxuXHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0aW50ID0gc2V0SW50ZXJ2YWwoKCkgPT5cblx0XHRcdHtcblx0XHRcdFx0aWYgKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iob3B0aW9ucy5yZW5kZXJBZnRlckVsZW1lbnRFeGlzdHMpKSByZXNvbHZlKGNhcHR1cmVEb2N1bWVudCgpKVxuXHRcdFx0fSwgMTAwKVxuXG5cdFx0XHQvLyBDQVBUVVJFIEFGVEVSIEEgTlVNQkVSIE9GIE1JTExJU0VDT05EU1xuXHRcdH1cblxuXHRcdGlmIChib29sKVxuXHRcdHtcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4gcmVzb2x2ZShjYXB0dXJlRG9jdW1lbnQoKSksIChvcHRpb25zLnJlbmRlckFmdGVyVGltZU1heCB8IDApIHx8IDMwMDAwKVxuXHRcdH1cblx0XHRlbHNlIGlmIChvcHRpb25zLnJlbmRlckFmdGVyVGltZSlcblx0XHR7XG5cdFx0XHRzZXRUaW1lb3V0KCgpID0+IHJlc29sdmUoY2FwdHVyZURvY3VtZW50KCkpLCBvcHRpb25zLnJlbmRlckFmdGVyVGltZSlcblxuXHRcdFx0Ly8gREVGQVVMVDogUlVOIElNTUVESUFURUxZXG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRyZXNvbHZlKGNhcHR1cmVEb2N1bWVudCgpKVxuXHRcdH1cblx0fSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgSlNET01SZW5kZXJlclxuIl19
/**
 * @file Just a super-simple wrapper for determining whether to load the original ES6 version
 * of the code or the ES5 version at runtime.
 * @author Joshua Bemenderfer <tribex10@gmail.com>
 */

// Is there a better way to check versions? Haven't really looked into it.
if (+process.versions.node.split('.')[0] >= 8)
{
	// Native (Node 8+) ES6. (Requires async / await.)
	module.exports = require('./es6/renderer').default
}
else
{
	// Transpiled through babel to target Node 4+.
	module.exports = require('./es5/renderer').default
}

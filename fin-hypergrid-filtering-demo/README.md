# fin-hypergrid-filtering-demo

This fork of [fin-hypergrid-browserify-template](https://github.com/openfin/fin-hypergrid-browserify-template) includes sample code for filtering.

### Features

In addition to individual column filters, this filter plug-in can also filter on arbitrarily complex filter expressions involving multiple columns.

\[This section needs expansion.]

### Node Version
`> 5.1.0`

### Try it out

```bash
npm install
gulp
open index.html
```

### What happened?

The above series of commands **downloads, builds, and runs** the demo:
* `git clone ...` downloads the demo
* `sh build.sh` is a simple shell script that creates the build file:
   * install [Browserify](https://www.npmjs.com/package/browserify) globally — but only if not already available
   * install external dependencies (just [Hypergrid](https://www.npmjs.com/package/fin-hypergrid) in this case) — but ony if not already installed
   * create `./build` directory — but only if not already there
   * run Browserify to create a single bundled file (`./build/index.js`) from:
     * `./index.js` - main entry point
     * `fin-hypergrid` npm module
     * `src/datasources` - data transformers for filtering
     * `src/hypersorter` - plug-in API for filtering
* `open index.html` runs the demo page
  * uses the `file://` protocol (no server needed)
  * requests the bundled file (`build/index.js`) via a `<script>` tag

### Recommendations

For actual development iterations, we suggest replacing the shell script with a build file, such as [fin-hypergrid-browserify-template/gulpfile.js](https://github.com/openfin/fin-hypergrid-browserify-template/blob/master/gulpfile.js). To further enhance with a watcher (to rebuild and reload), linter, and minifier, see for example [fin-hypergrid/gulpfile.js](https://github.com/openfin/fin-hypergrid/blob/master/gulpfile.js).
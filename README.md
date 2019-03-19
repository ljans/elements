# Luniverse Elements

A [template processor](https://en.wikipedia.org/wiki/Template_processor) written in [ECMAScript 2017](https://www.ecma-international.org/ecma-262/8.0/index.html). Learn more in the [**Wiki**][wiki].

For a working example see the contents of [example](example).


## Getting started

Import `elements.min.js` into your project. This can be done using a `script` tag in your documents `head`.

```html
<script src="elements.min.js"></script>
```

Note that rendering templates can be especially useful in a [ServiceWorker](https://developers.google.com/web/fundamentals/primers/service-workers/). Import the script there using `importScripts`:

```javascript
self.importScripts('elements.min.js');
```

Now you are ready to make use of the renderer. Head over to the [**Wiki**][wiki] for a complete documentation.


## Links
* Licensed under the [MIT License](LICENSE)
* See also the [PHP implementation](https://github.com/luniverse/elements-php)
* Inspired by [mustache](https://mustache.github.io/)

[wiki]: https://github.com/luniverse/elements/wiki

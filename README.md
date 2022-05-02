**Deprecation note:** Elements has evolved &ndash; check out the [Colony](https://github.com/ljans/colony) processor for even simpler templates!

# Elements
A template processor written in JavaScript. For a showcase see the contents of [example](example). Learn more in the [Wiki][wiki].

### Getting started
Import [`elements.min.js`](elements.min.js) into your project. This can be done using a `<script>` tag in your documents `<head>`:
```html
<script src="elements.min.js"></script>
```
Note that rendering templates can be especially useful in a [ServiceWorker](https://developers.google.com/web/fundamentals/primers/service-workers/). Import the script there using:
```javascript
self.importScripts('elements.min.js');
```
Now you are ready to make use of the renderer. Head over to the [Wiki][wiki] for a complete documentation.

### Links
* Licensed under the [MIT License](LICENSE)
* See also the [PHP port](https://gist.github.com/ljans/0efe9aff7c0a434d5f9e04a36c52e7ad)
* Inspired by [mustache](https://mustache.github.io/)

[wiki]: https://github.com/ljans/elements/wiki

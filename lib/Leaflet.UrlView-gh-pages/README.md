Leaflet.UrlView
==========
## Description
A simple plugin for [Leaflet](http://leafletjs.com) to dynamically update the current view in the url using `history.replaceState`.

## Requirements
- Leaflet 1.0.0-b1 (or later)

## Example
See the [example](http://cmulders.github.io/Leaflet.UrlView/examples/example.html)

## Compatibility
Most major browsers (IE10+). [Can I Use?](http://caniuse.com/#feat=history)

## Usage
Just include the `Map.UrlView.js` file from the `src/` dir in your page and set the `urlView` option of the map:
```js
var map = L.map('map', {
    center: [51.505, -0.09],
    zoom: 13,
    urlView: true
});

//If no view was set via the URL, initiated a default view
if (!map.options.urlView || !map.urlView.viewLoaded()) {
    map.fitWorld();
}
```

## API
This plugin extends `L.Handler` and those methods are also available
### L.Map
Leaflet.UrlView adds options and events to the `L.Map` object.
#### Options
Option     | Type    | Default      | Description
---------- | ------- | ------------ | ---
urlView    | Boolean | `false`      | Whether to initiate the movement tracking and storing in the URL
#### Methods
Method     | Returns | Description
---------- | ---     | ---
viewLoaded | Boolean | Whether the url contained a view (center & zoom) that has been set.

### L.Util
Adds one method to the Leaflet utility library

Method                                    | Returns   | Description
----------------------------------------- | ---       | ---
parseParamString( \<string> searchUrl)    | `Object`  | Converts an a parameter URL string to an object, e.g. '?a=foo&b=bar' translates to {a: "foo", b: "bar"}.

## License
This software is released under the [MIT licence](http://www.opensource.org/licenses/mit-license.php).

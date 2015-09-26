/*
 * L.Util extra's for custom use
 */

// Parses ?key=value&key=value
L.Util.parseParamString = function (searchUrl) {
    if(searchUrl[0] != "?") return {};

    var parsedParams = {};
    
    searchUrl.substring(1).split('&').forEach(function(paramPair) {
        var splitPair = decodeURIComponent(paramPair).split("=");
        parsedParams[splitPair[0].trim()] = splitPair[1] ? splitPair[1].trim() : true;
    })
    return parsedParams;
}
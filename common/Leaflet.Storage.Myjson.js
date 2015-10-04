L.Storage = L.Storage || {}
L.Storage.Myjson = L.Class.extend({
    options: {
        exportUrl: 'https://api.myjson.com/bins',
        importUrl: 'https://api.myjson.com/bins/{id}'
    },
    
    initialize: function (options) {
		L.setOptions(this, options);
	},

    load: function(myjsonID, callback) {
        var xmlhttp = new XMLHttpRequest(),
            importUrl = L.Util.template(this.options.importUrl, {id:myjsonID})
            
        xmlhttp.open("GET", importUrl, true)
        
        //status 200, parse geoJson
        L.DomEvent.on(xmlhttp, 'readystatechange', function(e) {
            if (xmlhttp.readyState == 4 && 200) {
                callback(JSON.parse(xmlhttp.responseText))
            }else if(xmlhttp.readyState == 4) {
                console.warn('No results..', this);
                return false;
            }
        }, this)
        
        xmlhttp.send()
    },
    
    save: function(layer, callback) {
        if(!layer || !layer.toGeoJSON) { 
            return;
        }
        
        var xmlhttp = new XMLHttpRequest()
        xmlhttp.open("POST", this.options.exportUrl, true)
        xmlhttp.setRequestHeader("Content-type","application/json; charset=utf-8")
        
        //status 201, parse .uri
        L.DomEvent.on(xmlhttp, 'readystatechange', function(e) {
            if (xmlhttp.readyState == 4 && 201) {
                var url = JSON.parse(xmlhttp.responseText).uri
                var storageID = url.split('/').slice(-1)[0]
                callback(storageID)
            }else if(xmlhttp.readyState == 4) {
                console.warn('No results..', this);
                return false;
            }
        }, this)
        
        xmlhttp.send(JSON.stringify(layer.toGeoJSON()))
    }    
})

L.storage = L.storage || {}
L.storage.myjson = function (options) {
	return new L.Storage.Myjson(options);
};
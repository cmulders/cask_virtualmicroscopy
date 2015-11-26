L.Marker.Label = L.Marker.extend({
    
    options: {
        icon: new L.DivIcon({
            className: 'leaflet-div-label',
            iconAnchor: [0,0],
            iconSize: [0,0],
        }),
        keyboard: false,
        interactive: true,
        draggable: false,   
    },
    
    setContent: function(content) {
        this._content = content;
        
        if(this._map)
    		this.update();
		
		return this;
    },
    
    update: function(e) {
        this._updateContent();
        this._updateSize();
        
        L.Marker.prototype.update.call(this);
        
        return this;
    },
    
    _updateContent: function() {
		if (!this.getElement()) { return; }

		var node = this.getElement();
		var content = this._content || 'Placeholder';
        
        //If we have feature property editing
        if(this.setProperties) {
            this.setProperties({content: content})
        }
        
		if (typeof content === 'string') {
			node.innerHTML = content;
		} else {
			while (node.hasChildNodes()) {
				node.removeChild(node.firstChild);
			}
			node.appendChild(content);
		}
		this.fire('contentupdate');      
    },
    
    _updateSize: function() {
        var icon = this.getElement(),
            sizeFactor = 1/this._map.getZoomScale(4),
            sizeFactorLimited = Math.min(Math.max(sizeFactor, 0.5), 1);

        icon.style.fontSize = sizeFactorLimited * 32 + "px"
        
        var newSize = L.point(icon.scrollWidth, icon.scrollHeight),
            halfSize = newSize.divideBy(2)

        
        icon.style.marginLeft = (-halfSize.x) + "px"
        icon.style.marginTop  = (-halfSize.y) + "px"
        
        this.offsetAnchor = L.point(0, -halfSize.y);
    },
    
    _getPopupAnchor: function() {
      return this.offsetAnchor || L.point(0,0);
    },
    
    showLabelEditor: function(autoOpen) {
        var popupOptions = {
          closeOnClick: !L.Browser.touch //Touch interface friendly
        };
        
        this.bindPopup(L.Util.bind(this._popupContent,this), popupOptions)
        if(autoOpen) {
            this.openPopup()
        }
        this.once('popupclose', this.unbindPopup)
    },
    
    _popupContent: function() {
        var currentLabel = this.getElement().innerHTML.replace(/<br\s?\/?>/g,"\n");
        
        var input = L.DomUtil.create('textarea', 'leaflet-label-input', false)

        input.value = currentLabel;

        L.DomEvent.on(input, 'keyup', L.bind(function(e) { 
            this.setContent(e.target.value.replace(/\r\n|\r|\n/g,"<br />"))
        }, this));
        
        return input;
    }
})

L.marker.label = function(latlng, options) {
    return new L.Marker.Label(latlng, options)
}
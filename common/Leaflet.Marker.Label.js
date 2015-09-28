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
        
    }
})

L.marker.label = function(latlng, options) {
    return new L.Marker.Label(latlng, options)
}
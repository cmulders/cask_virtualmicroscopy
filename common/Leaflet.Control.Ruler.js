L.Handler.Ruler = L.Handler.extend({
    options: {
        
        rulerStyle: {dashArray: '5,10'}, //For L.PolyLine styles
		
		popupOptions: {
		    closeOnClick: false, 
		    autoClose: false,
		    autoPan: false, 
		    className: 'leaflet-popup leaflet-control-ruler-popup',
		    overlapsClass: 'leaflet-control-ruler-overlaps',
		    decimals: 2
		},
		
		editTools: L.Editable,
		editOptions: {drawingCSSClass: 'leaflet-control-ruler'}
		
	},
	
	initialize: function(map, options) {
	    L.setOptions(this, options);
	    
	    L.Handler.prototype.initialize.call(this, map)
	    
        //Force disable skipMiddleMarkers
        var editOptions = L.Util.extend(this.options.editOptions, {skipMiddleMarkers: true})
	    this._editTools = new this.options.editTools(this._map, editOptions)
	},
	
    addHooks: function() {
        
        //Initiate ruler layer and edit controls
        this._rulerLine = this._editTools.startPolyline();
        
        //Set the line style
        this._rulerLine.setStyle(L.Util.extend({dashArray: '5,10', weight: 3}, this.options.rulerStyle))
        
        //Events for adding points, dragging the vertex 
        // and when the popup with the distance is closed
        this._rulerLine.on('editable:drawing:clicked', this._onMarkerAdded, this)
        this._rulerLine.on('editable:vertex:drag', this._onDrawingMoved, this)
        this._rulerLine.on('popupclose', this._onPopupClosed, this)
        this._map.on('moveend', this._updatePopupTransparancy, this)
    },

    removeHooks: function()
    {   
        if(this._rulerLine) {
            //Remove events
            this._rulerLine.off('editable:drawing:clicked', this._onMarkerAdded, this)
            this._rulerLine.off('editable:vertex:drag', this._onDrawingMoved, this)    
            this._rulerLine.off('popupclose', this._onPopupClosed, this)
            this._map.off('moveend', this._updatePopupTransparancy, this)            
            
            if(this._rulerLine.getPopup && this._rulerLine.getPopup())
            {
                this._rulerLine.closePopup().unbindPopup()
            }
            this._rulerLine.remove()   
            delete this._rulerLine
        }
    },
    
    _onMarkerAdded: function(e) {
        //When we have two points (= one vertex) stop drawing and show distance
        if(e.layer.getLatLngs().length == 2)
        {
            //Stop our drawing
            e.editTools.commitDrawing()
            
            var popupDistance = this._readableDistance(e.layer.getLatLngs())
            e.layer.bindPopup(popupDistance, this.options.popupOptions)
            e.layer.openPopup()
            
            this._updatePopupTransparancy()
        }
    },
    
    _onDrawingMoved: function(e) {
        
        if(this._popupAnimId) {
            L.Util.cancelAnimFrame(this._popupAnimId)
        }
        this._animId = L.Util.requestAnimFrame(function() {
            var popup = this._rulerLine.getPopup()
            popup.setLatLng(this._rulerLine.getCenter())
            popup.setContent(this._readableDistance(this._rulerLine.getLatLngs()))
            
            this._updatePopupTransparancy()
        }, this);
    },
    
    _updatePopupTransparancy: function () {
        if(!this._rulerLine || !this._rulerLine.getPopup || !this._rulerLine.getPopup()) { return; }
        
        //Calculate popup size for hitbox with any vertices
        var popupElement = this._rulerLine.getPopup().getElement(),
            bounds = this._getPopupBounds(popupElement)
        
        //Check every marker of our ruler
        var noOverlap = this._rulerLine.getLatLngs().every(function(marker) {
            return !bounds.contains(marker) 
        })
        
        if(noOverlap) {
            L.DomUtil.removeClass(popupElement, this.options.popupOptions.overlapsClass)
            L.DomUtil.setOpacity(popupElement, 1);
        } else {
            L.DomUtil.addClass(popupElement, this.options.popupOptions.overlapsClass)
            L.DomUtil.setOpacity(popupElement, 0.6); 
        }
        
    },
    
    _onPopupClosed: function (e) {
        //Removes ruler, but leave popup untouched, to prevent infinite loop
        this.disable()
    },

    _readableDistance: function(latlngs)
    {
        if(latlngs.length == 2)
        {
            var distanceMeters = this._map.distance(latlngs[0],latlngs[1]),
                scaledDistance = {magnitude:distanceMeters, unit:'m'}
                
            if(typeof L.control.scale().humanReadable === 'function') {
                scaledDistance = L.control.scale().humanReadable(distanceMeters)
            }

            var magnitude = scaledDistance.magnitude,
                unit = scaledDistance.unit
                
            //Round our measurement (standard 2 decimals)
            return L.Util.formatNum(magnitude, this.options.popupOptions.decimals || 2) + " " + unit
        }
    },
    
    _getPopupBounds: function (popupElement)
    {
        var popupContent = popupElement.getElementsByClassName('leaflet-popup-content-wrapper')[0],
            popupContentSize = L.point(popupContent.offsetWidth,popupContent.offsetHeight)
        
        var popupOffset = L.point(parseInt(popupElement.style.left), -parseInt(popupElement.style.bottom)-popupElement.offsetHeight),
            leftTop = L.DomUtil.getPosition(popupElement).add(popupOffset),
            rightBottom = leftTop.add(popupContentSize)

        return L.latLngBounds(this._map.layerPointToLatLng(leftTop),this._map.layerPointToLatLng(rightBottom)) 
    }
});


L.Control.Ruler = L.Control.extend({
    options: {
		position: 'topleft',

	},
    
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control-ruler leaflet-control leaflet-bar'),
            link = L.DomUtil.create('a', 'leaflet-control-ruler-measure material-icons', container);

        link.href = '#';
        link.title = 'Measure';
        link.innerHTML = 'straighten';
        L.DomEvent.on(link, 'click', L.DomEvent.stop)
                  .on(link, 'click', this._initRuler, this);
        
        this._rulerHandler = new L.Handler.Ruler(map, this.options)
        
        return container;
    },
    
    onRemove: function(map)
    {
        this._rulerHandler.disable()
        delete this._rulerHandler;
    },
    
    _initRuler: function() {
        if(this._rulerHandler.enabled())
        {
            this._rulerHandler.disable();
        }
        
        this._rulerHandler.enable();
    }
});


L.control.ruler = function (options) {
	return new L.Control.Ruler(options);
};
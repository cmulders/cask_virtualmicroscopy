L.Control.Ruler = L.Control.extend({
    options: {
		position: 'topleft',
		rulerStyle: {dashArray: '5,10'}, //For L.PolyLine styles
		
		popupOptions: {
		    closeOnClick: false, 
		    autoClose: false,
		    autoPan: false, 
		    className: 'leaflet-control-ruler-popup',
		    overlapsClass: 'leaflet-control-ruler-overlaps',
		    decimals: 2
		},
		
		editTools: L.Editable,
		editOptions: {drawingCSSClass: 'leaflet-control-ruler'}
	},
    
    onAdd: function (map) {
        this._editTools = new this.options.editTools(this._map,this.options.editOptions)
        
        var container = L.DomUtil.create('div', 'leaflet-control-ruler leaflet-control leaflet-bar'),
            link = L.DomUtil.create('a', 'leaflet-control-ruler-measure material-icons', container);

        link.href = '#';
        link.title = 'Measure';
        link.innerHTML = 'straighten';
        L.DomEvent.on(link, 'click', L.DomEvent.stop)
                  .on(link, 'click', this._initRuler, this);
        
        return container;
    },
    
    _initRuler: function () {
        //Remove previous ruler if one already existed
        this._destroyRuler()
        
        //Initiate ruler layer and edit controls
        this._rulerLine = this._editTools.startPolyline();
        this._rulerLine.editor.tools.options.skipMiddleMarkers = true
        
        //Set the line style
        this._rulerLine.setStyle(L.extend({dashArray: '5,10', weight: 3},this.options.rulerStyle))
        
        
        //Events for adding points, dragging the vertex 
        // and when the popup with the distance is closed
        this._rulerLine.on('editable:drawing:clicked', this._markerAddedHandler, this)
        this._rulerLine.on('editable:vertex:drag', this._drawingMoved, this)
        this._rulerLine.on('popupclose', this._popupClosed, this)
    },
    
    _markerAddedHandler: function(e) {
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
    
    _drawingMoved: function(e) {
        
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
        //Calculate popup size for hitbox with any vertices
        var popupElement = this._rulerLine.getPopup().getElement(),
            popupContent = popupElement.getElementsByClassName('leaflet-popup-content-wrapper')[0],
            popupContentSize = L.point(popupContent.offsetWidth,popupContent.offsetHeight)
        
        var popupOffset = L.point(parseInt(popupElement.style.left), -parseInt(popupElement.style.bottom)-popupElement.offsetHeight),
            leftTop = L.DomUtil.getPosition(popupElement).add(popupOffset),
            rightBottom = leftTop.add(popupContentSize)

        var bounds = L.latLngBounds(map.layerPointToLatLng(leftTop),map.layerPointToLatLng(rightBottom))
        
        var noOverlap = this._rulerLine.getLatLngs().every(function(marker) {
            return !bounds.contains(marker) 
        })
        
        if(noOverlap) {
            L.DomUtil.removeClass(popupElement, this.options.popupOptions.overlapsClass)
            L.DomUtil.setOpacity(popupElement, 1);
        } else {
            L.DomUtil.addClass(popupElement, this.options.popupOptions.overlapsClass)
            L.DomUtil.setOpacity(popupElement, 0.4); 
        }
        
    },
    
    _popupClosed: function (e) {
        //Removes ruler, but leave popup untouched, to prevent infinite loop
        this._destroyRuler()
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
        } else {
            //User drawn something strange with >2 points, destroy ruler
            // User can initiate new measurement
            this._destroyRuler()
        }
    },
    
    _destroyRuler: function()
    {   
        if(this._rulerLine) {
            //Remove events
            this._rulerLine.off('editable:drawing:clicked', this._markerAddedHandler, this)
            this._rulerLine.off('editable:vertex:drag', this._drawingMoved, this)    
            this._rulerLine.off('popupclose', this._popupClosed, this)
            
            if(this._rulerLine.getPopup())
            {
                this._rulerLine.closePopup().unbindPopup()
            }
            this._rulerLine.remove()   
            delete this._rulerLine
        }
    }
});

L.control.ruler = function (options) {
	return new L.Control.Ruler(options);
};
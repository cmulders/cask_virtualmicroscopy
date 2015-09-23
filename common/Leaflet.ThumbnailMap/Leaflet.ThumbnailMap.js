L.Control.ThumbnailMap = L.Control.extend({

    options: {
        baseClassName: 'leaflet-control-thumbnailmap',
        buttonClass: 'material-icons',
        buttonText: 'call_made',
        
        position: 'bottomright',
        toggleDisplay: false,
        autoToggleDisplay: false,
        width: 150,
        height: 150,
        collapsedWidth: 19,
        collapsedHeight: 19,
        
        aimingRectOptions: {color: "#29ffde", weight: 2, interactive: false},
        
        hideText: 'Hide MiniMap',
        showText: 'Show MiniMap',
    },
    
    //layer is the map layer to be shown in the minimap
    initialize: function (layer, options) {
        options.aimingRectOptions = L.extend(this.options.aimingRectOptions, options.aimingRectOptions)
        L.Util.setOptions(this, options);

        //Make sure the aiming rects are non-clickable
        this.options.aimingRectOptions.interactive = false;

        this._layer = layer;
    },
    
    onAdd: function (map) {
        this._mainMap = map;

        //Creating the container and stopping events from spilling through to the main map.
        this._container = L.DomUtil.create('div', this.options.baseClassName);
        this._container.style.width = this.options.width + 'px';
        this._container.style.height = this.options.height + 'px';
        L.DomEvent.disableClickPropagation(this._container);
        L.DomEvent.disableScrollPropagation(this._container);

        //Create our static map
        this._miniMap = new L.Map(this._container,
        {
            attributionControl: false,
            zoomControl: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            dragging: false,
            crs: this._mainMap.options.crs
        });

        this._miniMap.addLayer(this._layer);

        //Keep a record of this to prevent auto toggling when the user explicitly doesn't want it.
        this._userToggledDisplay = false;
        this._minimized = false;

        if (this.options.toggleDisplay) {
            this._addToggleButton();
        }
        
        this._miniMap.whenReady(L.Util.bind(function () {
            
            this._aimingRect = L.rectangle(this._mainMap.getBounds(), this.options.aimingRectOptions).addTo(this._miniMap);

            //Update rectangle
            this._mainMap.on('move', this._onMainMapMoving, this);
            this._mainMap.on('moveend resize', this._onMainMapMoved, this);

            this._miniMap.on('dblclick', this._onMiniMapClicked, this)
        }, this));

        return this._container;
    },

    addTo: function (map) {
        L.Control.prototype.addTo.call(this, map);
        
        //Initiate our view, try to use the layer.bounds
        if(this._layer.options.bounds) {
            this._miniMap.fitBounds(this._layer.options.bounds)
        } else {
            this._miniMap.fitWorld()
        }

        //Cache bounds
        this._miniMapBounds = this._miniMap.getBounds()
        
        this._setDisplay(true);
        return this;
    },

    onRemove: function (map) {
    
        this._mainMap.off('move', this._onMainMapMoving, this);
        this._mainMap.off('moveend resize', this._onMainMapMoved, this);
        
        this._miniMap.off('click', this._onMiniMapClick, this)

        this._miniMap.remove()
    },

    _addToggleButton: function () {	
        var buttonClasses =  [
            this.options.baseClassName + '-toggle-display ',
            this.options.baseClassName + '-toggle-display-' + this.options.position,
            this.options.buttonClass,
        ]
        this._toggleDisplayButton = this._createButton(this.options.buttonText, 
            this.options.hideText, buttonClasses.join(' '), this._container, this._toggleDisplayButtonClicked, this);
        
        this._toggleDisplayButton.style.width = this.options.collapsedWidth + 1 + 'px';
        this._toggleDisplayButton.style.height = this.options.collapsedHeight + 1 + 'px';
    },

    _createButton: function (html, title, className, container, fn, context) {
        var link = L.DomUtil.create('a', className, container);
        link.innerHTML = html;
        link.href = '#';
        link.title = title;

        L.DomEvent.disableClickPropagation(link);
        L.DomEvent.on(link, 'click', fn, context);

        return link;
    },

    _toggleDisplayButtonClicked: function () {
        this._userToggledDisplay = true;
        if (!this._minimized) {
            this._minimize();
            this._toggleDisplayButton.title = this.options.showText;
        }
        else {
            this._restore();
            this._toggleDisplayButton.title = this.options.hideText;
        }
    },

    _setDisplay: function (minimize) {
        if (minimize != this._minimized) {
            if (!this._minimized) {
                this._minimize();
            }
            else {
                this._restore();
            }
        }
        this._miniMap.invalidateSize(false)
    },

    _minimize: function () {
        // hide the minimap
        if (this.options.toggleDisplay) {
            this._container.style.width = this.options.collapsedWidth + 'px';
            this._container.style.height = this.options.collapsedHeight + 'px';
            this._toggleDisplayButton.className += ' minimized-' + this.options.position;
        }
        else {
            this._container.style.display = 'none';
        }
        
        this._minimized = true;
    },

    _restore: function () {
        if (this.options.toggleDisplay) {
            this._container.style.width = this.options.width + 'px';
            this._container.style.height = this.options.height + 'px';
            this._toggleDisplayButton.className = this._toggleDisplayButton.className
                    .replace('minimized-'  + this.options.position, '');
        }
        else {
            this._container.style.display = 'block';
        }
        
        this._minimized = false;
    },

    _decideMinimized: function () {
        if (this._userToggledDisplay) {
            return this._minimized;
        }
        
        if (this.options.autoToggleDisplay) {
            if (this._mainMap.getBounds().contains(this._miniMapBounds)) {
                return true;
            }
            return false;
        }

        return this._minimized;
    },
    
    _onMainMapMoving: function (e) {
        this._updateRectangle(e)
    },
    
    _onMainMapMoved: function (e) {
        this._setDisplay(this._decideMinimized())
        
        this._updateRectangle(e)
    },
    
    _updateRectangle: function (e) {
        this._aimingRect.setBounds(this._mainMap.getBounds());
    },
    
    _onMiniMapClicked: function (e) {
        this._mainMap.panTo(e.latlng)
    },
});

L.control.thumbnailmap = function (layer, options) {
	return new L.Control.ThumbnailMap(layer, options);
};
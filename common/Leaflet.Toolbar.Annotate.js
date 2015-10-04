var newFeature = L.ToolbarAction.extend({
    options: {
        editTools: L.Editable,
    },
    
    initialize: function(map, options) {
        L.ToolbarAction.prototype.initialize.call(this, options);

        this._map = map;
        this._editTools = this.options.editTools
        
        this._editTools.on('editable:drawing:start', this._onDrawingStart, this)
        this._editTools.on('editable:drawing:cancel', this._onDrawingCancel, this)
        this._editTools.on('editable:drawing:end', this._onDrawingEnd, this)
    },
        
    removeHooks: function() {
        this._editTools.stopDrawing()
        
        if(this._currentFeature) {
            this._currentFeature.editor.disable();
        }
    },
    
    doneAction: function() {
        this._editTools.commitDrawing();
        this.disable()
    },
    
    cancelAction: function() {
        this.disable();
    },

    _onDrawingStart: function(e) {
        this._currentFeature = e.layer
    },
    
    _onDrawingCancel: function(e) {
        e.layer.remove()
    },
    
    _onDrawingEnd: function(e) {
        this.disable()
    }    
});

var newPolygon = newFeature.extend({
    options: {
        toolbarIcon: {
            html: '<i class="material-icons">mode_edit</i>',
            tooltip: 'Annotate a structure',
            className: ''
        },
    
        subToolbar: new (L.Toolbar.extend({}))({
            actions: [DoneAction, CancelAction]
        })
    },

    addHooks: function () {
        this._editTools.startPolygon()
    }
});

var newLabel = newFeature.extend({
    options: {
        toolbarIcon: {
            html: '<i class="material-icons">place</i>',
            tooltip: 'Annotate a structure',
            className: ''
        },
    
        subToolbar: new (L.Toolbar.extend({}))({
            actions: [CancelAction]
        })
    },
        
    addHooks: function () {
        this._editTools.startMarker()
    }   
});

var DoneAllEdit = L.ToolbarAction.extend({
    options: {
        toolbarIcon: {
            html: '<i class="material-icons">done_all</i>',
            tooltip: 'Done all',
        },
    
    },
    
    initialize: function(map, options) {
        L.ToolbarAction.prototype.initialize.call(this, options);
    },
    
    addHooks: function (map) {
        var layers = this.options.editOptions.featuresLayer.getLayers();
        layers.forEach(function(layer) {
            layer.disableEdit()
        })
        
        this.disable()
    },
});

var SimpleFeatureAction = L.ToolbarAction.extend({
    initialize: function(map, options) {
        L.ToolbarAction.prototype.initialize.call(this, options);
        this._map = map;
        this._feature = this.options.feature
    },
    
    removeHooks: function() {
        this.toolbar.remove()
    }
})

var DoneEdit = SimpleFeatureAction.extend({
    options: {
        toolbarIcon: {
            html: '<i class="material-icons">done</i>',
            tooltip: 'Done editing',
        },
    },
    
    addHooks: function () {
        this._feature.disableEdit()
        this.disable()
    },
});

var EditFeature = SimpleFeatureAction.extend({
    options: {
        toolbarIcon: {
            html: '<i class="material-icons">mode_edit</i>',
            tooltip: 'Edit annotation',
        },
    
    },
    
    addHooks: function () {
        this._feature.enableEdit()
        this.disable()
    },
});

var DeleteFeature = SimpleFeatureAction.extend({
    options: {
        toolbarIcon: {
            html: '<i class="material-icons">delete</i>',
            tooltip: 'Delete annotation',
        },
    
    },
    
    addHooks: function () {
        this._feature.remove()
        this.disable()
    },
});

var FeatureToFront = SimpleFeatureAction.extend({
    options: {
        toolbarIcon: {
            html: '<i class="material-icons">flip_to_front</i>',
            tooltip: 'To front',
        },
    
    },
    
    addHooks: function () {
        this._feature.bringToFront()
        this.disable()
    },
});

var FeatureToBack = SimpleFeatureAction.extend({
    options: {
        toolbarIcon: {
            html: '<i class="material-icons">flip_to_back</i>',
            tooltip: 'To back',
        },
    
    },
      
    addHooks: function () {
        this._feature.bringToBack()
        this.disable()
    },
});

var MoveLabel = SimpleFeatureAction.extend({
    options: {
        toolbarIcon: {
            html: '<i class="material-icons">open_with</i>',
            tooltip: 'Move label',
        },
    
    },
    
    addHooks: function () {
        this._feature.enableEdit()
        this.disable()
    },
});

var EditLabel = SimpleFeatureAction.extend({
    options: {
        toolbarIcon: {
            html: '<i class="material-icons">text_format</i>',
            tooltip: 'Edit text',
        },
    
    },
    
    addHooks: function () {
        this._feature.bindPopup(L.Util.bind(this._popupContent,this)).openPopup()
        this._feature.once('popupclose', this._feature.unbindPopup)
        this.disable()
    },
    
    _popupContent: function(feature) {
        var currentLabel = feature.getElement().innerHTML;
        
        var input = L.DomUtil.create('input', 'leaflet-label-input', false)

        input.setAttribute('value', currentLabel)

        L.DomEvent.on(input, 'keyup', L.bind(function(e) { 
            this.setContent(e.target.value)
        }, this._feature));
        
        return input; //'<input value="' +  + '" type="text" style="height: 20px; line-height: 20px; border:none; padding:none; margin:none;  outline: none; border-bottom:black dashed 1px; display: inline-block;"><i class="material-icons">done</i>';
    }
});
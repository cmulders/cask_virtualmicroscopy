var newFeature = L.ToolbarAction.extend({
    options: {
        editTools: L.Editable,
    },
    
    initialize: function(map, options) {
        L.ToolbarAction.prototype.initialize.call(this, options);

        this._map = map;
        this._editTools = this.options.editTools
        
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

        this._currentFeature.once('editable:drawing:cancel', this._onDrawingCancel, this)
        this._currentFeature.once('editable:drawing:end', this._onDrawingEnd, this)
    },
    
    _onDrawingCancel: function(e) {
        this._currentFeature.off('editable:drawing:end', this._onDrawingEnd, this)
        e.layer.remove()
    },
    
    _onDrawingEnd: function(e) {
        this._currentFeature.off('editable:drawing:cancel', this._onDrawingCancel, this)
        this.disable()
    }    
});

var newPolygon = newFeature.extend({
    options: {
        toolbarIcon: {
            tooltip: 'Annotate a structure',
            className: 'svg-icon mode-edit'
        },
    
        subToolbar: new (L.Toolbar.extend({}))({
            actions: [DoneAction, CancelAction]
        })
    },

    addHooks: function () {
        this._editTools.once('editable:drawing:start', this._onDrawingStart, this)
        this._editTools.once('editable:drawing:clicked', this._onDrawingFirstClicked, this)
        this._editTools.startPolygon()
    },
    
    removeHooks: function() {
      newFeature.prototype.removeHooks.call(this);
      this._editTools.off('editable:drawing:clicked', this._onDrawingFirstClicked, this)            
    },
    
    _onDrawingFirstClicked: function(e) {
      L.DomUtil.addClass(e.latlng.__vertex.getElement(), 'closing-vertex');
    }
});

var newLabel = newFeature.extend({
    options: {
        toolbarIcon: {
            tooltip: 'Label a structure',
            className: 'svg-icon text-field'
        },
    
        subToolbar: new (L.Toolbar.extend({}))({
            actions: [CancelAction]
        })
    },
        
    addHooks: function () {
        this._editTools.once('editable:drawing:start', this._onDrawingStart, this)
        this._editTools.once('editable:drawing:click', this._onDrawingClick, this)
        this._editTools.startMarker()
    },

    removeHooks: function() {
      newFeature.prototype.removeHooks.call(this);
      this._editTools.off('editable:drawing:click', this._onDrawingClick, this)
      this._currentFeature.showLabelEditor( L.Browser.touch );
    },

    _onDrawingClick: function(e) {
      e.layer.setLatLng(e.latlng);
    }
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
            tooltip: 'Done editing',
            className: 'svg-icon done'
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
            tooltip: 'Edit annotation',
            className: 'svg-icon mode-edit'
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
            tooltip: 'Delete annotation',
            className: 'svg-icon delete'
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
            tooltip: 'To front',
            className: 'svg-icon flip-to-front'
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
            tooltip: 'To back',
            className: 'svg-icon flip-to-back'
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
            tooltip: 'Move label',
            className: 'svg-icon open-with'
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
            tooltip: 'Edit text',
            className: 'svg-icon text-format'
        },
    
    },
    
    addHooks: function () {
        this._feature.showLabelEditor(true);
        this.disable()
    }
});
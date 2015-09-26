var newPolygon = L.ToolbarAction.extend({
    options: {
        toolbarIcon: {
            html: '<i class="material-icons">mode_edit</i>',
            tooltip: 'Annotate a structure',
            className: ''
        },
        editTools: L.Editable,
        editOptions: {drawingCSSClass: 'leaflet-control-annotate'},
    
        subToolbar: new (L.Toolbar.extend({}))({
            actions: [DoneAction, CancelAction]
        })
    },
    
    initialize: function(map, options) {
        L.ToolbarAction.prototype.initialize.call(this, options);
        this._map = map;
        this._editTools = new this.options.editTools(this._map, this.options.editOptions)
        
        this._editTools.on('editable:drawing:cancel', this._onDrawingCancel, this)
        this._editTools.on('editable:drawing:commit', this._onDrawingCommit, this)
    },
        
    addHooks: function () {
        this._editTools.startPolygon()
    },
    
    removeHooks: function() {
        if(this._editTools.drawing()) {
            this._editTools.stopDrawing()
        }
    },
    
    doneAction: function() {
        this._editTools.commitDrawing();
        this.disable()
    },
    
    cancelAction: function() {
        this.disable();
    },
    
    _onDrawingCancel: function(e) {
        
    },
    
    _onDrawingCommit: function(e) {
        e.layer.editor.disable();
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
            tooltip: 'Edit a annotate',
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
            tooltip: 'Delete a annotation',
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

L.Popup.EditAnnotation = L.Toolbar.Popup.extend({})
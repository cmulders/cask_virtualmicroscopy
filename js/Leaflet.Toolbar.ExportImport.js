var ShowLink = L.ToolbarAction.extend({
    options: {
        toolbarIcon: {
            html: '<textarea rows="5" cols="30" readonly="readonly">',
            className: 'leaflet-toolbar-export-link action-text-field'
        },
    },
    
    initialize: function(map, options, parentAction) {
     //   console.log(map, options)
        L.ToolbarAction.prototype.initialize.call(this, options);
        this._map = map;
        this._featureLayer = this.options.layer
        this._storageController = this.options.storage
        
        parentAction.registerShowHook(L.bind(this.onShow, this))
    },
    
    _getInput: function() {
        if(!this._inputField){
            this._inputField = this._icon.getElementsByTagName('textarea')[0]
        }
        return this._inputField;
    },
    
    onShow: function(caller) {
      
        var inputEle = this._getInput();
        
        inputEle.value = "Loading.."
        inputEle.disabled = true;
        
        var succesCallback = L.bind(this.onLink,this);
        var that = this;
        this._storageController.save(this._featureLayer, succesCallback, function() {
          //Failed to save, probably connection error, try once more
          inputEle.value = "Loading... Failed (1/3), trying again"
          
          setTimeout(function() { that._storageController.save(that._featureLayer, succesCallback, function() {
            //Failed second time
            inputEle.value = "Loading... Failed again (2/3), trying again";
            
            setTimeout(function() { that._storageController.save(that._featureLayer, succesCallback, function() {
              //Failed third time
              inputEle.value = "Failed again (3/3), Connection error, try again later";
            })}, 1000);
          })}, 1000);      
        });
    },
    
    onLink: function(storageID) {
        var inputEle = this._getInput()
        
        inputEle.value = !!storageID ? this._getLink(storageID) : "No features added yet!";
        inputEle.disabled = storageID === false ? true : false;
        inputEle.focus();
        inputEle.setSelectionRange(0, inputEle.value.length);
    },
    
    _getLink: function (dataValue) {
        var url = window.location || document.location;
        var searchParams = L.Util.parseParamString(url.search)
        var newSearch = L.Util.getParamString(L.extend(searchParams, {data: dataValue} ))
        
        return url.origin + url.pathname + newSearch + url.hash;
    },
    
    addHooks: function () {
       this.disable()
    },
    
    removeHooks: function() {
        this.toolbar.remove()
    }
});

var ExportShapes = L.ToolbarAction.extend({
    options: {
        toolbarIcon: {
            tooltip: 'Export shapes',
            className: 'svg-icon link'
        },
        
        subToolbar: new (L.Toolbar.extend({}))({
            actions: [DoneAction, ShowLink]
        }),
    },
    
    initialize: function(map, options) {
        L.ToolbarAction.prototype.initialize.call(this, options);
        this._map = map;
        this._showHooks = []
    },

    registerShowHook: function(fn) {
        this._showHooks.push(fn);
    },

    addHooks: function () {
        for(hook in this._showHooks) {
            this._showHooks[hook](this)
        }      
    },
    
    doneAction: function() {
        this.disable()
    },
})

var ImportShapes = L.ToolbarAction.extend({
    options: {
        toolbarIcon: {
            html: '<i class="material-icons">done</i>',
            tooltip: 'Done editing',
        },
    },
    
    initialize: function(map, options) {
        L.ToolbarAction.prototype.initialize.call(this, options);
        this._map = map;
        this._featureLayer = this.options.feature
        this._storageController = this.options.storage
    },

    addHooks: function () {
        this._storageController.load(storageID, L.bind(function(storageID) {
            console.log(geoJSON)
            this.disable()
        }, this));
        
    },
    
    removeHooks: function() {
        this.toolbar.remove()
    }
})
var DoneAction = L.ToolbarAction.extend({
    options: {
        toolbarIcon: {
            tooltip: 'Done',
            className: 'svg-icon done white'
        },
    },
    
    addHooks: function () {
        if(!this.toolbar.parentToolbar || !this.toolbar.parentToolbar._active){ return; }
        
        if(this.toolbar.parentToolbar._active.doneAction) {
            this.toolbar.parentToolbar._active.doneAction()
        }
    }
});

var CancelAction = L.ToolbarAction.extend({
    options: {
        toolbarIcon: {
            tooltip: 'Cancel',
            className: 'svg-icon cancel white'
        },
    },
    
    addHooks: function () {
        if(!this.toolbar.parentToolbar || !this.toolbar.parentToolbar._active){ return; }
        
        if(this.toolbar.parentToolbar._active.cancelAction) {
            this.toolbar.parentToolbar._active.cancelAction()
        }
    }
});
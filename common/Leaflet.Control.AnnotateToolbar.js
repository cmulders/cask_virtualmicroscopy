var newPolygon = L.ToolbarAction.extend({
            options: {
                toolbarIcon: {
                    html: 'mode_edit',
                    tooltip: 'Annotate a structure',
                    className: 'material-icons'
                }
            },
            addHooks: function () {
                map.setView([-0.00035653427200000004, 0.001317843968], 3)
            }
        });

        
L.AnnotateToolbar = L.Toolbar.Control.extend({
    options: {
        position: 'topleft',
        actions: [
              newPolygon,
        ],
        className: '' // Style the toolbar with Leaflet.draw's custom CSS
    }
});
    
L.annotatetoolbar = function (options) {
	return new L.AnnotateToolbar(options);
};
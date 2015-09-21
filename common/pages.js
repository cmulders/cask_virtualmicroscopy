var pages = [
    {title:"Base Leaflet with corrected scale bar",folder:"Leaflet-slideviewer"},
    {title:"Leaflet with minimap",folder:"Leaflet-minimap"},
    {title:"Leaflet with minimap and measure",folder:"Leaflet-ruler"}
    ]
    
$(function(){
    if($('.navbar-brand').length)
    {
        var pathArray = window.location.pathname.split( '/' ),
            dir = pathArray[pathArray.length-2];
        pages.forEach(function(element)
        {

            if(element.folder.toLowerCase() == dir.toLowerCase())
            {
               $('.navbar-brand').html(element.title)
            }
        })
    }
});

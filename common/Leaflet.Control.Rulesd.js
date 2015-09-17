/*
 * L.TileLayer.Zoomify display Zoomify tiles with Leaflet
 */

L.Control.Ruler.extend({
	
	_updateMetric: function (maxMeters) {
		var meters = this._getRoundNum(maxMeters),
			exp = Math.floor(Math.log10(maxMeters)),
			scaleExp = 0;

		if(exp < -6) {
			resunits= "nm"; scaleExp = -9;		
		}else if(exp < -3) {
			resunits= "&micro;m"; scaleExp = -6;
		}else if (exp == -3) {
			resunits= "mm"; scaleExp = -3;
		}else if (exp == -2) {
			resunits= "cm"; scaleExp = -2;
		}else if (exp == -1) {
			resunits= "dm"; scaleExp = -1;
		}else if(exp >= 0 && exp < 3) {
			resunits= "m"; 
		}else if(exp >= 3) {
			resunits= "km"; scaleExp = 3;
		}

		label = Math.round(meters/Math.pow(10,scaleExp)) +" "+ resunits;

		this._updateScale(this._mScale, label, meters / maxMeters );
	},
	
	_getRoundNum: function (num) {
		var pow10 = Math.pow(10, Math.floor(Math.log10(num))),
		    d = num / pow10;
	
		d = d >= 10 ? 10 :
		    d >= 5 ? 5 :
		    d >= 3 ? 3 :
		    d >= 2 ? 2 : 1;

		return pow10 * d;
	}

});
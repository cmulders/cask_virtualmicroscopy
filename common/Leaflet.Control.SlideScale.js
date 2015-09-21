L.Control.Scale.include({
    _updateMetric: function (maxMeters) {
        var meters = this._getRoundNum(maxMeters),
            humanReadable = this.humanReadable(meters)
            humanString = Math.round(humanReadable.magnitude)+" "+humanReadable.unit;

        this._updateScale(this._mScale, humanString, meters / maxMeters );
    },

    humanReadable: function(meters) {
        var exp = Math.floor(Math.log10(meters)),
            resunits = '', scaleExp = 0

        if(exp < -6) {
            resunits = "nm"
            scaleExp = -9
        }else if(exp < -3) {
            resunits = "&micro;m"
            scaleExp = -6
        }else if (exp < 0) {
            resunits = "mm"
            scaleExp = -3
        }else if(exp < 3) {
            resunits = "m"
        }else { //if(exp < 6) {
            resunits = "km"
            scaleExp = 3
        }
        
        return {magnitude:meters/Math.pow(10,scaleExp), unit:resunits}
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
})

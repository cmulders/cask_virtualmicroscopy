describe('Util', function () {
	describe('#parseParamString', function () {
		it('parses a valid query string to a object', function () {
			var testUrl = '?key=value&bool';
			var expected = {
				key: 'value',
				bool: true
			};

			expect(L.Util.parseParamString(testUrl)).to.eql(expected);
		});
		it('parses a invalid query string to an empty object', function () {
			var testUrl = 'key=value&bool';
			var expected = {};
			expect(L.Util.parseParamString(testUrl)).to.eql(expected);
		});
		it('parses uri-encoded strings', function () {
			var testUrl = '?key=stl%3De%26test';
			var expected = {
				key: 'stl=e&test'
			};
			expect(L.Util.parseParamString(testUrl)).to.eql(expected);
		});
		it('parses the query string created by L.Util.getParamString', function () {
			var expected = {
				foo: 'bar',
				key: 'stl=e&test'
			};
			var query = L.Util.getParamString(expected);

			expect(L.Util.parseParamString(query)).to.eql(expected);
		});
	});
});

describe('Map.UrlView', function () {
	describe('#addHook', function () {
		before(function () {
			window.history.replaceState({}, '', location.origin + location.pathname);
		});
		after(function () {
			window.history.replaceState({}, '', location.origin + location.pathname);
		});
		it('calls the map with dragging enabled', function () {
			var map = new L.Map(document.createElement('div'), {
				urlView: false
			});
			expect(map.urlView.enabled()).to.be.false;
			map.urlView.enable();
			expect(map.urlView.enabled()).to.be.true;
		});
		it('loads the view from the url on map load', function () {

			var view = {zoom: 3, lat: 2, lng: 1};

			window.history.replaceState({}, '', L.Util.getParamString(view));

			var map = new L.Map(document.createElement('div'), {
				urlView: true
			});
			expect(map.urlView.enabled()).to.be.true;

			expect(map.urlView.viewLoaded()).to.be.true;

			var searchObject = L.Util.parseParamString(location.search);
			expect(Number(searchObject.lat)).to.equal(map.getCenter().lat);
			expect(Number(searchObject.lng)).to.equal(map.getCenter().lng);
			expect(Number(searchObject.zoom)).to.equal(map.getZoom());
		});
		it('loads the view from the url on map load, but fails with invalid arguments', function () {

			var viewtests = [
				{zoom: 3, lat: 'nop', lng: 1},
				{zoom: 3, lat: 1, lng: 'nop'},
				{zoom: -1, lat: 2, lng: 1}
			];

			viewtests.forEach(function (view) {
				window.history.replaceState({}, '', L.Util.getParamString(view));

				var map = new L.Map(document.createElement('div'), {
					urlView: true
				});
				expect(map.urlView.enabled()).to.be.true;
				expect(map.urlView.viewLoaded()).to.be.false;
			});
		});
	});

	describe('#onMapMoved', function () {
		before(function () {
			window.history.replaceState({}, '', location.origin + location.pathname);
		});
		after(function () {
			window.history.replaceState({}, '', location.origin + location.pathname);
		});

		it('updates the current search location on moveend', function () {
			var map = new L.Map(document.createElement('div'), {
				urlView: true
			});

			var spy = sinon.spy();
			map.on('moveend', spy);

			var view = {zoom: 3, lat: 2, lng: 1};

			map.setView([view.lat, view.lng], view.zoom);

			expect(spy.called).to.be.true;

			var searchObject = L.Util.parseParamString(location.search);
			expect(Number(searchObject.lat)).to.equal(view.lat);
			expect(Number(searchObject.lng)).to.equal(view.lng);
			expect(Number(searchObject.zoom)).to.equal(view.zoom);
		});
		it('does not listens to moveend when disabled', function () {
			var map = new L.Map(document.createElement('div'), {
				urlView: false
			}).setView([0, 0], 0);

			// Enable urlView later to attach our spy before event listener does
			sinon.spy(map.urlView, '_onMapMoved');
			map.urlView.enable();

			var spy = sinon.spy();
			map.on('moveend', spy);

			var view1 = {zoom: 3, lat: 2, lng: 1};
			var view2 = {zoom: 1, lat: 3, lng: 2};

			map.urlView._onMapMoved.reset();
			map.setView([view1.lat, view1.lng], view1.zoom);
			expect(spy.called).to.be.true;
			expect(map.urlView._onMapMoved.calledOnce).to.be.true;


			map.urlView._onMapMoved.reset();
			map.urlView.disable();
			map.setView([view2.lat, view2.lng], view2.zoom);
			expect(map.urlView._onMapMoved.called).to.be.false;

			map.urlView._onMapMoved.restore();

		});
	});

	describe('#getLatLngPrecision', function () {
		it('returns a precision that is good enough to retrieve the exact position', function () {
			var map = new L.Map(document.createElement('div'), {
				urlView: false
			});

			// Test multiple zoom levels
			var zoom = 30;
			while (zoom-- > 0) {
				// Create a very small
				var x = Math.floor((Math.random() * 10) + 1);
				var y = Math.floor((Math.random() * 10) + 1);

				map.setView([0, 0], zoom).panBy(L.point(x, y), {animate:false});

				var precision = map.urlView.getLatLngPrecision(),
				    startCenter = map.getCenter(),
				    newLat = startCenter.lat.toFixed(precision.lat),
				    newLng = startCenter.lng.toFixed(precision.lng);
				map.setView([newLat, newLng], zoom);

				var newCenter = map.getCenter();
				expect(startCenter).to.be.eql(newCenter, 'Zoom level: ' + zoom + ' orig:' + startCenter  + ' new:' + newCenter);
			}
		});
	});
});

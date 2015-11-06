if (typeof Function.prototype.bind != 'function') {
	Function.prototype.bind = function bind(obj) {
		var args = Array.prototype.slice.call(arguments, 1),
		self = this,
		Nop = function () {
		},
		bound = function () {
			return self.apply(
					this instanceof Nop ? this : (obj || {}), args.concat(
						Array.prototype.slice.call(arguments)
					)
				);
		};
		Nop.prototype = this.prototype || {};
		bound.prototype = new Nop();
		return bound;
	};
}

describe('Tilelayer.Zoomify', function () {
	describe('constructor', function () {
		it('throws when width or height are not set', function () {
			var options = {};
			expect(L.tileLayer.zoomify.bind(undefined, '', options)).to.throw(Error, 'The user must set the Width and Height of the Zoomify image');

			options.width = 1;
			expect(L.tileLayer.zoomify.bind(undefined, '', options)).to.throw(Error, 'The user must set the Width and Height of the Zoomify image');

			options.height = 1;
			expect(L.tileLayer.zoomify.bind(undefined, '', options)).to.not.throw(Error, 'The user must set the Width and Height of the Zoomify image');
		});
	});

	describe('#beforeAdd', function () {
		it('is called when added to a map', function () {
			var layer = L.tileLayer.zoomify('{g}/{z}-{x}-{y}', {width: 1, height: 1});

			sinon.spy(layer, 'beforeAdd');

			var map = L.map(document.createElement('div'));

			layer.addTo(map);

			expect(layer.beforeAdd.calledOnce).to.be.true;
		});
		it('sets the bounds option of the TileLayer', function () {
			var size = {width: 400, height: 400};
			var layer = L.tileLayer.zoomify('{g}/{z}-{x}-{y}', size);

			var map = L.map(document.createElement('div'), {
				crs: L.CRS.Simple
			});

			layer.addTo(map);

			expect(layer.options.bounds).to.be.ok;
		});
		it('sets the maxnativezoom option of the TileLayer', function () {
			var maxNativeZoom = 4;
			while (maxNativeZoom-- > 0) {
				var	multi = Math.pow(2, maxNativeZoom);
				var layer = L.tileLayer.zoomify('{g}/{z}-{x}-{y}', {width: 256 * multi, height: 256 * multi});

				var map = L.map(document.createElement('div'), {
					crs: L.CRS.Simple
				});

				layer.addTo(map);
				expect(layer.options.maxNativeZoom).to.be.equal(maxNativeZoom);
			}
		});
		it('calculates the imagesize and gridsize correctly for the zoom levels', function () {
			var size = {width: 2000, height: 2000};
			var expectedGrid = [
				L.point(1, 1),
				L.point(2, 2),
				L.point(4, 4),
				L.point(8, 8)
			];
			var expectedSize = [
				L.point(250, 250),
				L.point(500, 500),
				L.point(1000, 1000),
				L.point(2000, 2000)
			];

			var layer = L.tileLayer.zoomify('{g}/{z}-{x}-{y}', size);

			var map = L.map(document.createElement('div'), {
				crs: L.CRS.Simple
			});

			layer.addTo(map);

			expect(layer._gridSize).to.be.eql(expectedGrid);
			expect(layer._imageSize).to.be.eql(expectedSize);
		});
		it('respects the __super__.beforeAdd', function () {
			var maxZoom = 10,
			minZoom = 5;

			var map = L.map(document.createElement('div'));
			L.tileLayer.zoomify('{g}/{z}-{x}-{y}', {
				width: 1000,
				height: 1000,
				maxZoom: maxZoom,
				minZoom: minZoom
			}).addTo(map);

			map.setView([0, 0], 1);

			expect(map.getMaxZoom()).to.equal(maxZoom);
			expect(map.getMinZoom()).to.equal(minZoom);
		});
	});

	describe('#getTileUrl', function () {
		it('adds the {g} option with the tilegroup', function () {
			var layer = L.tileLayer.zoomify('{g}/{z}-{x}-{y}', {tileGroupPrefix: 'TileGroup', width: 6000, height: 6000});

			layer.createTile = function () {
				return document.createElement('div');
			};

			var map = L.map(document.createElement('div')).setView([0, 0], 5);

			layer.addTo(map);

			var expected = [
				[L.point(1, 1), 'TileGroup0/5-1-1'],
				[L.point(2, 23), 'TileGroup2/5-2-23'],
				[L.point(23, 3), 'TileGroup1/5-23-3'],
				[L.point(23, 23), 'TileGroup3/5-23-23']
			];

			expected.forEach(function (testcase) {
				testcase[0].z = 5;
				expect(layer.getTileUrl(testcase[0])).to.be.eql(testcase[1]);
			});
		});
	});

	describe('#getBounds', function () {
		it('returns the bounds', function () {
			var size = {width: 200, height: 200};
			var gridSize = L.point(256, 256);
			var layer = L.tileLayer.zoomify('{g}/{z}-{x}-{y}', size);

			layer.createTile = function () {
				return document.createElement('div');
			};

			var map = L.map(document.createElement('div'), {
				crs: L.CRS.Simple
			}).setView([0, 0], 0);

			layer.addTo(map);
			var expectedBounds = L.latLngBounds([L.latLng(0, 0), map.unproject(gridSize, 0)]);
			expect(layer.getBounds().equals(expectedBounds)).to.be.true;
		});
	});

	describe.only('#_addTile', function () {
		it('should create tiles with truncated size if required', function () {
			var size = {width: 400, height: 300};
			var layer = L.tileLayer.zoomify('{g}/{z}-{x}-{y}', size);

			layer.createTile = function () {
				return document.createElement('div');
			};

			var container = document.createElement('div');
			container.style.width = '500px';
			container.style.height = '500px';
			document.body.appendChild(container);
			var map = L.map(container, {
				crs: L.CRS.Simple
			}).setView([0, 0], 0);

			layer.addTo(map);

			map.fitBounds(layer.getBounds(), {animate: false});
			map.setZoom(1, {animate: false});

			function getTileSize(layer, coords) {
				var key = layer._tileCoordsToKey(coords),
				tile = layer._tiles[key].el;

				return L.point(parseInt(tile.style.width), parseInt(tile.style.height));
			}

			var expected = [
				[L.point(0, 0), L.point(256, 256)],
				[L.point(0, 1), L.point(256, 44)],
				[L.point(1, 0), L.point(144, 256)],
				[L.point(1, 1), L.point(144, 44)]
			];

			expected.forEach(function (testcase) {
				testcase[0].z = 1;
				var realSize = getTileSize(layer, testcase[0]),
				expectedSize = testcase[1];
				expect(realSize.equals(expectedSize)).to.be.true;
			});

			map.remove();
			document.body.removeChild(container);
		});
	});
});

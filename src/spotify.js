function SpotifyPlugin() {
	result = {};
	function addNewArtist(id) {
		if (this.artists[id] === undefined) {
			this.artists[id] = getNewArtist(name, id);
		}
	}

	// Callback takes a list of names, and a function of what to do on node Add
	result.search = function(artist, callback) {
		superagent.get('https://api.spotify.com/v1/search?q=' + encodeURI(artist) + '&type=artist')
			.end(function(err, results) {
				var searchres = JSON.parse(results.text).artists.items.slice(0, 5).map(
					function(artist) {return {value: artist.name, id: artist.id};}
				);
				callback(searchres);
			});
	};

	result.nodeOnScreen = function(id) {
		artists[id].onScreen = true;
	};

	result.getRelated = function(id, callback) {
		superagent.get('https://api.spotify.com/v1/artists/' + encodeURI(id) + '/related-artists')
			.end(function(err, related) {
				var results = JSON.parse(related.text).artists;
				callback({id: results[0].id, value: results[0].name});
			});
	};
	return result;
};

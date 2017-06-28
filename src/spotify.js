function SpotifyPlugin(auth) {

	console.log("Spotify plugin initialised with auth:", auth);

	result = {};
	function addNewArtist(id) {
		if (this.artists[id] === undefined) {
			this.artists[id] = getNewArtist(name, id);
		}
	}

	// Callback takes a list of names, and a function of what to do on node Add
	result.search = function(artist, callback) {
		superagent.get('https://api.spotify.com/v1/search')
			.query({q: artist, type: 'artist'})
			.set("Authorization", "Bearer " + auth.token)
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

	related = {};

	function firstRelated(id, ids) {
		var rel = related[id];
		var res = null;
		var toSplice = 0;
		for (var i = 0; i < rel.length; i++) {
			if (ids[rel[i].id] === undefined) {
				res = rel[i];
				break;
			} else {
				toSplice++;
			}
		}
		rel.splice(0, toSplice);
		return res;
	}

	result.getRelated = function(id, ids, callback, noneLeft) {
		if (related[id] != null) {
			var rel = firstRelated(id, ids);
			if (rel == null) noneLeft();
			else callback(rel);
		} else {
			superagent.get('https://api.spotify.com/v1/artists/' + encodeURI(id) + '/related-artists')
				.set("Authorization", "Bearer " + auth.token)
				.end(function(err, relatedans) {
					var results = JSON.parse(relatedans.text).artists;
					related[id] = results.map(function(res) {return {value: res.name, id: res.id};});
					var rel = firstRelated(id, ids);
					if (rel == null) noneLeft();
					else callback(rel);
				});
		}
	};
	return result;
};

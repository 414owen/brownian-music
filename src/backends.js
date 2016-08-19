backends.spotify = function(addNode, onSearchClick) {
    result = {};
    function getNewArtist(idparam) {
        return {
            id: idparam,
            related: [],
            relatedOnScreen: 0
        };
    }

    function addNewArtist(id) {
        if (this.artists[id] === undefined) {
            this.artists[id] = getNewArtist(name, id);
        }
    }

    var artists = {
        /*

        sdfej3bncc: {
            gotRelated: false,
            related: ["sdwefijh33","dfe3gh3e3q"],
            relatedOnScreen: 2
        }

        */
    };

    // Callback takes a list of names, and a function of what to do on node Add
    result.search = function(artist, callback) {
        var request = pegasus('https://api.spotify.com/v1/search?q=' + encodeURI(artist) + '&type=artist');
        request.then(function(results) {
            var artists = results.artists.items.slice(0, 5).map(
                function(related) {return related.name;}
            );
            callback(artists);
        });
    };

    result.getRelated = function(id, callback) {
        var artist = this.artists[id];
        if (!artist.gotRelated) {
            var request = pegasus('https://api.spotify.com/v1/artists/' + encodeURI(id) + '/related-artists');
            request.then(function(related) {
                var artist = related.map(function(artist) {return getNewArtist(artist.name, artist.id);});
            });
        }
    };
    return result;
};

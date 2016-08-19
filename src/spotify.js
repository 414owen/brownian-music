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
        superagent.get('https://api.spotify.com/v1/search?q=' + encodeURI(artist) + '&type=artist')
        .end(function(err, results) {
            var artists = JSON.parse(results.text).artists.items.slice(0, 5).map(
                function(related) {return related.name;}
            );
            callback(artists);
        });
    };

    result.getRelated = function(id, callback) {
        var artist = this.artists[id];
        if (!artist.gotRelated) {
            superagent.get('https://api.spotify.com/v1/artists/' + encodeURI(id) + '/related-artists')
            .end(function(err, related) {
                var artist = JSON.parse(related.text).map(function(artist) {return getNewArtist(artist.name, artist.id);});
            });
        }
    };
    return result;
};

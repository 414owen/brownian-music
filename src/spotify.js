backends.spotify = function() {
    result = {};

    function addNewArtist(id) {
        if (this.artists[id] === undefined) {
            this.artists[id] = getNewArtist(name, id);
        }
    }

    var artists = {
        /*

        sdfej3bncc: {
            onScreen: false,
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
                function(artist) {return {name: artist.name, val: artist.id};}
            );
            artists.forEach(function(artist) {
                artists[artist.val.id] = {
                    onScreen: true,
                    gotRelated: false,
                    related: [],
                    relatedOnScreen: 0
                };
            });
            callback(artists);
        });
    };

    result.nodeOnScreen = function(id) {
        artists[id].onScreen = true;
    };

    result.getRelated = function(id, callback) {
        var artist = artists[id];
        if (!artist.gotRelated) {
            superagent.get('https://api.spotify.com/v1/artists/' + encodeURI(id) + '/related-artists')
            .end(function(err, related) {
                artist.gotRelated = true;
                artist.related = JSON.parse(related.text).map(function(result) {return result.id;});
            });
        }
    };
    return result;
};

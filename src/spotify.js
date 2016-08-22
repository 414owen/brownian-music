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
            name: 'Test',
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
            var searchres = JSON.parse(results.text).artists.items.slice(0, 5).map(
                function(artist) {return {name: artist.name, val: artist.id};}
            );
            searchres.forEach(function(artist) {
                artists[artist.val] = {
                    onScreen: false,
                    gotRelated: false,
                    related: [],
                    relatedOnScreen: 0
                };
            });
            callback(searchres);
        });
    };

    result.nodeOnScreen = function(id) {
        artists[id].onScreen = true;
    };

    function firstRelated(id, callback) {
        var artist = artists[id];
        var related = artist.related;
        var length = related.length;
        for (var i = artist.relatedOnScreen; i < length; i++) {
            var relid = related[i];
            var rel = artists[relid];
            if (!rel.onScreen) {
                callback({name: rel.name, val: relid});
                break;
            }
            rel.relatedOnScreen++;
        }
    }

    result.getRelated = function(id, callback) {
        var artist = artists[id];
        if (!artist.gotRelated) {
            superagent.get('https://api.spotify.com/v1/artists/' + encodeURI(id) + '/related-artists')
            .end(function(err, related) {
                artist.gotRelated = true;
                JSON.parse(related.text).artists.forEach(function(result) {
                    var id = result.id;
                    artists[id] = {
                        name: result.name,
                        onScreen: false,
                        gotRelated: false,
                        related: [],
                        relatedOnScreen: 0
                    }
                    artist.related.push(id);
                });
                firstRelated(id, callback);
            });
        } else {
            firstRelated(id, callback);
        }
    };
    return result;
};

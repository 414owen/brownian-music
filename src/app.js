window.onload = function() {

var searchResults = div().style(style.vertical);
function performSearch(e, elified) {
    searchResults.clear();
    backend.search(elified.val.value, addSearchResults);
}

function addSearchResults(artists) {
    searchResults.clear();
    if (artists.length === 0) {
        searchResults(div('No Results').style(style.noResult))
    }
    artists.forEach(
        function(artist) {
            searchResults(
                div(artist.name)
                    .style(style.base, style.listItem)
                    .onclick(function() {
                            body().val.removeChild(body().val.childNodes[1]);
                            body(graphHolder);
                            var frontend = graph(backend, graphHolder.val);
                            frontend.addFirstNode(artist.name, artist.val);
                        }
                    )
            );
        }
    );
}

var backend = backends[backends.selected]();
var graphHolder = div().style(style.fillScreen);
var inputvar = input('Hello World')
                .style(style.input, {width: '100%'})
                .placeholder('Artist')
                .onchange(performSearch);

body().style(style.body, style.center)(
    div(
        inputvar,
        div(searchResults).style({width: '100%'})
    ).style({width: '15rem'})
);

};


nutmeg().global();
var backends = {selected: 'spotify'};

var foreground = '#ddd';
var background = '#333';

var style = mergeStyle({
    color: {
        color: foreground,
        backgroundColor: background
    },
    transition: {
        transition: 'all 0.3s linear'
    },
    button: {
        depends: ['input', 'clickable']
    },
    padded: {
        padding: '1rem'
    },
    margined: {
        margin: '1rem'
    },
    bordered: {
        border: '1px solid ' + foreground
    },
    clickable: {
        cursor: 'pointer'
    },
    input: {
        depends: ['base', 'padded', 'inverted'],
        focus: {
            outline: 'none'
        }
    },
    base: {
        depends: ['color'],
        border: '0',
        margin: '0',
        padding: '0',
        fontFamily: 'Raleway',
        fontSize: '1rem',
        fontWeight: '300',
        lineHeight: '1.15',
        display: 'block',
        transition: 'all 0.2s linear'
    },
    inverted: {
        color: background,
        backgroundColor: foreground
    },
    body: {
        depends: ['base', 'fill', 'abs'],
    },
    fill: {
        width: '100%',
        height: '100%'
    },
    fillScreen: {
        depends: ['fill', 'abs']
    },
    abs: {
        position: 'absolute'
    },
    flex: {
        display: 'flex'
    },
    vertical: {
        flexDirection: 'column'
    },
    centerHor: {
        depends: ['flex'],
        width: '100%',
        justifyContent: 'center',
        textAlign: 'center'
    },
    center: {
        depends: ['fill', 'centerHor'],
        alignItems: 'center'
    },
    hline: {
        depends: ['lower'],
        borderTop: '1px solid'
    },
    lower: {
        marginTop: '0.5rem'
    },
    disperse: {
        depends: ['flex'],
        justifyContent: 'space-around'
    },
    invertOnHover: {
        hover: {
            depends: ['inverted']
        }
    },
    normalOnHover: {
        hover: {
            depends: ['color']
        }
    },
    fillHor: {
        width: '100%'
    },
    listItem: {
        depends: ['inverted', 'padded', 'fillHor', 'normalOnHover'],
        cursor: 'pointer'
    },
    noResult: {
        depends: ['inverted', 'padded', 'fillHor'],
        cursor: 'default'
    }
});

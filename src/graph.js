function graph() {
    this.init = function(parent) {
        var ratio = window.devicePixelRatio || 1;
        var canv = canvas().width(window.innerWidth * ratio).height(window.innerHeight * ratio);
        var ctx = canv.val.getContext('2d');
    }
    var graph = [
    /*
        {
            name: 'example',
            x: 0,
            y: 0,
            dy: 0,
            dx: 0,
            getRelated: function() {...}
        },
    */
    ];
    
    this.addNode = function(text, from) {
        var node;
        if (graph.length === 0) {

        }
        return node;
    }
}


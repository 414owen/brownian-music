function graph(container) {
    var ratio = window.devicePixelRatio || 1;
    var canv = canvas()
                    .width(container.innerWidth * ratio)
                    .height(container.innerHeight * ratio);
    canv.style.width = '100%';
    canv.style.width = '100%';
    container.appendChild(canv.val);
    var ctx = canv.val.getContext('2d');
    var result = {};
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
    
    result.addNode = function(text, from) {
        var node;
        if (graph.length === 0) {
            
        } else {
            
        }
        return node;
    }
    
    graph.forEach(function(node) {
        
    });
    
    return result;
}


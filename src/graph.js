function graph(container) {
    var radius = 40;
    var ratio = window.devicePixelRatio || 1;
    var width = container.offsetWidth * ratio;
    var height = container.offsetHeight * ratio;
    var canv = canvas()
                    .width(width)
                    .height(height);
    canv.style.width = '100%';
    canv.style.width = '100%';
    container.appendChild(canv.val);
    var ctx = canv.val.getContext('2d');
    var result = {};
    var font = "Raleway";
    var graph = [
    /*
        {
            name: 'example',
            x: 0,
            y: 0,
            dy: 0,
            dx: 0,
            fontSize: 0
        },
    */
    ];
    
    result.addNode = function(text, from) {
        var node;
        ctx.font = font;
        var metrics;
        var scaledText = [text];
        function scaleText() {
            metrics = ctx.measureText(text);
            if (metrics) {
                
            }
        }
        scaleText();
        if (graph.length === 0) {
            graph.push({
                name: text,
                x: width / 2,
                y: height / 2,
                dx: 0,
                dy: 0,
                fontSize: 0
            });
        } else {
            
        }
        return node;
    }
    
    function frame() {
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline="middle"; 
        ctx.strokeStyle = "#ddd";
        ctx.fillStyle = "#ddd";
        ctx.lineWidth = 2;
        ctx.clearRect(0, 0, width, height);
        graph.forEach(function(node) {
            ctx.arc(node.x,node.y,radius,0,2*Math.PI);
            ctx.fill();
        });
        ctx.fillStyle = "#333";
        graph.forEach(function(node) {
            ctx.fillText(node.name,node.x,node.y);
        });
        window.requestAnimationFrame(frame);
    }
    frame();
    
    return result;
}


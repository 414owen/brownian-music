function graph(backend, container) {
    var radius = 40;
    var ratio = window.devicePixelRatio || 1;
    var width = container.offsetWidth * ratio;
    var height = container.offsetHeight * ratio;
    var startVel = 1 * ratio;
    var canv = canvas()
                    .width(width)
                    .height(height)
                    .style({width: '100%', height: '100%'});
    container.appendChild(canv.val);
    var ctx = canv.val.getContext('2d');
    var result = {};
    var font = "14px Raleway";
    var graph = [
    /*
        {
            fullText: 'thing',
            text: 'example',
            x: 0,
            y: 0,
            dy: 0,
            dx: 0,
            fontSize: 0,
            val: backend...
        },
    */
    ];

    function truncate(text) {
        ctx.font = font;
        var newText = text;
        var letters = text.length;
        while (ctx.measureText(newText).width > radius * 2 - 10) {
            newText = text.substring(0, --letters) + '...';
        }
        return newText;
    }

    result.addFirstNode = function(text, val) {
        var node = {
            fullText: text,
            text: truncate(text),
            x: width / 2,
            y: height / 2,
            dx: 0,
            dy: 0,
            val: val
        };
        backend.nodeOnScreen(val);
        graph.push(node);
        return node;
    }
    
    result.addNode = function(text, val, from) {
        var node = {
            fullText: text,
            text: truncate(text),
            x: from.x,
            y: from.y,
            dx: startVel,
            dy: startVel,
            val: val
        };
        backend.nodeOnScreen(val);
        graph.push(node);
        return node;
    }
    
    function frame() {
        ctx.beginPath();
        ctx.font = font;
        ctx.textAlign = 'center';
        ctx.textBaseline="middle"; 
        ctx.strokeStyle = "#ddd";
        ctx.fillStyle = "#ddd";
        ctx.lineWidth = 2;
        ctx.clearRect(0, 0, width, height);
        graph.forEach(function(node) {
            ctx.arc(node.x,node.y,radius,0,2*Math.PI);
        });
        ctx.fill();
        ctx.fillStyle = "#333";
        graph.forEach(function(node) {
            ctx.fillText(node.text,node.x,node.y);
            node.x += node.dx;
            node.y += node.dy;
        });
        window.requestAnimationFrame(frame);
    }
    frame();
        
    canv.onclick(function(e) {
        var x = e.pageX - canv.val.offsetLeft;
        var y = e.pageY - canv.val.offsetTop;
        graph.forEach(function(node) {
            var hdist = Math.abs(node.x - x);
            var vdist = Math.abs(node.y - y);
            var distance = Math.sqrt((hdist * hdist) + (vdist * vdist));
            if (distance < radius) {
                console.log(node.text);
                backend.getRelated(node.val, function(artist) {
                    result.addNode(artist.name, artist.val, node);
                    backend.nodeOnScreen(artist.val);
                });
            }
        });
    });
    return result;
}


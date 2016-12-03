function DiscreteGraph(backend, container) {
	eval(Nutmeg.localScope);
	var radius = 40;
	var ratio = window.devicePixelRatio || 1;
	var width = container.val.offsetWidth * ratio;
	var height = container.val.offsetHeight * ratio;
	var startVel = 1 * ratio;
	var canv = canvas()
		.width(width)
		.height(height)
		.style({width: '100%', height: '100%'});
	container(canv);
	var ctx = canv.val.getContext('2d');
	var result = {};
	var font = "14px Raleway";
	var nodes = [];
	var nodeMass = 500000;
	var reppow = 2.5;
	var equilibrium = radius * 3;
	var attract = 10000;
	var repel = 900000;
	var distscale = 70;
	var drag = 0.01;

	function truncate(text) {
		ctx.font = font;
		var newText = text;
		var letters = text.length;
		while (ctx.measureText(newText).width > radius * 2 - 10) {
			newText = text.substring(0, --letters) + '...';
		}
		return newText;
	}

	result.addNode = function(from, ent) {
		var node = {
			fullText: ent.value,
			text: truncate(ent.value),
			ent: ent,
		};
		node.onclick = function() {
			backend.getRelated(end.id, function(ent) {
				addNode(node, ent);
			});
		}
		if (from === null) {
			node.x = width / 2;
			node.y = height / 2;
			node.dy = 0.05;
			node.dx = 0.05;
		} else {
			node.x = from.x + equilibrium;
			node.y = from.y + equilibrium;
			node.dy = from.dy;
			node.dx = from.dx;
		}
		nodes.push(node);
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
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			for (var j = i; j < nodes.length; j++) {
				var node2 = nodes[j];
				var xdiff = node.x - node2.x;
				var ydiff = node.y - node2.y;
				var dist = Math.sqrt(Math.pow(xdiff, 2) + Math.pow(ydiff, 2)) * distscale;
				var at = attract * (nodeMass * nodeMass) / (dist * dist);
				//var rep = repel * (nodeMass * nodeMass) / (Math.pow(dist, reppow));
				//var at = 0;
				if (dist > radius * 2) {
					var rep = repel * (nodeMass * nodeMass) / Math.pow(dist, reppow);
					var force = at - rep;
					var accel = force/nodeMass;
					var accelx = accel * xdiff / dist;
					var accely = accel * ydiff / dist;
					node.dx -= accelx;
					node.dy -= accely;
					node2.dx += accelx;
					node.dy += accely;
				}
			}
			if (node.dy > drag) node.dy -= drag;
			else if (node.dy < -drag) node.dy += drag;
			if (node.dx > drag) node.dx -= drag;
			else if (node.dx < -drag) node.dx += drag;
		}
		nodes.forEach(function(node) {
			ctx.moveTo(node.x, node.y);
			ctx.arc(node.x,node.y,radius,0,2*Math.PI);
		});
		ctx.fill();
		ctx.fillStyle = "#333";
		nodes.forEach(function(node) {
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
		nodes.forEach(function(node) {
			var hdist = Math.abs(node.x - x);
			var vdist = Math.abs(node.y - y);
			var distance = Math.sqrt((hdist * hdist) + (vdist * vdist));
			if (distance < radius) {
				console.log(node.text);
				backend.getRelated(node.ent.id, function(ent) {
					result.addNode(node, ent);
				});
			}
		});
	});
	return result;
}

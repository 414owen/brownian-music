function DiscreteGraph(backend, container) {
	eval(Nutmeg.localScope);
	var ratio = window.devicePixelRatio || 1;
	var radius = 40 * ratio;
	var width;
	var height;
	var halfwidth;
	var halfheight;
	var startVel = 1 * ratio;
	var canv = canvas()
		.style({width: '100%', height: '100%'});
	function setDimensions() {
		width = container.val.offsetWidth * ratio;
		height = container.val.offsetHeight * ratio;
		halfwidth = width / 2;
		halfheight = height / 2;
		canv.width(width)
		canv.height(height)
	}
	window.onresize = setDimensions;
	setDimensions();
	container(canv);
	var ctx = canv.val.getContext('2d');
	var result = {};
	fontSize = Math.floor(ratio * 14);
	hoverFontSize = Math.floor(fontSize * 1.4);
	var font =  fontSize + "px Raleway";
	var hoverFont = hoverFontSize + "px Raleway";
	var nodes = [];
	var nodeMass = 5;
	var reppow = 2.5;
	var equilibrium = radius * 3;
	var attract = 400;
	var repel = 6000;
	var drag = 0.99;
	var speedlimit = 20;

	function Vec(x, y) {
		this.x = x;
		this.y = y;
	}

	[
		["mul", function(vec2) {
			this.x *= vec2.x;
			this.y *= vec2.y;
		}],
		["mulnum", function(num) {
			this.x *= num;
			this.y *= num;
		}],
		["sub", function(vec2) {
			this.x -= vec2.x;
			this.y -= vec2.y;
		}],
		["add", function(vec2) {
			this.x += vec2.x;
			this.y += vec2.y;
		}],
		["dist", function(vec2) {
			return new Vec(vec2.x - this.x, vec2.y - this.y);
		}],
		["abs", function() {
			return Math.sqrt(this.x * this.x + this.y * this.y);
		}],
		["limit", function(extent) {
			var abs = this.abs();
			if (abs > extent) {
				this.x *= extent/abs;
				this.y *= extent/abs;
			}
		}],
		["changeTowards", function(vec2, amt) {
			var x = vec2.x - this.x;
			var y = vec2.y - this.y;
			this.x += amt * (x / (x + y));
			this.y += amt * (y / (x + y));
		}]
	].forEach(function(op) {
		Vec.prototype[op[0]] = op[1];
	});

	function truncate(text) {
		var newText = text;
		var letters = text.length;
		while (ctx.measureText(newText).width > radius * 2 - 10) {
			newText = text.substring(0, --letters) + '...';
		}
		return newText;
	}

	var ids = {};

	result.addNode = function(from, ent) {
		if (ent == null) return;
		ids[ent.id] = true;
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
			node.pos = new Vec(halfwidth, halfheight);
			node.vel = new Vec(0.05, 0.05);
		} else {
			var dir = Math.random() * 2 * Math.PI;
			node.pos = new Vec(from.pos.x + Math.cos(dir) * radius * 2, from.pos.y + radius * 2 * Math.sin(dir));
			node.vel = new Vec(-Math.cos(dir) * 3, -Math.sin(dir) * 3);
		}
		nodes.push(node);
		return node;
	}

	var centx = halfwidth;
	var centy = halfheight;
	var lastx;
	var lasty;

	var cursorX;
	var cursorY;
	document.onmousemove = function(e){
		cursorX = e.pageX;
		cursorY = e.pageY;
	}

	var hover = "";
	function frame() {
		ctx.beginPath();
		ctx.textAlign = 'center';
		ctx.textBaseline="middle"; 
		ctx.strokeStyle = "#ddd";
		ctx.fillStyle = "#ddd";
		ctx.lineWidth = 2;
		ctx.clearRect(0, 0, width, height);
		var cx = lastx = (cursorX - canv.val.offsetLeft) * ratio + centx;
		var cy = lasty = (cursorY - canv.val.offsetTop) * ratio + centy;
		var hovered = false;
		nodes.forEach(function(node) {
			var pos = node.pos;
			var x = pos.x;
			var y = pos.y;
			if (pointInNode(x, y, cx, cy)) {
				hovered = true;
				hover = node.fullText;
			}
			ctx.moveTo(x, y);
			ctx.arc(x - centx, y - centy, radius, 0, 2*Math.PI);
		});
		ctx.fill();
		if (hovered) {
			ctx.font = hoverFont;
			ctx.fillText(hover, halfwidth, height - fontSize - 10);
		}
		ctx.fillStyle = "#333";
		ctx.font = font;
		nodes.forEach(function(node) {
			var pos = node.pos;
			ctx.fillText(node.text, pos.x - centx, pos.y - centy);
			pos.add(node.vel);
		});
		centx = 0;
		centy = 0;
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			for (var j = i; j < nodes.length; j++) {
				var node2 = nodes[j];
				if (node.ent.id != node2.ent.id) {
					var dist = node.pos.dist(node2.pos);
					var distscaled = dist;
					var delta = dist.abs();
					var at = attract * (nodeMass * nodeMass) / (delta * delta);
					var rep = repel * (nodeMass * nodeMass) / Math.pow(delta, reppow);
					var accel = (at - rep)/nodeMass;
					dist.mulnum(accel);
					node.vel.add(dist);
					node2.vel.sub(dist);
				}
			}
			centx += node.pos.x - halfwidth;
			centy += node.pos.y - halfheight;
			node.vel.mulnum(drag);
			node.vel.limit(speedlimit);
		}
		centx /= nodes.length;
		centy /= nodes.length;
		window.requestAnimationFrame(frame);
	}
	frame();

	function pointInNode(nx, ny, x, y) {
		var hdist = Math.abs(nx - x);
		var vdist = Math.abs(ny - y);
		var distance = Math.sqrt((hdist * hdist) + (vdist * vdist));
		return distance < radius;
	}

	canv.onclick(function(e) {
		var x = lastx = (e.pageX - canv.val.offsetLeft) * ratio + centx;
		var y = lasty = (e.pageY - canv.val.offsetTop) * ratio + centy;
		nodes.forEach(function(node) {
			if (pointInNode(node.pos.x, node.pos.y, x, y)) {
				backend.getRelated(node.ent.id, ids, function(ent) {
					result.addNode(node, ent);
				});
			}
		});
	});
	return result;
}

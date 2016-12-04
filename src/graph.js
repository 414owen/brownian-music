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
	var col1 = '#333';
	var col2 = '#ddd';
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
	var ctx = canv.val.getContext('2d');
	var result = {};
	fontSize = Math.floor(ratio * 14);
	hoverFontSize = Math.floor(fontSize * 1.4);
	var font =  fontSize + "px Raleway";
	var hoverFont = hoverFontSize + "px Raleway";
	var nodes = [];
	var equilibrium = radius * 3;
	var phy = {};

	var phys = [
		['nodeMass', 'Node Mass', 5],
		['attract', 'Attraction Multiplier', 50],
		['repel', 'Repulsion Multiplier', 150],
		['atpow', 'Attraction Inverse Distance Indice', 1.1],
		['reppow', 'Repulsion Inverse Distance Indice', 1.3],
		['drag', 'Velocity Multiplier', 0.97],
		['speedlimit', 'Speed Limit', 20]
	];

	phys.forEach(function(p) {
		phy[p[0]] = p[2];
	});

	var descrip = div.style({color: col2, textAlign: 'left'});
	container(
		canv,
		div.style({color: col2, position: "absolute", top: "4rem", left: "4rem"})(
			phys.map(function(p) {
				function describe() {descrip.clear()(p[1]);}
				return div.style({textAlign: 'left'})(
					input.type('text').style({backgroundColor: col2, border: 'none'})
					.value(phy[p[0]]).onchange(function(e) {
						phy[p[0]] = e.target.value;
					}).onmouseover(describe).onmouseout(descrip.clear)
				);
			}),
			descrip
		)
	);

	function Vec(x, y) {
		this.x = x;
		this.y = y;
	}

	[
		["set", function(x, y) {
			this.x = x;
			this.y = y;
		}],
		["abs", function() {
			return Math.sqrt(this.x * this.x + this.y * this.y);
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

	[
		["mulnum", function(dest, vec1, num) {
			dest.set(vec1.x * num, vec1.y * num);
		}],
		["divnum", function(dest, vec1, num) {
			dest.set(vec1.x / num, vec1.y / num);
		}],
		["mul", function(dest, vec1, vec2) {
			dest.set(vec1.x * vec2.x, vec1.y * vec2.y);
		}],
		["add", function(dest, vec1, vec2) {
			dest.set(vec1.x + vec2.x, vec1.y + vec2.y);
		}],
		["sub", function(dest, vec1, vec2) {
			dest.set(vec1.x - vec2.x, vec1.y - vec2.y);
		}],
		["dist", function(dest, vec1, vec2) {
			dest.set(vec2.x - vec1.x, vec2.y - vec1.y);
		}],
		["lim", function(dest, vec1, extent) {
			var abs = vec1.abs();
			if (abs > extent) {
				dest.set(vec1.x * extent / abs, vec1.y * extent / abs)
			}
		}]
	].forEach(function(op) {
		Vec.prototype[op[0] + "into"] = op[1];
		Vec.prototype[op[0] + "new"] = function(vec2) {
			var n = new Vec(0, 0);
			op[1](n, this, vec2);
			return n;
		}
		Vec.prototype[op[0]] = function(vec2) {
			op[1](this, this, vec2);
			return this;
		}
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
			force: new Vec(0, 0)
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
			node.pos = new Vec(from.pos.x + Math.cos(dir) * 3, from.pos.y + Math.sin(dir) * 3);
			node.vel = new Vec(Math.cos(dir), Math.sin(dir));
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
		ctx.strokeStyle = col2;
		ctx.fillStyle = col2;
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
		ctx.fillStyle = col1;
		ctx.font = font;
		nodes.forEach(function(node) {
			var pos = node.pos;
			ctx.fillText(node.text, pos.x - centx, pos.y - centy);
			node.force.set(0, 0);
		});

		// The position that the center of the view should lerp towards.
		var centTargetX = 0;
		var centTargetY = 0;
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			var nodeMass = phy.nodeMass;
			for (var j = i + 1; j < nodes.length; j++) {
				var node2 = nodes[j];
				var dist = node.pos.distnew(node2.pos);
				var delta = dist.abs();
				if (delta > 0) {
					var distscaled = dist;
					var at = phy.attract * (nodeMass * nodeMass) / Math.pow(delta, phy.atpow);
					var rep = phy.repel * (nodeMass * nodeMass) / Math.pow(delta, phy.reppow);
					var force = at - rep;
					dist.lim(1);
					dist.mulnum(force);
					node.force.add(dist);
					node2.force.sub(dist);
				}
			}
			centTargetX += node.pos.x - halfwidth;
			centTargetY += node.pos.y - halfheight;
			node.vel.add(node.force.divnum(nodeMass));
			node.vel.lim(phy.speedlimit);
			node.vel.mulnum(phy.drag);
			node.pos.add(node.vel);
		}
		if (nodes.length > 0) {
			centTargetX /= nodes.length;
			centTargetY /= nodes.length;
		}

		var lerpVal = 0.05;
		centx = centx * (1 - lerpVal) + centTargetX * lerpVal;
		centy = centy * (1 - lerpVal) + centTargetY * lerpVal;

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
		for (var i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (pointInNode(node.pos.x, node.pos.y, x, y)) {
				backend.getRelated(node.ent.id, ids, function(ent) {
					result.addNode(node, ent);
				});
				break;
			}
		}
	});
	return result;
}

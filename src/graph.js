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
	var col3 = '#daa';
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
		['nodeMass', 'Node Mass', 10],
		['attract', 'Attraction Multiplier', 100],
		['repel', 'Repulsion Multiplier', 500],
		['atpow', 'Attraction Inverse Distance Indice', 1.18],
		['reppow', 'Repulsion Inverse Distance Indice', 1.45],
		['drag', 'Velocity Multiplier', 0.97],
		['speedlimit', 'Speed Limit', 20],
		['lerpVal', 'Camera Pan Rate (lerp value)', 0.05]
	];

	phys.forEach(function(p) {
		phy[p[0]] = p[2];
	});

	var numreg = new RegExp("^[-]?[0-9]+[\.]?[0-9]*$");
	var descrip = div.style({color: col2, backgroundColor: col1, display: 'relative'});
	container(
		canv,
		div.style({color: col2, position: "absolute", top: "4rem", left: "4rem"})(
			phys.map(function(p) {
				var inp = input.type('text').style({backgroundColor: col2, border: 'none'});
				function describe() {descrip.clear()(p[1]);}
				return div.style({textAlign: 'left'})(
					inp.value(phy[p[0]]).onchange(function(e) {
						if (!numreg.test(e.target.value)) {
							inp.style({backgroundColor: col3});
						} else {
							inp.style({backgroundColor: col2});
							phy[p[0]] = e.target.value;
						}
					}).onmouseover(describe).onmouseout(descrip.clear)
				);
			}),
			br(),
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
		ctx.font = font;
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
			fgcol: col2,
			bgcol: col1,
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
			node.vel = new Vec(0,0);
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
		ctx.fillStyle = col2;
		ctx.lineWidth = 0;
		ctx.clearRect(0, 0, width, height);
		var cx = lastx = (cursorX - canv.val.offsetLeft) * ratio + centx;
		var cy = lasty = (cursorY - canv.val.offsetTop) * ratio + centy;
		var hovered = false;
		nodes.forEach(function(node) {
			var pos = node.pos;
			node.force.set(0, 0);
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
		ctx.beginPath();
		ctx.font = font;
		ctx.fillStyle = col1;

		// The position that the center of the view should lerp towards.
		var centTargetX = 0;
		var centTargetY = 0;
		var nodeAmt = nodes.length;
		for (var i = 0; i < nodeAmt; i++) {
			var node = nodes[i];
			var nodeMass = phy.nodeMass;
			var pos = node.pos;
			var vel = node.vel;
			var force = node.force;
			ctx.fillText(node.text, pos.x - centx, pos.y - centy);
			for (var j = i + 1; j < nodeAmt; j++) {
				var node2 = nodes[j];
				var dist = pos.distnew(node2.pos);
				var delta = dist.abs();
				if (delta > 0) {
					var distscaled = dist;
					var at = phy.attract * (nodeMass * nodeMass) / Math.pow(delta, phy.atpow);
					var rep = phy.repel * (nodeMass * nodeMass) / Math.pow(delta, phy.reppow);
					var newforce = at - rep;
					dist.lim(1);
					dist.mulnum(newforce);
					force.add(dist);
					node2.force.sub(dist);
				}
			}
			centTargetX += pos.x - halfwidth;
			centTargetY += pos.y - halfheight;
			vel.add(force.divnum(nodeMass));
			vel.lim(phy.speedlimit);
			vel.mulnum(phy.drag);
			pos.add(vel);
		}
		if (nodes.length > 0) {
			centTargetX /= nodes.length;
			centTargetY /= nodes.length;
		}
		if (hovered) {
			ctx.beginPath();
			ctx.font = hoverFont;
			var dims = ctx.measureText(hover);
			ctx.fillStyle = col1;
			ctx.fillRect(halfwidth - dims.width/2 - 10, height - fontSize - 20 - hoverFontSize / 2, dims.width + 20, hoverFontSize + 50);
			ctx.fill();
			ctx.beginPath();
			ctx.fillStyle = col2;
			ctx.fillText(hover, halfwidth, height - fontSize - 10);
			ctx.fill();
		}
		var lerpVal = phy.lerpVal;
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

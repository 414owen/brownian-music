function DiscreteGraph(backend, container) {
	eval(Nutmeg.localScope);
	var ratio = window.devicePixelRatio || 1;
	var radius = 40 * ratio;
	var width;
	var height;
	var startVel = 1 * ratio;
	var canv = canvas()
		.style({width: '100%', height: '100%'});
	function setDimensions() {
		width = container.val.offsetWidth * ratio;
		height = container.val.offsetHeight * ratio;
		canv.width(width)
		canv.height(height)
	}
	window.onresize = setDimensions;
	setDimensions();
	container(canv);
	var ctx = canv.val.getContext('2d');
	var result = {};
	var font = Math.floor(ratio * 14) + "px Raleway";
	var nodes = [];
	var nodeMass = 5;
	var reppow = 2.5;
	var equilibrium = radius * 3;
	var attract = 100;
	var repel = 1300;
	var drag = 0.01;

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
			node.pos = new Vec(width / 2, height / 2);
			node.vel = new Vec(0.05, 0.05);
		} else {
			node.pos = new Vec(from.pos.x + Math.random() * equilibrium, from.pos.y + equilibrium * Math.random());
			node.vel = new Vec(Math.random() * 3, Math.random() * 3);
		}
		nodes.push(node);
		return node;
	}

	var centx = width/2;
	var centy = height/2;
	var lastx;
	var lasty;

	function frame() {
		ctx.beginPath();
		ctx.font = font;
		ctx.textAlign = 'center';
		ctx.textBaseline="middle"; 
		ctx.strokeStyle = "#ddd";
		ctx.fillStyle = "#ddd";
		ctx.lineWidth = 2;
		ctx.clearRect(0, 0, width, height);
		nodes.forEach(function(node) {
			var pos = node.pos;
			var x = pos.x;
			var y = pos.y;
			ctx.moveTo(x, y);
			ctx.arc(x - centx, y - centy, radius, 0, 2*Math.PI);
		});
		ctx.fill();
		ctx.fillStyle = "#333";
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
			centx += node.pos.x - width/2;
			centy += node.pos.y - height/2;
			node.vel.mulnum(0.98);
		}
		centx /= nodes.length;
		centy /= nodes.length;
		window.requestAnimationFrame(frame);
	}
	frame();

	canv.onclick(function(e) {
		var x = lastx = (e.pageX - canv.val.offsetLeft) * ratio + centx;
		var y = lasty = (e.pageY - canv.val.offsetTop) * ratio + centy;
		console.log(x, y);
		nodes.forEach(function(node) {
			var hdist = Math.abs(node.pos.x - x);
			var vdist = Math.abs(node.pos.y - y);
			var distance = Math.sqrt((hdist * hdist) + (vdist * vdist));
			if (distance < radius) {
				console.log(node.text);
				backend.getRelated(node.ent.id, ids, function(ent) {
					result.addNode(node, ent);
				});
			}
		});
	});
	return result;
}

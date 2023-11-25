class Yield extends Marking{
	constructor(center, directionVector, width, height) {
		super(center, directionVector, width, height);

		this.border = this.poly.segments[2];
		this.type = "yield";
	}

	draw(ctx) {
		this.border.draw(ctx, { width: 5, color: "yellow" });
		ctx.save();
		ctx.translate(this.center.x, this.center.y);
		ctx.rotate(angle(this.directionVector) - Math.PI / 2); // + for left-hand drive
		ctx.scale(1, 3);

		ctx.beginPath();
		ctx.textBaseline = "middle";
		ctx.textAlign = "center";
		ctx.fillStyle = "yellow";
		ctx.font = "bold " + this.height * 0.3 + "px Arial";
		ctx.fillText("YIELD", 0, 1);

		ctx.restore();
	}
}
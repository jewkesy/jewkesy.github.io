class Car{
	constructor(x, y, width, height, controlType, angle = 0, maxSpeed = 4, color = "blue") {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.speed = 0;
		this.acceleration = 0.25;
		this.maxSpeed = maxSpeed;
		this.friction = 0.05;
		this.angle = angle;
		this.damaged = false;

		this.fitness = 0;

		this.useBrain = controlType == "AI";

		if (controlType != "DUMMY") {
			this.sensor = new Sensor(this);
			this.brain = new NeuralNetwork(
				[
					this.sensor.rayCount, 
					6, // 6 = (4 inputs (directions), 1 hidden, 1 output)
					4  // forward, backward, left, right
				]  
			);
		}

		this.controls = new Controls(controlType);

		this.img=new Image();
        this.img.src="data:image/png;base64,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"

        this.mask=document.createElement("canvas");
        this.mask.width=width;
        this.mask.height=height;

        const maskCtx=this.mask.getContext("2d");
        this.img.onload=()=>{
            maskCtx.fillStyle=color;
            maskCtx.rect(0,0,this.width,this.height);
            maskCtx.fill();

            maskCtx.globalCompositeOperation="destination-atop";
            maskCtx.drawImage(this.img,0,0,this.width,this.height);
        }
	}

	update(roadBorders, traffic) {
		if (!this.damaged) {
			this.#move();
			this.fitness += this.speed;
			this.polygon = this.#createPolygon();
			this.damaged = this.#assessDamage(roadBorders, traffic);
		}

		if (this.sensor) {
			this.sensor.update(roadBorders, traffic);

			const offsets = this.sensor.readings.map(
				s => s == null ? 0 : 1-s.offset
			);

			const outputs = NeuralNetwork.feedForward(offsets, this.brain);

			if (this.useBrain) {
				this.controls.forward = outputs[0];
				this.controls.left = outputs[1];
				this.controls.right = outputs[2];
				this.controls.reverse = outputs[3];
			}
		}
	}

	#assessDamage(roadBorders, traffic) {
		for (let i=0; i < roadBorders.length; i++) {
			if (polysIntersect(this.polygon, roadBorders[i])) {
				return true;
			}
		}

		for (let i=0; i < traffic.length; i++) {
			if (polysIntersect(this.polygon, traffic[i].polygon)) {
				return true;
			}
		}
		return false;
	}

	#createPolygon() {
		const points = [];
		const rad = Math.hypot(this.width, this.height)/2;
		const alpha = Math.atan2(this.width, this.height);

		points.push({
			x: this.x - Math.sin(this.angle - alpha) * rad,
			y: this.y - Math.cos(this.angle - alpha) * rad
		});

		points.push({
			x: this.x - Math.sin(this.angle + alpha) * rad,
			y: this.y - Math.cos(this.angle + alpha) * rad
		});

		points.push({
			x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
			y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
		});

		points.push({
			x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
			y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
		});

		return points;
	}

	#move() {
		if (this.controls.forward) {
			this.speed += this.acceleration;
		}
		if (this.controls.reverse) {
			this.speed -= this.acceleration;
		}

		if (this.speed > this.maxSpeed) {
			this.speed = this.maxSpeed;
		}
		if (this.speed < -this.maxSpeed/2) {
			this.speed =- this.maxSpeed/2
		}

		if (this.speed > 0) {
			this.speed -= this.friction;
		}
		if (this.speed < 0) {
			this.speed += this.friction;
		}
		if (Math.abs(this.speed) < this.friction) {
			this.speed = 0;
		}

		if (this.speed != 0) {
			const flip = this.speed > 0 ? 1 : -1
			if (this.controls.left) {
				this.angle += 0.03 * flip;
			}

			if (this.controls.right) {
				this.angle -= 0.03 * flip;
			}
		}

		this.x -= Math.sin(this.angle) * this.speed;
		this.y -= Math.cos(this.angle) * this.speed;

		if (!this.useBrain) {
			if (bestCar.y - this.y < -300) {
				this.y = bestCar.y - 700
				this.x = road.getLaneCenter(getRandomInt(0, 2))
			}
		}
	}


	draw(ctx, drawSensor = false) {
		if(this.sensor && drawSensor){
            this.sensor.draw(ctx);
        }

        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(-this.angle);
        if(!this.damaged){
            ctx.drawImage(this.mask,
                -this.width/2,
                -this.height/2,
                this.width,
                this.height);
            ctx.globalCompositeOperation="multiply";
        }
        ctx.drawImage(this.img,
            -this.width/2,
            -this.height/2,
            this.width,
            this.height);
        ctx.restore();
	}
}

(function() {
	'use strict';

  function Game() {}

  Game.prototype = {
    create: function () {

			//global variables (that really don't need to be here TODO fyi :>DKLFJS((())))
      this.turnStart = true;
			this.turnNumber = 0;
			this.turnTime = Phaser.Timer.SECOND * 1.5;
			this.turnMusic = 0;
			this.musicNumber = 0;
			this.syncPlayWithMusic = false;
			this.actorAction = false;

			//basic game data
      this.game.physics.startSystem(Phaser.Physics.ARCADE);

      this.game.stage.backgroundColor = '#000000';
      this.background = this.game.add.sprite(0,0,'mountains');
      this.game.world.setBounds(0,0,1800,500);

			this.platforms = this.game.add.group();
			this.platform1 = this.game.add.sprite(200, 300, 'platform');
			this.game.physics.arcade.enable(this.platform1);
			this.platform1.body.allowGravity = false;
			this.platform1.body.immovable = true;
			this.platform1.body.checkCollision.down = false;
			this.platform1.body.checkCollision.left = false;
			this.platform1.body.checkCollision.right = false;

			this.platforms.add(this.platform1);

      //initialize sprite from preload constructor then assign physics properties
      this.actors = this.game.add.group();
      for(var i = 1; i < 5; i++) {
        this.sprite = this.game.add.sprite(100 + (300 * i), 100, 'guy');
				this.sprite.actor = true;
        this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
				//add physics data object to keep track of actor movement
				this.sprite.physicsData = {
          veloX : 0,
          veloY : 0,

          ID : i,
					SPEED : 20,
					GRAVITY : 500,
					MAX_SPEED : 500,
					SHOOT : 5000,

					action : false,
					attack : " "
        };

				//sprite physics data for game engine and DOM input
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.scale.setTo(2.5);

				this.animation = this.sprite.animations.add('walk', [0]);
				this.animation.play(10, true);

        this.sprite.inputEnabled = true;
				this.sprite.input.start(0, true);
				this.sprite.input.priorityID = 1;
				this.sprite.events.onInputDown.add(this.clickedSprite, this);
				this.sprite.events.onInputUp.add(this.releaseSprite, this);

        this.sprite.body.collideWorldBounds = true;
        this.sprite.body.gravity.y = this.sprite.physicsData.GRAVITY;

				this.sprite.body.setSize(20, 55, -2, 20);

				this.sprite.body.bounce.set(0.2);
				this.sprite.body.drag.set(20, 20);
				this.sprite.body.moves = false;
        //this.sprite.body.maxVelocity.y = 500;
        this.actors.add(this.sprite);
      }

      this.bitmap = this.game.add.bitmapData(this.game.world.width, this.game.world.height);
      this.bitmap.context.fillStyle = 'rgb(255, 255, 255)';
      this.bitmap.context.strokeStyle = 'rgb(255, 255, 255)';
      this.game.add.image(0, 0, this.bitmap);

      //pausing algorithms LABEL MUTHERTRUCKA
      this.pauseLabel = this.game.add.text(this.game.width - 100, 20, 'play', { font: '28px Arial', fill: '#fff' });
      this.pauseLabel.inputEnabled = true;
      this.pauseLabel.events.onInputDown.add(this.playInit, this);


      //looading samples into samps array to use as sound effects
      this.samp1 = this.game.add.audio('samp1');
      this.samp2 = this.game.add.audio('samp2');
			this.samp3 = this.game.add.audio('gSamp1');
			this.samp4 = this.game.add.audio('gSamp2');
      this.samp5 = this.game.add.audio('gSamp3');

			this.samps = [this.samp1, this.samp2, this.samp3, this.samp4, this.samp5];
      this.game.sound.setDecodedCallback(this.samps, this.startMusic, this);
			this.currentMusicLoop = this.samp5;


      //input algorithms
      this.cursors = this.game.input.keyboard.createCursorKeys();
      this.input.onDown.add(this.click, this);
			//this.input.onHold.add(this.hold, this);

      //initialize the first 'pause'
      this.game.time.events.add(1000, this.pause, this);

    },

    /*
    Main Game Loop operations:
      Pause and resume player actions
      Each turn player can make new input
      The game uses a physics based game engine
        but it plays like an RPG
    TODO: Rewrite + cleanup primary game Loop
          Add more actors and actions (objects in the enviroment and ways the objects interact with other objects)
    */
    update: function () {
			//update frames collisions
			this.game.physics.arcade.collide(this.actors, this.actors, this.friendsCollide, null, this);
			this.game.physics.arcade.collide(this.actors, this.platforms, this.actorsWithEnviroment, null, this);

			if(this.turnStart === false){
				//this is for when the game is NOT paused. Maybe add counter attacks... maybe (depending on game pacing + strategy)
			} else {
				//check for player input.
				this.actors.forEach(function(a) {
					this.actor = a;
					if(this.actor.physicsData.action === true) {
						this.action(this.actor);
					}
				}, this);
				this.pause();
			}

      //camera movement with cursor keys
      if(this.cursors.up.isDown) {this.game.camera.y -= 8;}
      if(this.cursors.down.isDown) {this.game.camera.y += 8;}
      if(this.cursors.left.isDown) {this.game.camera.x -= 16;}
      if(this.cursors.right.isDown) {this.game.camera.x += 16;}


    },

		drawTrajectory: function(actor, angle, loop){
			this.actor = actor;
			this.theta = angle;
			this.calc = this.trajectoryCalculations(this.actor, this.theta);

			this.bitmap.context.clearRect(0,0,this.game.world.width,this.game.world.height);
			this.bitmap.context.fillStyle = 'rgba(255, 255, 255, 0.5)';

			for(this.calc.t; this.calc.t < 1; this.calc.t += 0.03){
				this.calc.x = -this.calc.velocity * this.calc.t * Math.cos(this.theta) * this.calc.correctionFactor;
				this.calc.y = this.calc.velocity * this.calc.t * Math.sin(this.theta) * this.calc.correctionFactor - 0.5 * this.actor.physicsData.GRAVITY * this.calc.t * this.calc.t;
				this.bitmap.context.fillRect(this.calc.x + this.actor.x, this.actor.y - this.calc.y, 3, 3);
			}
			if(!loop && this.actor.attack === "jump") {
				this.jump(this.actor, this.theta, this.calc.velocity);
			} else if (!loop && this.actor.attack === "dash") {

			} else if(!loop && this.actor.attack === "shoot") {

			} else if(!loop && this.actor.attack === "sword") {

			} else {}
			this.bitmap.dirty = true;
		},

		//Mathmatic function for calulating games physics patterns

		trajectoryCalculations: function(actor, theta) {
			this.actor = actor;
			this.SPEED = (this.actor.physicsData.attack === "jump") ? this.actor.physicsData.SPEED : this.actor.physicsData.SHOOT;
			this.MAX_SPEED = (this.actor.physicsData.attack === "jump") ? this.physicsData.MAX_SPEED : this.actor.physicsData.SHOOT;

			this.inputX = this.game.input.activePointer.x + this.game.camera.x;
			this.inputY = this.game.input.activePointer.y + this.game.camera.y;
			this.actorX = this.actor.x;
			this.actorY = this.actor.y;

			this.v = this.calculateVelcity(this.inputX, this.inputY,
																		 this.actorX, this.actorY,
																		 this.actor.physicsData.SPEED,
																		 this.actor.physicsData.MAX_SPEED);

			return {
				i : this.actor.z,
				x : 0,
				y : 0,
				t : 0,
				correctionFactor: 0.99,

				velocity: this.v
			};
		},

		calculateVelcity: function(x1, y1, x2, y2, speed, maxSpeed){
			this.answer = (Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))) * speed;
			this.maxSpeed = maxSpeed;
			if(this.answer >= this.maxSpeed){
				return this.maxSpeed;
			} else {
				return this.answer;
			}
		},


		/*
		WORK IN PROGRESS
		*/

    //input function(s)
    click: function (cPointer, mouseEvent) {
			this.cP = cPointer;
			this.mE = mouseEvent;
			if(this.actorAction) {
				this.actorAction = false;
			}
		},
		// hold: function(a, b) {
		// 	//this.actorAction = false;
		// 	console.log(a, b, 'hey');
		// 	console.log("hello");
		// },
		clickedSprite: function (sprite, pointer){
			this.actor = sprite;
			this.pointer = pointer;
			this.actor.alpha = 0.5;
			this.actor.physicsData.action = true;
			this.actorAction = true;
			this.actor.attack = "jump";
		},
		releaseSprite: function(a, b){
			console.log(a, b);
			this.actor = a;
			this.releasedMPointer = b;
			// this.actorAction = false;
			this.actor.physicsData.attack = "shoot";
		},

		action: function(actor) {
			this.actor = actor;
			this.theta = this.game.physics.arcade.angleToPointer(this.actor);
			this.drawTrajectory(this.actor, this.theta, this.actorAction);
		},

    jump: function(actor, theta, v) {
      this.actor = actor;
			this.theta = theta;
			this.velocity = v;
      this.actor.physicsData.veloX = -Math.cos(this.theta) * this.velocity;
			this.actor.physicsData.veloY = -Math.sin(this.theta) * this.velocity;
			this.actor.physicsData.action = false;
			this.actor.alpha = 1;
    },

		shoot: function() {

		},
		playInit: function() {
			this.syncPlayWithMusic = true;
		},
    play: function() {
      this.turnStart = false;
			this.syncPlayWithMusic = false;
			this.turnNumber++;
			this.music();
      this.actors.forEach(function(a){
        this.actor = a;
				this.actor.body.moves = true;
        this.actor.body.velocity.setTo(this.actor.physicsData.veloX, this.actor.physicsData.veloY);
        this.actor.body.gravity.y = this.actor.physicsData.GRAVITY;
      }, this);
      this.game.time.events.add(this.turnTime, this.pause, this);
    },

    pause: function() {
      if (this.turnStart === false) {
        this.turnStart = true;
        this.actors.forEach(function(a){
					this.actor = a;
          this.actor.physicsData.veloX = a.body.velocity.x;
					this.actor.physicsData.veloY = a.body.velocity.y;

					this.actor.body.moves = false;
					this.actor.body.velocity.setTo(0,0);
				}, this);
			}
		},




    //music function(s)
    startMusic: function() {
      this.samps.shift();
      this.samp1.loopFull(0.1);
			this.samp1.onLoop.add(this.music, this);
    },
		music: function() {
		//this.currentMusicLoop.stop();
			if (this.musicNumber === 12 && this.turnMusic % 8 === 0){
				this.currentMusicLoop.stop();
				this.currentMusicLoop = this.samp3;
				this.currentMusicLoop.play();
				this.musicNumber++;
			} else if (this.musicNumber  === 2 && this.turnMusic % 8 === 0){
				this.currentMusicLoop.stop();
				this.currentMusicLoop = this.samp4;
				this.currentMusicLoop.loopFull();
				this.musicNumber = 0;
				this.turnMusic--;

			} else if(this.turnMusic % 8 === 0 && this.musicNumber === 0){
				this.currentMusicLoop.stop();
				this.currentMusicLoop = this.samp5;
				this.currentMusicLoop.loopFull();
				this.musicNumber++;
			}else {
			}

			this.turnMusic++;

			if(this.syncPlayWithMusic) {this.play();}
		},


    //collision function(s)
    friendsCollide: function(a, b) {
      a.body.velocity.x = -1000;
      b.body.velocity.x = 1000;
    },
		actorsWithEnviroments: function(actor, enviroment){
			this.actor = actor;
			this.enviroment = enviroment;
		},



		render: function() {
			//this.game.debug.inputInfo(32, 32);
			//this.game.debug.pointer(this.game.input.activePointer);
			this.actors.forEach(function(a){
				//this.game.debug.bodyInfo(a, 32, 32);
        this.game.debug.body(a);

			}, this);
		},
  };
  window['test2'] = window['test2'] || {};
  window['test2'].Game = Game;
}());

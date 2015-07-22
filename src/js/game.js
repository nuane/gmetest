(function() {
	'use strict';

  function Game() {}

  Game.prototype = {
    create: function () {

      this.turnStart = true;
			this.actorAction = false;
      this.game.physics.startSystem(Phaser.Physics.ARCADE);

      this.game.stage.backgroundColor = '#000000';
      this.background = this.game.add.sprite(0,0,'mountains');
      this.game.world.setBounds(0,0,1800,500);

      //initialize sprite from preload constructor then assign physics properties
      this.actors = this.game.add.group();
      for(var i = 1; i < 3; i++) {
        this.sprite = this.game.add.sprite(200 * i, 300 * i, 'ball');
				this.sprite.actor = true;
        this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
				//add physics data object to keep track of actor movement
				this.sprite.physicsData = {
          veloX : 0,
          veloY : 0,
					
          ID : i,
					SPEED : 500,
					GRAVITY : 1000,
					
					action : false,
          trajectory : this.graphic
        };
		
        this.sprite.anchor.setTo(0.5, 0.5);
        this.sprite.scale.setTo(0.2);
		
        this.sprite.inputEnabled = true;
				this.sprite.input.priorityID = 1;
				this.sprite.events.onInputDown.add(this.clickedSprite, this);

        this.sprite.body.collideWorldBounds = true;
        this.sprite.body.gravity.y = this.sprite.physicsData.GRAVITY;
        //this.sprite.body.maxVelocity.y = 500;
		
        this.graphic = this.game.add.graphics(this.sprite.x, this.sprite.y);
        this.graphic.lineStyle(8, 0xFF9A00);
		
        this.actors.add(this.sprite);
      }

      this.bitmap = this.game.add.bitmapData(this.game.world.width, this.game.world.height);
      this.bitmap.context.fillStyle = 'rgb(255, 255, 255)';
      this.bitmap.context.strokeStyle = 'rgb(255, 255, 255)';
      this.game.add.image(0, 0, this.bitmap);

      //pausing algorithms LABEL MUTHERTRUCKA
      this.pauseLabel = this.game.add.text(this.game.width - 100, 20, 'play', { font: '28px Arial', fill: '#fff' });
      this.pauseLabel.inputEnabled = true;
      this.pauseLabel.events.onInputDown.add(this.play, this);


      //looading samples into samps array to use as sound effects
      this.samp1 = this.game.add.audio('samp1');
      this.samp2 = this.game.add.audio('samp2');
      this.samps = [this.samp1, this.samp2];
      this.game.sound.setDecodedCallback(this.samps, this.start, this);

      //input algorithms
      this.cursors = this.game.input.keyboard.createCursorKeys();
      this.input.onDown.add(this.click, this);

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
      if(this.cursors.up.isDown) this.game.camera.y -= 8;
      if(this.cursors.down.isDown) this.game.camera.y += 8;
      if(this.cursors.left.isDown) this.game.camera.x -= 16;
      if(this.cursors.right.isDown) this.game.camera.x += 16;

      
    },
		
		drawTrajectory: function(actor, angle, loop){
			this.actor = actor;
			this.theta = angle * (-1);
			
			this.calc = {
				i : this.actor.z,
				x : 0,
				y : 0,
				t : 0,
				correctionFactor: 0.99
			};
			
			//TODO: clean code here for trajectory
			this.bitmap.context.clearRect(0,0,this.game.width,this.game.height);
			this.bitmap.context.fillStyle = 'rgba(255, 255, 255, 0.5)';
			
			for(this.calc.t; this.calc.t < 1; this.calc.t += 0.03){
				this.calc.x = this.actor.physicsData.SPEED * this.calc.t * Math.cos(this.theta) * this.calc.correctionFactor;
				this.calc.y = this.actor.physicsData.SPEED * this.calc.t * Math.sin(this.theta) * this.calc.correctionFactor - 0.5 * this.actor.physicsData.GRAVITY * this.calc.t * this.calc.t;
				this.bitmap.context.fillRect(this.calc.x + this.actor.x, this.actor.y - this.calc.y, 3, 3);
			}
			if(!loop) {
				this.actor.physicsData.veloX = Math.cos(this.theta) * this.actor.physicsData.SPEED;
				this.actor.physicsData.veloY = -Math.sin(this.theta) * this.actor.physicsData.SPEED;
				this.actor.physicsData.action = false;
				this.actor.alpha = 1;
			}
			this.bitmap.dirty = true;
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
		clickedSprite: function (sprite, pointer){
			this.actor = sprite;
			this.pointer = pointer;
			this.actor.alpha = 0.5;
			this.actor.physicsData.action = true;
			this.actorAction = true;
		},
		action: function(actor) {
			this.actor = actor;
			this.actor.rotation = this.game.physics.arcade.angleToPointer(this.actor);
			this.drawTrajectory(this.actor, this.actor.rotation, this.actorAction);
		},
	
    jump: function(inputPoint, actors) {
      this.actors = actors;

      this.actors.forEach(function(item){
        this.actor = item;
        this.v = this.game.physics.arcade.angleToPointer(item);
        this.actor.body.velocity.x = Math.cos(this.v) * this.actor.physicsData.SPEED;
        this.actor.body.velocity.y = Math.sin(this.v) * this.actor.physicsData.SPEED;
      }, this);
    },

    play: function() {
      this.turnStart = false;
      this.samp2.play();
      this.actors.forEach(function(a){
        this.actor = a;
        this.actor.body.velocity.x = this.actor.physicsData.veloX;
        this.actor.body.velocity.y = this.actor.physicsData.veloY;
        this.actor.body.gravity.y = 1000;
      }, this);
      this.game.time.events.add(500, this.pause, this);
    },

    pause: function() {
      if (this.turnStart === false) {
        this.turnStart = true;
        this.actors.forEach(function(a){
          a.physicsData.veloX = a.body.velocity.x; 
					a.physicsData.veloY = a.body.velocity.y;
        }, this);
      } else {
				this.actors.forEach(function(item){
					this.item = item;
					this.item.body.velocity.x = 0;
					this.item.body.velocity.y = 0;
					this.item.body.gravity.y = 0;
				}, this);
			}
		},
			
			
			render: function() {
      //this.game.debug.inputInfo(32, 32);
      //this.game.debug.pointer(this.game.input.activePointer);
    },

    //music function(s)
    start: function() {
      this.samps.shift();
      this.samp1.loopFull(1);
    },

    //collision function(s)
    friendsCollide: function(a, b) {
      a.body.velocity.x = -10;
      b.body.velocity.x = 10;
    },	
  };
  window['test2'] = window['test2'] || {};
  window['test2'].Game = Game;
}());
var a = function() {
  'use strict';

  function Preloader() {
    this.asset = null;
    this.ready = false;
  }

  Preloader.prototype = {
    preload: function () {
      this.asset = this.add.sprite(this.game.width * 0.5 - 110, this.game.height * 0.5 - 10, 'preloader');
      this.load.setPreloadSprite(this.asset);

      //this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
      this.loadResources();

      this.ready = true;
    },

    loadResources: function () {
      this.load.image('ball', 'assets/ball.png');
			this.load.spritesheet('guy', 'assets/animations1.png', 32, 65, 60);

      this.load.image('mountains', 'assets/mountainsA.png');
      this.load.image('platform', 'assets/platform.png');

      //load audio

			this.game.load.audio('samp1', 'assets/samp1.mp3');
      this.game.load.audio('samp2', 'assets/samp2.mp3');
			this.game.load.audio('gSamp1', 'assets/guitar_samp1.mp3');
      this.game.load.audio('gSamp2', 'assets/guitar_samp2.mp3');
			this.game.load.audio('gSamp3', 'assets/guitar_samp3.mp3');

		},

    create: function () {

    },

    update: function () {
      // if (!!this.ready) {
        this.game.state.start('menu');
      // }
    },

    onLoadComplete: function () {
      // this.ready = true;
    }
  };
  window['test2'] = window['test2'] || {};
  window['test2'].Preloader = Preloader;
  console.log(window['test2']);
}();

console.log(a);

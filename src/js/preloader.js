(function() {
  'use strict';

  function Preloader() {
    this.asset = null;
    this.ready = false;
  }

  Preloader.prototype = {
    preload: function () {
      this.asset = this.add.sprite(this.game.width * 0.5 - 110, this.game.height * 0.5 - 10, 'preloader');
      this.load.setPreloadSprite(this.asset);

      this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
      this.loadResources();

      this.ready = true;
    },

    loadResources: function () {
      this.load.image('ball', 'assets/ball.png');
      this.load.image('mountains', 'assets/mountains.png');

      //load audio
      this.game.load.audio('samp1', 'assets/samp1.mp3');
      this.game.load.audio('samp2', 'assets/samp2.mp3');
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
}());
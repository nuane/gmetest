window.addEventListener('load', function () {
  'use strict';

  var ns = window['test2'];
  var game = new Phaser.Game(640, 480, Phaser.AUTO, 'test2-game');
  game.state.add('boot', ns.Boot);
  game.state.add('preloader', ns.Preloader);
  game.state.add('menu', ns.Menu);
  game.state.add('game', ns.Game);
  /* yo phaser:state new-state-files-put-here */
  game.state.start('boot');
}, false);

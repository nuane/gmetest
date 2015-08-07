(function() {
  'use strict';

  function Menu() {}

  var gameObject = (function(){
    //function GameObject = {}
    var a = "hello all";
  }());

  Menu.prototype = {
    create: function () {
      var text = this.add.text(this.game.width * 0.5, this.game.height * 0.5,
        'MENU', {font: '42px Arial', fill: '#ffffff', align: 'center'
      });
      text.anchor.set(0.5);
      this.input.onDown.add(this.onDown, this);
      console.log(gameObject);

    },

    update: function () {
    },

    onDown: function () {
      this.game.state.start('game', true, false, "hello", 42);
    }
  };

  window['test2'] = window['test2'] || {};
  window['test2'].Menu = Menu;
}());

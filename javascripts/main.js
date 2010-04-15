(function(){
  
  var isStarted = false;
  
  var g_sounds = {};
  
  var Main = function() {
    
    return {
      init: function() {
        $('a.letsMix').click(function(){
          $('.intro').hide();
          $('#main').show();
          $('audio.letsMix')[0].play();
          isStarted = true;
        });
      }
    }
  }();
  $(document).ready(Main.init);
  
  var Visualizer = function() {
    var g_node = null;
    var g_ctx = null;
    
    var effect = {
      woo: function() {
        g_ctx.fillStyle = '#FFF';
        g_ctx.fillText('Woo!', 100+Math.rand()*100, 100+Math.rand()*100);
      }
      
    };
    
    return {
      sound: function(key) {
        switch(key) {
          case 77: effect.woo(); break;
          
        };
      },
      init: function() {
        g_node = $('#visualizer');
        g_ctx = g_node[0].getContext('2d');
        g_ctx.fillStyle = 'black';
        g_ctx.fillRect(0,0,g_node.width(),g_node.height());
      }
    }
  }();
  $(document).ready(Visualizer.init);
  
  var Sounds = function() {
    
    /**
     * uri : audio resource
     * letter : int code of the letter to bind
     */
    var addSound = function(uri, letter) {
      var node = $('<audio src="'+uri+'"></audio>');
      $('#preLoader').append(node);
      if(!g_sounds[letter]) g_sounds[letter] = {};
      g_sounds[letter].node = node;
    };
    
    var addAllSounds = function(sounds) {
      for(var a in sounds)
        addSound(sounds[a], a);
    };
    
    var bindAll = function() {
      
      $(window).keydown(function(e) {
        var sound = g_sounds[e.keyCode];
        if(isStarted && sound) {
          var player = sound.node[0];
          player.pause();
          player.currentTime=0;
          sound.node[0].play();
          Visualizer.sound(e.keyCode);
        }
      });
      
    };
    
    return {
      init: function() {
        // azertyuiop : [65, 90, 69, 82, 84, 89, 85, 73, 79, 80]
        // qsdfghjklm : [81, 83, 68, 70, 71, 72, 74, 75, 76, 77]
        // wxcvbn : [87, 88, 67, 86, 66, 78]
        
        addAllSounds({
          65: "sounds/kick/Kick11.wav",
          90: "sounds/kick/Kick46.wav",
          81: "sounds/kick/Kick38.wav",
          83: "sounds/kick/Kick29.wav",
          87: "sounds/kick/Kick14.wav",
          88: "sounds/kick/Kick15.wav",
          
          69: "sounds/snare/Snare30.wav",
          82: "sounds/snare/Snare.wav",
          68: "sounds/snare/Snare79.wav",
          70: "sounds/snare/Snare23.wav",
          67: "sounds/snare/Snare63.wav",
          86: "sounds/snare/Snare35.wav",
          
          84: "sounds/clap/Clap8.wav",
          89: "sounds/clap/Clap16.wav",
          71: "sounds/clap/Clap6.wav",
          72: "sounds/clap/Clap21.wav",
          
          66: "sounds/hithat/HithatC24.wav",
          78: "sounds/hithat/HithatO12.wav",
          
          74: "sounds/fx/Fx10.wav",
          75: "sounds/fx/Fx72.wav",
          
          85: "sounds/cymbal/Cymbal14.wav",
          73: "sounds/cymbal/Cymbal5.wav",
          
          79: "sounds/vocal/give_me_the_beat.wav",
          80: "sounds/vocal/go.wav",
          76: "sounds/vocal/Vocal27.wav",
          77: "sounds/vocal/wo.wav"
        });
        bindAll();
      }
    }
  }();
  $(document).ready(Sounds.init);
  
}());

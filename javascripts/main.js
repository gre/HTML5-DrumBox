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
  
  /**
    *  Base64 encode / decode
    *  http://www.webtoolkit.info/
    **/
  var Base64 = {
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
      var output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;
      input = Base64._utf8_encode(input);
      while (i < input.length) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++);
        chr3 = input.charCodeAt(i++);
        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;
        if (isNaN(chr2)) {
          enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
          enc4 = 64;
        }
        output = output +
        this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
        this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
      }
      return output;
    },

    // public method for decoding
    decode : function (input) {
      var output = "";
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
      while (i < input.length) {
        enc1 = this._keyStr.indexOf(input.charAt(i++));
        enc2 = this._keyStr.indexOf(input.charAt(i++));
        enc3 = this._keyStr.indexOf(input.charAt(i++));
        enc4 = this._keyStr.indexOf(input.charAt(i++));
        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;
        output = output + String.fromCharCode(chr1);
        if (enc3 != 64) {
          output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
          output = output + String.fromCharCode(chr3);
        }
      }
      output = Base64._utf8_decode(output);
      return output;
    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
      string = string.replace(/\r\n/g,"\n");
      var utftext = "";
      for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);
        if (c < 128) {
          utftext += String.fromCharCode(c);
        }
        else if((c > 127) && (c < 2048)) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        }
        else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }
      return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
      var string = "";
      var i = 0;
      var c = c1 = c2 = 0;
      while ( i < utftext.length ) {
        c = utftext.charCodeAt(i);
        if (c < 128) {
          string += String.fromCharCode(c);
          i++;
        }
        else if((c > 191) && (c < 224)) {
          c2 = utftext.charCodeAt(i+1);
          string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
          i += 2;
        }
        else {
          c2 = utftext.charCodeAt(i+1);
          c3 = utftext.charCodeAt(i+2);
          string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
          i += 3;
        }
      }
      return string;
    }
  };
  
  var Config = CONFIG = function() {
    /* FORMAT : separate by \n and :
      <nb of cut>
      <bpm>
      # for each line :
      <letter num>:<volume (0.0 to 1.0)>:<line data>
      
      line data represente the checked input.
      For the moment we will represent it by 0 and 1 line.
      ex : 00100100100100 ..
      
     */
    
    var setConfig = function(conf) {
      /*
      conf.nbCut
      conf.bpm
      conf.tracks
      conf.tracks[i].{letter,volume,data}
      */
      console.log(conf);
    };
    var getConfig = function() {
      return {
        nbCut: 16,
        bpm: 80,
        tracks: [
          {letter:65, volume: 0.5, data: "0010010010010010"},
          {letter:66, volume: 0.75, data: "0010010010010010"},
          {letter:67, volume: 1.0, data: "0010010010010010"}
        ]
      };
    };
    
    /**
     * return a base64 str
     */
    var export = function() {
      var conf = getConfig();
      var str = conf.nbCut+"\n"+conf.bpm;
      for(var l in conf.tracks) {
        var track = conf.tracks[l];
        str+=("\n"+track.letter+":"+track.volume+":"+track.data);
      }
      return Base64.encode(str);
    };
    var import = function(str_base64) {
      var conf = {tracks: []};
      var str = Base64.decode(str_base64);
      var spl = str.split('\n');
      if(spl.length<3)
        return -1;
      var nbCut = conf.nbCut = parseInt(spl[0]);
      var bpm = conf.bpm = parseInt(spl[1]);
      if(!nbCut || !bpm || bpm<0 || nbCut<0)
        return -2;
      for(var l=2; l<spl.length; ++l) {
        var confTrack = {};
        var line = spl[l];
        var lineSpl = line.split(':');
        if(lineSpl.length!=3)
          return -3;
        var letter = confTrack.letter = parseInt(lineSpl[0]);
        var volume = confTrack.volume = parseFloat(lineSpl[1]);
        confTrack.data = lineSpl[2];
        if(!letter || letter<0 || isNaN(volume) || volume<0.0 || volume>1.0)
          return -4;
        conf.tracks.push(confTrack);
      }
      setConfig(conf);
      return 0;
    };
    return {
      export: export,
      import: import
    }
  }();
  
}());

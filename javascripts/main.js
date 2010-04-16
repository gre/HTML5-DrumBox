(function(){
  
  var isStarted = false;
  
  var g_sounds = {};
  
  var g_trackLoopCut = null;
  var g_trackBpm = null;
  
  var Main = function() {
    
    var tpl_check = function(checked) {
      return '<td class="check"><input type="checkbox"'+(!checked?'':'checked="checked"')+'/></td>';
    };
    var tpl_switcher = function(sound) {
      return '<td class="switcher">'+
      '<button class="setTrackLetter">'+(sound?'Change':'Define')+'</button>'+
      '</td>';
    };
    var tpl_soundLabel = function(sound) {
      if(!sound) return '<td class="soundLabel"></td>';
      return '<td class="soundLabel">'+
      '<audio src="'+sound.uri+'"></audio>'+
      '<span>'+sound.name+'</span>'+
      '</td>';
    };
    
    var tpl_track = function(letter) {
      var sound = g_sounds[letter];
      var html = "";
      for(var i=0; i<g_trackLoopCut; ++i)
        html += tpl_check();
      return '<tr class="track" rel="'+(letter||"")+'">'+
      tpl_switcher(sound)+
      tpl_soundLabel(sound)+
      html+
      '</tr>';
    };
    
    var addTrack = function(letter) {
      var sound = letter ? g_sounds[letter] : null;
      var tpl = tpl_track(letter);
      $('#drumbox .tracks').append(tpl);
    };
    
    var setTrackLetter = function(track, letter) {
      $(track).replaceWith(tpl_track(letter));
    };
    
    var updateTrackLoopCut = function() {
      var val = g_trackLoopCut = parseInt($('#cutNumber :selected').val());
      $('#drumbox .track').each(function(){
        var checks = $('.check',this);
        var overflow = checks.length - val;
        if(overflow<0) {
          while(overflow!==0) {
            $(this).append(tpl_check());
            ++overflow;
          }
        }
        else if(overflow>0) {
          $(checks.splice(val)).remove();
        }
      });
    };
    
    var updateTrackBpm = function() {
      g_trackBpm = parseInt($('#BpmCutLoop :selected').val());
    };
    
    return {
      init: function() {
        $('a.letsMix').click(function(){
          $('.intro').hide();
          $('#main').show();
          $('audio.letsMix')[0].play();
          isStarted = true;
        });
        
        updateTrackLoopCut();
        $('#cutNumber').change(updateTrackLoopCut);
        
        updateTrackBpm();
        $('#BpmCutLoop').change(updateTrackBpm);
        
        $('#drumbox .addTrack').click(function() {
          addTrack();
        });
        
        $('#drumbox .track .setTrackLetter').live('click', function() {
          var track = $(this).parents().filter('.track');
          $(this).removeClass('setTrackLetter').html("press&nbsp;key...");
          $(document).one('touchsound', function(e,data){
            setTrackLetter(track, data);
          });
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
    var addSound = function(uri, letter, cat) {
      var node = $('<audio src="'+uri+'"></audio>');
      $('#preLoader').append(node);
      if(!g_sounds[letter]) g_sounds[letter] = {};
      g_sounds[letter].node = node;
      g_sounds[letter].uri = uri;
      g_sounds[letter].cat = cat;
      g_sounds[letter].name = cat+'_'+letter;
    };
    
    var addAllSounds = function(sounds) {
      for(var a in sounds)
        addSound(sounds[a][0], a, sounds[a][1]);
    };
    
    var bindAll = function() {
      
      $(window).keydown(function(e) {
        var sound = g_sounds[e.keyCode];
        if(isStarted && sound) {
          var player = sound.node[0];
          player.pause();
          player.currentTime=0;
          $(document).trigger('touchsound',e.keyCode);
          $(document).trigger('sound',e.keyCode);
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
        
        // refactor that : g_sounds will be init by a simple affectation. only others things are made here, like node...
        addAllSounds({
          65: ["sounds/kick/Kick11.wav", 'kick'],
          90: ["sounds/kick/Kick46.wav", 'kick'],
          81: ["sounds/kick/Kick38.wav", 'kick'],
          83: ["sounds/kick/Kick29.wav", 'kick'],
          87: ["sounds/kick/Kick14.wav", 'kick'],
          88: ["sounds/kick/Kick15.wav", 'kick'],
          
          69: ["sounds/snare/Snare30.wav", 'snare'],
          82: ["sounds/snare/Snare.wav", 'snare'],
          68: ["sounds/snare/Snare79.wav", 'snare'],
          70: ["sounds/snare/Snare23.wav", 'snare'],
          67: ["sounds/snare/Snare63.wav", 'snare'],
          86: ["sounds/snare/Snare35.wav", 'snare'],
          
          84: ["sounds/clap/Clap8.wav", 'clap'],
          89: ["sounds/clap/Clap16.wav", 'clap'],
          71: ["sounds/clap/Clap6.wav", 'clap'],
          72: ["sounds/clap/Clap21.wav", 'clap'],
          
          66: ["sounds/hithat/HithatC24.wav", 'hithat'],
          78: ["sounds/hithat/HithatO12.wav", 'hithat'],
          
          74: ["sounds/fx/Fx10.wav", 'fx'],
          75: ["sounds/fx/Fx72.wav", 'fx'],
          
          85: ["sounds/cymbal/Cymbal14.wav", 'cymbal'],
          73: ["sounds/cymbal/Cymbal5.wav", 'cymbal'],
          
          79: ["sounds/vocal/give_me_the_beat.wav", 'vocal'],
          80: ["sounds/vocal/go.wav", 'vocal'],
          76: ["sounds/vocal/Vocal27.wav", 'vocal'],
          77: ["sounds/vocal/wo.wav", 'vocal']
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
    
    var setConfig = function(conf) {
      console.log(conf);
    };
    var getConfig = function() {
      var tracks = [];
      $('#drumbox .tracks .track').each(function(){
        var letter = $(this).attr('rel');
        if(letter) {
          var audio = $('audio', this)[0];
          var data = [];
          $('.check input').each(function(){
            data.push($(this).is(':checked'));
          });
          tracks.push({letter: letter, volume: audio.volume, data: data});
        }
      });
      var conf = {
        nbCut: g_trackLoopCut,
        bpm: g_trackBpm,
        tracks: tracks
      };
      return conf;
    };
    
    var decodeTrackLineData = function(str, len) {
      var n = decodeInt(str);
      var array = [];
      for(var i=0; i<len; ++i) {
        array.push(n&1?true:false);
        n=n>>1;
      }
      return array.reverse();
    };
    
    var encodeTrackLineData = function(arrayOfBoolean) {
      var n = 0;
      for(var i=0; i<arrayOfBoolean.length; ++i) {
        n=n<<1;
        n|=(arrayOfBoolean[i] ? 1 : 0);
      }
      return encodeInt(n);
    };
    
    var encodeInt = function(int) {
      return String.fromCharCode(int);
    };
    var decodeInt = function(str) {
      return str.charCodeAt(0);
    };
    
    /**
     * return a base64 str
     */
    var export = function() {
      var conf = getConfig();
      var str = encodeInt(conf.nbCut)+"\n"+encodeInt(conf.bpm);
      for(var l in conf.tracks) {
        var track = conf.tracks[l];
        str+=("\n"+encodeInt(track.letter)+":"+encodeInt(Math.floor(track.volume*100.0))+":"+encodeTrackLineData(track.data));
      }
      return Base64.encode(str);
    };
    var import = function(str_base64) {
      var conf = {tracks: []};
      var str = Base64.decode(str_base64);
      var spl = str.split('\n');
      if(spl.length<2)
        return -1;
      var nbCut = conf.nbCut = decodeInt(spl[0]);
      var bpm = conf.bpm = decodeInt(spl[1]);
      if(!nbCut || !bpm || bpm<0 || nbCut<0)
        return -2;
      for(var l=2; l<spl.length; ++l) {
        var confTrack = {};
        var line = spl[l];
        var lineSpl = line.split(':');
        if(lineSpl.length!=3)
          return -3;
        var letter = confTrack.letter = decodeInt(lineSpl[0]);
        var volume = confTrack.volume = decodeInt(lineSpl[1])/100.0;
        confTrack.data = decodeTrackLineData(lineSpl[2], nbCut);
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

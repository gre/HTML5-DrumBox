(function(){
  
  var isStarted = false;
  
  var g_sounds = {
/* A */ 65: {uri:"sounds/kick/Kick11.wav", name:'kick_1', cat:'kick'},
/* Z */ 90: {uri:"sounds/kick/Kick46.wav", name:'kick_2', cat:'kick'},
/* Q */ 81: {uri:"sounds/kick/Kick38.wav", name:'kick_3', cat:'kick'},
/* S */ 83: {uri:"sounds/kick/Kick29.wav", name:'kick_4', cat:'kick'},
/* W */ 87: {uri:"sounds/kick/Kick14.wav", name:'kick_5', cat:'kick'},
/* X */ 88: {uri:"sounds/kick/Kick15.wav", name:'kick_6', cat:'kick'},

/* E */ 69: {uri:"sounds/snare/Snare30.wav", name:'snare_1', cat:'snare'},
/* R */ 82: {uri:"sounds/snare/Snare.wav", name:'snare_2', cat:'snare'},
/* D */ 68: {uri:"sounds/snare/Snare79.wav", name:'snare_3', cat:'snare'},
/* F */ 70: {uri:"sounds/snare/Snare23.wav", name:'snare_4', cat:'snare'},
/* C */ 67: {uri:"sounds/snare/Snare63.wav", name:'snare_5', cat:'snare'},
/* V */ 86: {uri:"sounds/snare/Snare35.wav", name:'snare_6', cat:'snare'},

/* T */ 84: {uri:"sounds/clap/Clap8.wav", name:'clap_1', cat:'clap'},
/* Y */ 89: {uri:"sounds/clap/Clap16.wav", name:'clap_2', cat:'clap'},
/* G */ 71: {uri:"sounds/clap/Clap6.wav", name:'clap_3', cat:'clap'},
/* H */ 72: {uri:"sounds/clap/Clap21.wav", name:'clap_4', cat:'clap'},

/* B */ 66: {uri:"sounds/hithat/HithatC24.wav", name:'hithat_1', cat:'hithat'},
/* N */ 78: {uri:"sounds/hithat/HithatO12.wav", name:'hithat_2', cat:'hithat'},

/* J */ 74: {uri:"sounds/fx/Fx10.wav", name:'fx_1', cat:'fx'},
/* K */ 75: {uri:"sounds/fx/Fx72.wav", name:'fx_2', cat:'fx'},

/* U */ 85: {uri:"sounds/cymbal/Cymbal14.wav", name:'cymbal_1', cat:'cymbal'},
/* I */ 73: {uri:"sounds/cymbal/Cymbal5.wav", name:'cymbal_2', cat:'cymbal'},

/* O */ 79: {uri:"sounds/vocal/give_me_the_beat.wav", name:'give_me', cat:'vocal'},
/* P */ 80: {uri:"sounds/vocal/go.wav", name:'go', cat:'vocal'},
/* L */ 76: {uri:"sounds/vocal/Vocal27.wav", name:'shout_amb', cat:'vocal'},
/* M */ 77: {uri:"sounds/vocal/wo.wav", name:'wo', cat:'vocal'}
  };
  
  var g_trackLoopCut = null;
  var g_bpm = null;
  var g_cursorNode = null;
  var g_tracksNode = null;
  
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
    var tpl_soundVolume = function(sound) {
      if(!sound) return '<td class="soundVolume"></td>';
      return ('<td class="soundVolume">'+
      '<div class="slider"></div>'+
      '</td>');
    };
    
    var tpl_track = function(letter) {
      var sound = g_sounds[letter];
      var html = "";
      for(var i=0; i<g_trackLoopCut; ++i)
        html += tpl_check();
      return '<tr class="track" rel="'+(letter||"")+'">'+
      tpl_switcher(sound)+
      tpl_soundLabel(sound)+
      tpl_soundVolume(sound)+
      html+
      '</tr>';
    };
    
    var bindTrack = function(node) {
      node = $(node);
      $('.soundVolume .slider',node).slider({
        min: 0, 
        max: 100, 
        value: 100,
        slide: function(event, ui) {
          $('audio',$(this).parents().filter('.track'))[0].volume = ui.value/100.0;
        },
        change: function(){
          updateBookmark();
        }
      });
      return node;
    };
    
    var addTrack = function(letter) {
      var sound = letter ? g_sounds[letter] : null;
      var node = bindTrack(tpl_track(letter));
      g_tracksNode.append(node);
      return node;
    };
    
    var setTrackLetter = function(track, letter) {
      $(track).replaceWith(bindTrack(tpl_track(letter)));
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
      g_bpm = parseInt($('#BpmCutLoop :selected').val());
    };
    
    var updateBookmark = function() {
      var path = window.location.href.substring(0,window.location.href.length-window.location.search.length);
      $('#bookmarkThis').val(path+'?mix='+Config.export());
    };
    
    //// drumbox player
    
    var g_cycleInterval = null;
    
    var g_loopCutNumLast = -1;
    var g_loopCutNum = 0;
    var g_loopCutProgress = 0;
    
    var updateCursorPosition = function() {
      var track = $('.track:first .check').eq(g_loopCutNum); // to improve
      var baseLeft = track.offset().left+g_loopCutProgress*track.width();
      var height = g_tracksNode.height();
      var baseTop = g_tracksNode.offset().top;
      g_cursorNode.height(height).css({
        left: Math.floor(baseLeft)+'px',
        top: Math.floor(baseTop)+'px'
      });
    };
    
    var playCurrentLoopCut = function() {
      $('#drumbox .tracks .track').each(function() {
        var isChecked = $('.check input', this).eq(g_loopCutNum).is(':checked');
        if(isChecked) {
          var audio = $('audio',this)[0];
          if(audio) {
            audio.pause();
            audio.currentTime=0;
            audio.play();
          }
        }
      });
    };
    
    var playDrumbox = function() {
      if(g_cycleInterval) clearInterval(g_cycleInterval);
      
      var beginTime = new Date().getTime();
      
      var cycle = function() {
        var now = new Date().getTime();
        var bpm = g_bpm;
        var nbLoopCut = g_trackLoopCut;
        
        var beatDuration = 60000 / bpm; //ms
        
        var loopDuration = Math.floor(nbLoopCut*beatDuration);
        var relativeNow = now % loopDuration;
        g_loopCutNum = Math.floor((nbLoopCut*relativeNow)/loopDuration);
        g_loopCutProgress = (relativeNow-g_loopCutNum*beatDuration)/beatDuration;
        updateCursorPosition();
        
        // loop cut changed
        if(g_loopCutNumLast!=g_loopCutNum) {
          playCurrentLoopCut();
          g_loopCutNumLast = g_loopCutNum;
        }
      };
      
      g_cycleInterval = setInterval(cycle, 20);
      
    };
    var pauseDrumbox = function() {
      if(g_cycleInterval) clearInterval(g_cycleInterval);
    };
    
    return {
      addTrack: addTrack,
      init: function() {
        g_cursorNode = $('#cursor');
        g_tracksNode = $('#drumbox .tracks');
        
        
        updateTrackLoopCut();
        $('#cutNumber').change(updateTrackLoopCut);
        
        updateTrackBpm();
        $('#BpmCutLoop').change(updateTrackBpm);
        
        $('#drumbox .addTrack').click(function() {
          addTrack();
        });
        
        $('#drumbox .playDrumbox').click(playDrumbox);
        $('#drumbox .pauseDrumbox').click(pauseDrumbox);
        
        $('#drumbox .track .setTrackLetter').live('click', function() {
          var track = $(this).parents().filter('.track');
          $(this).removeClass('setTrackLetter').html("press&nbsp;key...");
          $(document).one('touchsound', function(e,data){
            setTrackLetter(track, data);
            updateBookmark();
          });
        });
        
        $('#cutNumber, #BpmCutLoop, #drumbox .check input').live('change', updateBookmark);
        updateBookmark();
        $('#bookmarkThis').click(function(){
          updateBookmark();
          this.select();
        });
        
        
        var start = function(){
          $('.intro').hide();
          $('#main').show();
          var audio = $('audio.letsMix')[0];
          audio.volume = 0.5;
          audio.play();
          isStarted = true;
        };
        
        var conf = null;
        var indexOfMix = window.location.href.indexOf('mix=');
        if(indexOfMix)
          conf = window.location.href.substring(indexOfMix+4);
        
        if(conf && Config.import(conf)==0)
          start();
        else
          $('a.letsMix').one('click', start);
        
      }
    }
  }();
  $(document).ready(Main.init);
  
  var Visualizer = function() {
    var g_node = null;
    var g_ctx = null;
    var c_width, c_height;
    
    var effect = {
      woo: function() {
        g_ctx.fillStyle = '#FFF';
        g_ctx.fillText('Woo!', Math.random()*c_width, Math.random()*c_height);
      }
      
    };
    
    return {
      sound: function(key) {
        c_width = g_node.width();
        c_height = g_node.height();
        switch(key) {
          case 77: effect.woo(); break;
          
        };
      },
      init: function() {
        g_node = $('#visualizer');
        
        c_width = g_node.width();
        c_height = g_node.height();
        g_ctx = g_node[0].getContext('2d');
        g_ctx.fillStyle = 'black';
        g_ctx.fillRect(0,0,c_width,c_height);
        setInterval(function(){
          g_ctx.fillStyle = 'black';
          g_ctx.globalAlpha = 0.1;
          g_ctx.fillRect(0,0,c_width,c_height);
          g_ctx.globalAlpha = 1;
        }, 100);
      }
    }
  }();
  $(document).ready(Visualizer.init);
  
  var Sounds = function() {
    
    var bindAll = function() {
      for(var a in g_sounds) {
        var node = $('<audio src="'+g_sounds[a].uri+'"></audio>');
        $('#preLoader').append(node);
        g_sounds[a].node = node;
      }
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
  
  var Config = function() {
    
    var setConfig = function(conf) {
      var g_trackLoopCut = conf.nbCut;
      var g_bpm = conf.bpm;
      $('#cutNumber option[value='+conf.nbCut+']').attr('selected','selected');
      $('#BpmCutLoop option[value='+conf.bpm+']').attr('selected','selected');
      $('#drumbox .tracks').empty();
      for(var t in conf.tracks) {
        var track = conf.tracks[t];
        var node = Main.addTrack(track.letter);
        $('.slider', node).slider('value', Math.floor(100*track.volume));
        $('audio', node)[0].volume = track.volume;
        for(var d=0; d<track.data.length; ++d) {
          if(track.data[d])
            $('.check input',node).eq(d).attr('checked','checked');
        }
      }
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
        bpm: g_bpm,
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
    
    // int must be a integer between 0 and 2^31-1. negative int are not supported.
    var encodeInt = function(int) {
      var pow2_16_minus1 = 65535;
      if(int>pow2_16_minus1)
        return String.fromCharCode((int>>16)&pow2_16_minus1)+String.fromCharCode(int&pow2_16_minus1);
      return String.fromCharCode(int);
    };
    
    var decodeInt = function(str) {
      if(str.length==1)
        return str.charCodeAt(0);
      return str.charCodeAt(0)<<16+str.charCodeAt(1);
    };
    
    /**
     * return a base64 str
     */
    var export = function() {
      var conf = getConfig();
      var str = encodeInt(conf.nbCut)+encodeInt(conf.bpm);
      for(var l in conf.tracks) {
        var track = conf.tracks[l];
        str+=("\n"+encodeInt(track.letter)+encodeInt(Math.floor(track.volume*100.0))+encodeTrackLineData(track.data));
      }
      return Base64.encode(str);
    };
    var import = function(str_base64) {
      var conf = {tracks: []};
      var str = Base64.decode(str_base64);
      var spl = str.split('\n');
      var nbCut = conf.nbCut = decodeInt(spl[0][0]);
      var bpm = conf.bpm = decodeInt(spl[0][1]);
      if(!nbCut || !bpm || bpm<0 || nbCut<0)
        return -2;
      for(var l=1; l<spl.length; ++l) {
        var confTrack = {};
        var line = spl[l];
        if(line.length!=3)
          return -3;
        var letter = confTrack.letter = decodeInt(line[0]);
        var volume = confTrack.volume = decodeInt(line[1])/100.0;
        confTrack.data = decodeTrackLineData(line.substring(2), nbCut);
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

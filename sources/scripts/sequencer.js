function Sequencer()
{
  var target = this;

  this.follower = new Follower();
  this.sequence = {length:32}

  this.start = function()
  {
    console.log("Started Sequencer");

    var table = document.getElementById("sequencer-table");
    var tr = document.createElement("tr");
    for (var t = 0; t < 32; t++) {
      var tr = document.createElement("tr");
      tr.id = "spr"+t;
      tr.style.lineHeight = "15px";
      for (var i = 0; i < marabu.channels; i++) {
        var td = document.createElement("td");
        td.id = "sc" + i + "t" + t;
        td.textContent = "-";
        td.addEventListener("mousedown", this.sequence_mouse_down, false);
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
  }

  this.build = function()
  {
    return "<div id='sequencer' style='display:block; vertical-align:top; float:left'><table class='tracks' id='sequencer-table'></table></div>";
  }

  this.sequence_mouse_down = function(e)
  {
    var i = parseInt(e.target.id.slice(2,3));
    var r = parseInt(e.target.id.slice(4));

    marabu.selection.instrument = i;
    marabu.selection.track = r;
    marabu.update();
  }

  this.update = function()
  {
    for (var t = 0; t < 32; ++t)
    {
      var tr = document.getElementById("spr" + t);
      tr.className = t == marabu.selection.track ? "bl" : "";

      for (var i = 0; i < marabu.channels; ++i)
      {
        var o = document.getElementById("sc" + i + "t" + t);
        var pat = marabu.song.pattern_at(i,t);
        var t_length = marabu.song.song().endPattern-2;
        // Default
        o.className = t > t_length ? "fl" : "fm";
        o.textContent = pat ? to_hex(pat) : "-";

        // Selection
        if(i >= marabu.loop.x && i < marabu.loop.x + marabu.loop.width && t >= marabu.loop.y && t < marabu.loop.y + marabu.loop.height){ o.className = "b_special f_special"; }
        else if(t == marabu.selection.track && i == marabu.selection.instrument){ o.className = "fh"; }
      }
    }
  }
}
function Sequencer()
{
  var target = this;

  this.el = null;
  this.scrollbar_el = null;
  this.follower = new Follower();
  this.length = 128;

  this.start = function()
  {
    console.log("Started Sequencer");

    this.el = document.getElementById("sequencer");
    this.scrollbar_el = document.getElementById("scrollbar");

    var table = document.getElementById("sequencer-table");
    var tr = document.createElement("tr");
    for (var t = 0; t < this.length; t++) {
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

    this.el.addEventListener('wheel', function(e)
    {
      e.preventDefault();
      marabu.sequencer.el.scrollTop += e.wheelDeltaY * -0.25;
      marabu.sequencer.scrollbar_el.style.height = 480 * (marabu.sequencer.el.scrollTop/(marabu.sequencer.el.scrollHeight * 0.75))+"px";
    }, false);
  }

  this.build = function()
  {
    return "<div id='sequencer'><table class='tracks' id='sequencer-table'></table></div><yu id='scrollbar'></yu>";
  }

  this.sequence_mouse_down = function(e)
  {
    var c = e.target.id.substr(2)

    var i = parseInt(c.split("t")[0]);
    var r = parseInt(c.split("t")[1]);

    marabu.selection.instrument = i;
    marabu.selection.track = r;
    marabu.sequencer.follower.stop();
    marabu.update();
  }

  this.update = function()
  {
    for (var t = 0; t < this.length; ++t)
    {
      var tr = document.getElementById("spr" + t);
      var t_length = marabu.song.song().endPattern-1;
      tr.className = t == marabu.selection.track ? "bl" : "";

      for (var i = 0; i < marabu.channels; ++i)
      {
        var o = document.getElementById("sc" + i + "t" + t);
        var pat = marabu.song.pattern_at(i,t);
        // Default
        o.className = t > t_length ? "fl" : "fm";
        o.textContent = pat ? to_hex(pat) : (t % 8 == 0 && i == 0 ? ">" : "-");
        // Selection
        if(marabu.loop.is_active && i >= marabu.loop.x && i < marabu.loop.x + marabu.loop.width+1 && t >= marabu.loop.y && t < marabu.loop.y + marabu.loop.height){ o.className = "b_inv f_inv"; }
        else if(t == marabu.selection.track && i == marabu.selection.instrument){ o.className = "fh"; }
      }
    }
  }
}
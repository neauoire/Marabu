function Sequencer_Follower()
{
  this.timer = -1;
  this.first_row = 0;
  this.last_row = 0;
  this.first_col = 0;
  this.last_col = 0;

  this.prev = -1;

  this.start = function()
  {
    this.timer = setInterval(this.update, 16);
    console.log("follower","start");
  }

  this.update = function()
  {
    var t = app.song.mAudio_timer().currentTime();

    if (app.song.mAudio().ended || (app.song.mAudio().duration && ((app.song.mAudio().duration - t) < 0.1))) {
      clearInterval(this.timer);
      this.timer = -1;
      return;
    }

    var n = Math.floor(t * 44100 / app.song.song().rowLen);
    var r = n % 32;

    if(n != this.prev){
      app.selection.row = r;
      app.update();
      this.prev = n;
    }
  }

  this.stop = function()
  {
    console.log("follower","stop");
    clearInterval(this.timer);
    this.timer = -1;
    lobby.apps.marabu.update();
  }
}
function Follower()
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
    var t = marabu.song.mAudio_timer().currentTime();

    if (marabu.song.mAudio().ended || (marabu.song.mAudio().duration && ((marabu.song.mAudio().duration - t) < 0.1))) {
      clearInterval(this.timer);
      this.timer = -1;
      return;
    }

    var n = Math.floor(t * 44100 / marabu.song.song().rowLen);
    var r = n % 32;

    if(n != this.prev){
      marabu.selection.row = r;
      marabu.update();
      this.prev = n;
    }
  }

  this.stop = function()
  {
    console.log("follower","stop");
    clearInterval(this.timer);
    this.timer = -1;
    marabu.update();
  }
}
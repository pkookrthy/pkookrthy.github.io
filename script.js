var game_wid = 24;
var game_cols = ["#10414D", "#D3E3DD"];
var teh_dist = function (x, y) {
  var t_x = x.pos_x - y.pos_x;
  var t_y = x.pos_y - y.pos_y;
  return t_x * t_x + t_y * t_y;
};
class tehball {
  constructor(_id) {
    this.pos_x = _id == 0 ? 8 : 24;
    this.pos_y = _id == 0 ? 8 : 24;
    var gg = 1.2;
    this.v_x = _id == 0 ? gg : -gg;
    this.v_y = _id == 0 ? gg : gg;

    this.my_id = _id;

    this.radius = 0.35;
    this.col = game_cols[1 - this.my_id];
  }
  pos_x_i() {
    return Math.floor(this.pos_x);
  }
  pos_y_i() {
    return Math.floor(this.pos_y);
  }
  pos_x_vi() {
    return Math.floor(this.pos_x + this.v_x);
  }
  pos_y_vi() {
    return Math.floor(this.pos_y + this.v_y);
  }

  step(now, delta, teh_game) {
    var _nears = teh_game.get_near_cells(this);
    var cur_col = -1;
    var col_dist = 10000000;
    for (var i in _nears) {
      // _nears[i].zoorcol = "red";
      if (_nears[i].my_ball != this) {
        var tmp_dist = _nears[i].collides_with(this);
        if (tmp_dist < col_dist) {
          cur_col = i;
          col_dist = tmp_dist;
        }
      }
    }
    if (cur_col > -1) {
      _nears[cur_col].change_ground(now, teh_game.balls[this.my_id]);
      // this.pos_x -= this.v_x;
      // this.pos_y -= this.v_y;
      this.change_dir(_nears[cur_col]);
    }
    if (this.pos_x < 0) {
      this.pos_x = 0.01;
      this.v_x *= -1;
    }
    if (this.pos_y < 0) {
      this.pos_y = 0.01;

      this.v_y *= -1;
    }
    if (this.pos_x > teh_game.dim_x - this.radius) {
      this.pos_x = teh_game.dim_x - this.radius;

      this.v_x *= -1;
    }
    if (this.pos_y > teh_game.dim_y - this.radius) {
      this.pos_y = teh_game.dim_y - this.radius;

      this.v_y *= -1;
    }

    this.pos_x += (this.v_x * delta) / 100;
    this.pos_y += (this.v_y * delta) / 100;
    // this.pos_x += (Math.random() - 0.5) / 1000;
    // this.pos_y += (Math.random() - 0.5) / 1000;
  }
  change_dir(_cell) {
    var t_x = _cell.pos_x - this.pos_x;
    var t_y = _cell.pos_y - this.pos_y;
    t_x *= -1;
    t_y *= -1;
    var ww = 45 / 2;
    var gg = ((Math.atan(t_y / t_x) * 180) / Math.PI + 360) % 360;
    if (gg >= 3 * 90 + ww || gg <= ww) {
      this.v_x *= -1;
    } else if (gg >= 90 - ww && gg <= 90 + ww) {
      this.v_y *= -1;
    } else if (gg >= 3 * 90 - ww && gg <= 3 * 90 + ww) {
      this.v_y *= -1;
    } else if (gg >= 2 * 90 - ww && gg <= 2 * 90 + ww) {
      this.v_x *= -1;
    } else {
      this.v_x *= -1;
      this.v_y *= -1;
    }
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.col;
    ctx.arc(
      this.pos_x * game_wid,
      this.pos_y * game_wid,
      this.radius * game_wid,
      0,
      Math.PI * 2,
      true
    );
    ctx.fill();
  }
}
class tehcell {
  constructor(a, b, c) {
    this.pos_x = a;
    this.pos_y = b;
    this.last_bonk = 0;

    this.width = game_wid;
    this.height = game_wid;
    this.my_ball = c;
    this.zoorcol = undefined;
  }
  change_ground(now, x) {
    if (now - this.last_bonk < 20) return;
    this.my_ball = x;
    this.last_bonk = now;
  }
  step() {}
  step_end() {
    this.zoorcol = undefined;
  }
  collides_with(_ball) {
    var t_x = _ball.pos_x + _ball.v_x - this.pos_x;
    var t_y = _ball.pos_y + _ball.v_y - this.pos_y;
    if (
      t_x * t_x + t_y * t_y <
      (_ball.radius * 1 + 0.5) * (_ball.radius * 1 + 0.5)
    ) {
      return t_x * t_x + t_y * t_y;
    }
    return 100000;
  }
  draw(ctx) {
    ctx.fillStyle = this.zoorcol ? this.zoorcol : game_cols[this.my_ball.my_id];
    ctx.fillRect(
      this.pos_x * game_wid, //+ game_wid / 2,
      this.pos_y * game_wid, //+ game_wid / 2,
      this.width,
      this.height
    );
    ctx.fillStyle = "black";
    // ctx.beginPath();
    // ctx.rect(
    //   this.pos_x * this.width + this.width / 2,
    //   this.pos_y * this.height + this.height / 2,
    //   this.width,
    //   this.height
    // );
    // ctx.stroke();
  }
}
class tehgame {
  constructor(a, b) {
    this.dim_x = a ? a : 32;
    this.dim_y = b ? b : 32;
    this.balls = [new tehball(0), new tehball(1)];
    this.board = {};
    for (var i = 0; i < this.dim_x; i++) {
      this.board[i] = {};
      for (var j = 0; j < this.dim_y; j++) {
        this.board[i][j] = new tehcell(i, j, this.choose_ball(i, j));
      }
    }
  }
  choose_ball(i, j) {
    if (i < this.dim_x / 2) {
      return this.balls[0];
    }
    return this.balls[1];
  }
  inbound(x, y) {
    if (x >= 0 && y >= 0 && x < this.dim_x && y < this.dim_y) return true;
    return false;
  }
  get_near_cells(_ball) {
    var res = [];

    for (var i = _ball.pos_x_i() - 4; i < _ball.pos_x_vi() + 4; i++) {
      for (var j = _ball.pos_y_i() - 4; j < _ball.pos_y_vi() + 4; j++) {
        if (this.inbound(i, j)) {
          if (
            teh_dist(_ball, this.board[i][j]) <
            _ball.radius * 5 * _ball.radius * 5
          )
            res.push(this.board[i][j]);
        }
      }
    }
    return res;
  }
  step(now, delta) {
    for (var i in this.balls) {
      this.balls[i].step(now, delta, this);
    }
  }
  step_end() {
    // for (var i in this.balls) {
    //   this.balls[i].step_end(this);
    // }
    for (var i in this.board) {
      for (var j in this.board[i]) {
        this.board[i][j].step_end();
      }
    }
  }
  draw(ctx) {
    // ctx.arc(75+this.dim_x, 75, 50, 0, Math.PI * 2, true); // Outer circle
    // ctx.moveTo(110, 75);
    // ctx.arc(75, 75, 35, 0, Math.PI, false);  // Mouth (clockwise)
    // ctx.moveTo(65, 65);
    // ctx.arc(60, 65, 5, 0, Math.PI * 2, true);  // Left eye
    // ctx.moveTo(95, 65);
    // ctx.arc(90, 65, 5, 0, Math.PI * 2, true);  // Right eye
    // ctx.stroke();
    for (var i in this.board) {
      for (var j in this.board[i]) {
        this.board[i][j].draw(ctx);
      }
    }

    for (var i in this.balls) {
      this.balls[i].draw(ctx);
    }
  }
}
var last_time = 0;

tehloop = function (now, cnv, ctx, tg) {
  delta = now - last_time;
  last_time = now;
  ctx.clearRect(0, 0, cnv.width, cnv.height);
  tg.step(now, delta);
  tg.draw(ctx);
  tg.step_end();
  window.requestAnimationFrame((x) => tehloop(x, cnv, ctx, tg));
};
var canvas = document.getElementById("canvas");
canvas.width = 800;
canvas.height = 800;

if (canvas.getContext) {
  var ctx = canvas.getContext("2d");
}
window.requestAnimationFrame((x) => tehloop(x, canvas, ctx, new tehgame()));

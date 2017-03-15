import React, { Component } from 'react';

export default class Cube extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { eleven: { scene } } = this.props;
    // 依場景更改網格的顏色
    var sheet = document.styleSheets[0]; // get style sheet somehow
    var rules = sheet.rules;
    if( scene == 'king' ) {
      sheet.insertRule('.cube:before { background-color: rgba(145, 123, 83, .2); }', rules.length);
      sheet.insertRule('.cube:after  { background-color: rgba(145, 123, 83, .2); }', rules.length);
    }
    if( scene == 'pirate' ) {
      sheet.insertRule('.cube:before { background-color: rgba(77, 139, 154, .2); }', rules.length);
      sheet.insertRule('.cube:after  { background-color: rgba(77, 139, 154, .2); }', rules.length);
    }
    if( scene == 'forest' ) {
      sheet.insertRule('#game-board-main { background-color: rgba(97, 131, 61, 0.05); }', rules.length);
      sheet.insertRule('#kyu .cube { background-color: rgba(97, 131, 61, 0.05); }', rules.length);
      sheet.insertRule('.cube:before { background-color: rgba(255,255,255,.2); }', rules.length);
      sheet.insertRule('.cube:after  { background-color: rgba(255,255,255,.2); }', rules.length);
      sheet.insertRule('#kyu .cube:before { background-color: #fff; }', rules.length);
      sheet.insertRule('#kyu .cube:after  { background-color: #fff; }', rules.length);
    }
    if( scene == 'alchemy' ) {
      sheet.insertRule('.cube:before { background-color: rgba(176, 93, 44, .2); }', rules.length);
      sheet.insertRule('.cube:after  { background-color: rgba(176, 93, 44, .2); }', rules.length);

      for(let x=2; x<=4; x++) {
        for(let y=4; y<=19; y++) { this.alchemy_bgc( sheet, rules, x, y ) }
      }
      for(let x=6; x<=8; x++) {
        for(let y=0; y<=12; y++) { this.alchemy_bgc( sheet, rules, x, y ) }
      }
      for(let x=11; x<=13; x++) {
        for(let y=7; y<=19; y++) { this.alchemy_bgc( sheet, rules, x, y ) }
      }
      for(let x=15; x<=17; x++) {
        for(let y=0; y<=15; y++) { this.alchemy_bgc( sheet, rules, x, y ) }
      }
    }
  }

  alchemy_bgc( sheet, rules, x, y ) {
    sheet.insertRule(`.cube.x${x}y${y} { background-color: rgba(176, 93, 44, .2); }`, rules.length);
    sheet.insertRule(`.cube.x${x}y${y}:before { background-color: rgba(176, 93, 44, 0); }`, rules.length);
    sheet.insertRule(`.cube.x${x}y${y}:after  { background-color: rgba(176, 93, 44, 0); }`, rules.length);
  }

  defineCubeClass( who, ppl ) {
    const { yoko, tate, eleven: { _id, kyu, gameover, pattern, lastStepDots, breakOnOff, fungi } } = this.props;
    const colorClass = [ '', 'white', 'green', 'blue', 'purple', 'golden' ];
    let cubeClass = 'cube '+'x'+tate+'y'+yoko+' ';
    // 基本線格
    if( tate === 0 ) cubeClass+=' cube-left ';
    if( tate === 19 ) cubeClass+=' cube-right ';
    if( yoko === 0 ) cubeClass+=' cube-top ';
    if( yoko === 19 ) cubeClass+=' cube-bottom ';
    if( pattern[yoko][tate] !=0 ) cubeClass+=colorClass[pattern[yoko][tate]];
    if( breakOnOff == 'on' && who == ppl ) cubeClass+=' shooting ';

    // 處理上一步驟的灰底提示
    lastStepDots.map(cv => {
      if( tate==cv[0] && yoko==cv[1] ) cubeClass+=' lastStepDots ';
    });

    // 處理生長香菇的綠底提示
    fungi.map(cv => {
      if( tate==cv[0] && yoko==cv[1] ) cubeClass+=' fungi ';
    });

    return cubeClass;
  }


// -----------------------------------------------------------------------------
  putDot( who, ppl, skill, flashing, scene ) {
    const { tate, yoko, eleven: { _id, kyu, gameover, pattern, breakOnOff } } = this.props;

    if( gameover ) return;
    if( who != ppl ) return; // 不是輪到該玩家 不能下子
    if( flashing ) return;   // 動畫中 不能下子

    // 如果獵人技能開啟 則已經有子的地方 要摧毀子
    if( pattern[ yoko ][ tate ] !=0 && breakOnOff=='on' && skill[who] ) {
      Meteor.call('eleven.break', _id, tate, yoko, who, skill);
      Meteor.call('eleven.breakSwitch', _id, 'off');
      return;
    } else if( pattern[ yoko ][ tate ] ==0 && breakOnOff=='on' && skill[who] ) {
      // 沒有子的地方 就取消技能施展
      Meteor.call('eleven.breakSwitch', _id, 'off');
      return;
    }

    if( tate==0 || tate==19 || yoko==0 || yoko==19 ) return; // 邊框不能填子

    // 已經有子的地方 不能再填子
    let notSameDot = true;
    kyu[ who ].map( (cv, i) => {
      // 都回傳 true 就表示都沒重複, 只要有一個 false 就是有重疊
      if( !this.doupletStyle( cv, i, pattern, yoko, tate, '1px solid red' ) )
      notSameDot = false;
    })
    if( !notSameDot ) return;

    // 填子
    if( notSameDot ) {
      Meteor.call('eleven.putdot', _id, tate, yoko, kyu, pattern, who, scene);
    }

    // 填子後, 才讓 hoverKyu 消失
    let hoverKyu = document.getElementById('hoverKyu');
    hoverKyu.style.visibility = 'hidden';

    // 計算分數
    this.calcScores( who, skill );
  }

  calcScores( who, skill ) {
    const { tate, yoko, eleven: { _id, kyu, pattern } } = this.props;
    // 直線得分 ----------------------------------------
    let tateWinArrs = [];
    for(let k=-1; k<2; k++) { // k : -1,0,1 直線有三條要判斷
      let numArr = [];
      // 先把 kyu 放進去 pattern
      kyu[ who ].map( (cv, i) => {
        if( i%3 == k+1 && cv !=0 ) {
          let y = Math.floor(i/3)-1;
          numArr.push( yoko+y )
        }
      })
      // 檢查 pattern 的直線連線狀況
      pattern.map( (cv, i) => {
        if( cv[ tate+k ] !=0 ) numArr.push(i);
      })
      //console.log('numArr',numArr);
      let WinArr = this.arrNumInLine(numArr);
      if( WinArr ) {
        WinArr.map(cv => {
          var temp = [];
          cv.map(el => {
            temp.push([tate+k, el]);
          });
          tateWinArrs.push( temp ); // 超過 5 個連線的話 加入tateWinArrs
        });
      }
    }

    // 橫線得分 ----------------------------------------
    let yokoWinArrs = [];
    for(let k=-1; k<2; k++) { // k : -1,0,1 直線有三條要判斷
      let numArr = [];
      // 先把 kyu 放進去 pattern
      kyu[ who ].map( (cv, i) => {
        if( Math.floor(i/3) == k+1 && cv !=0 ) {
          let x = i%3 -1;
          numArr.push( tate+x )
        }
      })
      // 檢查 pattern 的橫線連線狀況
      pattern.map( (cv, i) => {
        if( i == yoko+k ) {
          cv.map( (el, j) =>{ if( el!=0 ) numArr.push(j) })
        }
      })
      //console.log('numArr',numArr);
      let WinArr = this.arrNumInLine(numArr);
      if( WinArr ) {
        WinArr.map(cv => {
          var temp = [];
          cv.map(el => {
            temp.push([el, yoko+k]);
          });
          yokoWinArrs.push( temp ); // 超過 5 個連線的話 加入yokoWinArrs
        });
      }
    }

    // \線得分 ----------------------------------------
    // pattern 必須是填子後的棋盤
    let newPattern = pattern;
    kyu[ who ].map( (cv, i) => {
      if(cv!=0) {
        let x = i%3 -1; // 左邊數到右邊 -1,0,1
        let y = Math.floor(i/3) -1; // 上面數到下面 -1,0,1
        newPattern[ yoko+y ][ tate+x ] = cv;
      }
    });
    let leftTopWinArrs = this.arrNumInTilt( tate, yoko, newPattern, 'left_top' );
    // /線得分 ----------------------------------------
    let rightTopWinArrs = this.arrNumInTilt( tate, yoko, newPattern, 'right_top' );

    // 所有的 combo 陣列
    let dotsArrs = tateWinArrs.concat(yokoWinArrs, leftTopWinArrs, rightTopWinArrs );

    // 計算分數
    Meteor.call('eleven.calcPoints', _id, dotsArrs, who, skill);
  }


// -----------------------------------------------------------------------------
  arrNumInLine(arr) {
    // 判斷陣列裡 是否有超過 5 個連成一線的數字, 有的話 傳回數字陣列
    var count = [], multicount = [];

    arr
      .sort((a,b) => a-b)
      .map((cv, i, arr) => {
        if( i==1 && (cv === (arr[0] + 1)) ) { // 連線成功的情況一
          count.push(arr[0], arr[1]);

        } else if( i>1 && (cv === (arr[i-1] + 1)) ) { // 連線成功的情況二
          count.push(cv);

        } else if( count.length<5 ) { // 連線中斷的情況一
          count = i==0 ? [] : [cv];
        } else if( count.length>=5 ) { // 連線中斷的情況二
          multicount.push(count);
          count = [cv];
        }
        // 一直到陣列迭代最後 連線都還是成功的情況
        if( i==arr.length-1 && count.length>=5 ) multicount.push(count);
      })

    return multicount.length==0 ? false : multicount;
  }

  arrNumInTilt( tate, yoko, pattern, direction ) { // pattern 是填子後的棋盤
    // 給定一個點的座標 判斷通過該點的斜線 是否有超過 5 個連成一線的子, 有的話 傳回座標陣列
    const origin = this.findTiltOrigin( tate, yoko, direction );
    var count = [], multicount = [];

    // 往左下/右下方找
    origin.map(cv => {
      let x = cv[0], y = cv[1];
      count = [];
      while( (direction=='left_top'?x<=19:0<=x) && y<=19 ) {
        if( pattern[y][x] !=0 ) {
          count.push([x,y]);
        } else if( count.length <5 ) {
          count = [];
        } else if( count.length >=5 ) {
          multicount.push(count);
          count = [];
        }
        x = (direction=='left_top'?x+1:x-1); y++;
      }
    })

    return multicount;
  }

  findTiltOrigin( tate, yoko, direction ) {
    // 給定一個 kyu 的中心座標 回傳最 左上 or 右上 的 5 個斜線起始點
    const t = tate, y = yoko;
    let xyArr = [];
    if( direction == 'left_top' ) {
      xyArr = [ [t-1,y+1], [t-1,y], [t,y], [t,y-1], [t+1,y-1] ];
    } else if( direction == 'right_top' ) {
      xyArr = [ [t-1,y-1], [t,y-1], [t,y], [t+1,y], [t+1,y+1] ];
    }

    let tiltOrigin = xyArr.map(cv => {
      let x = cv[0], y = cv[1];
      if( direction == 'left_top' ) {
        while( x>0 && y>0 ) {
          x--; y--;
        }
      } else if( direction == 'right_top' ) {
        while( 19>x && y>0 ) {
          x++; y--;
        }
      }
      return [x,y];
    });
    return tiltOrigin;
  }

// -----------------------------------------------------------------------------
  doupletStyle( cv, i, pattern, yoko, tate, styles ) { // 處理重疊的子的判斷與樣式
    let notSameDot = true; // 判斷有沒有重疊的子
    if(cv!=0) {
      let x = i%3 -1; // 左邊數到右邊 -1,0,1
      let y = Math.floor(i/3) -1; // 上面數到下面 -1,0,1
      if( pattern[ yoko+y ][ tate+x ] !=0 ) {
        // 有重疊的子
        notSameDot = false;

        const theclass = '.cube.'+'x'+(tate+x)+'y'+(yoko+y)+' .gem';
        const douplet = document.querySelector(theclass);
        douplet.style.backgroundColor = styles;
      }
    }
    return notSameDot;
  }

  handleMouseOver( who, ppl, flashing, e ) {
    const { tate, yoko, eleven: { _id, kyu, gameover, pattern, breakOnOff } } = this.props;
    if( who == ppl && !flashing && breakOnOff=='off' ) {
      const hoverKyu = document.getElementById('hoverKyu');

      if( gameover ) return;
      if( tate==0 || tate==19 || yoko==0 || yoko==19 ) return; // 邊框不能填子

      hoverKyu.style.visibility = 'visible';
      hoverKyu.style.top = (yoko*30-30)+'px';
      hoverKyu.style.left = (tate*30-30)+'px';

      // 重疊的子 要有額外警訊
      kyu[ who ].map( (cv, i) => {
        this.doupletStyle( cv, i, pattern, yoko, tate, 'rgba(244, 67, 54, .5)' );
      })
    }
  }

  handleMouseOut( who, ppl, e ) {
    if( who == ppl ) {
      const { tate, yoko, eleven: { _id, kyu, pattern } } = this.props;
      let hoverKyu = document.getElementById('hoverKyu');
      hoverKyu.style.visibility = 'hidden';

      if( tate==0 || tate==19 || yoko==0 || yoko==19 ) return; // 邊框不能填子

      // 清除重疊的子的 style
      kyu[ who ].map( (cv, i) => {
        this.doupletStyle( cv, i, pattern, yoko, tate, 'transparent' );
      })
    }
  }

// -----------------------------------------------------------------------------
  render() {
    const { yoko, tate, eleven: { _id, kyu, playersOnOff, scoreInfo, flashdots, skill, pattern, scene } } = this.props;
    const colorClass = [ '', 'white', 'green', 'blue', 'purple', 'golden' ];

    let ppl; // 現在進來的人是 玩家一 玩家二 還是其他人（包含有登入或沒登入）
    if( !Meteor.user() ) {
      ppl = 'other';
    } else if( playersOnOff[0]==Meteor.user().username ) {
      ppl = 0;
    } else if( playersOnOff[1]==Meteor.user().username ) {
      ppl = 1;
    } else {
      ppl = 'other';
    }

    let who = (scoreInfo.length)%2; // 現在輪到 玩家一(0) 還是 玩家二(1)
    let flashing = flashdots.length == 0 ? false : true;

    let gemClass = 'gem ';
    if( pattern[yoko][tate] !=0 ) gemClass += colorClass[pattern[yoko][tate]];

    if( flashing ) { // 需要添加閃動特效嗎？
      flashdots.map(cv => {
        // document.querySelector(`.x${cv[0]}y${cv[1]}`).querySelector('.gem').classList.add("sparkling");
        // 不能用上面這行, 不然香菇如果剛好長在消除連線的上面 閃爍特效結束後 新生長的香菇會繼續閃爍
        if( tate==cv[0] && yoko==cv[1] ) gemClass += ' sparkling ';
      })
    }

    return (
      <div
        className={this.defineCubeClass( who, ppl )}
        onClick={this.putDot.bind(this, who, ppl, skill, flashing, scene)}
        onMouseEnter={this.handleMouseOver.bind(this, who, ppl, flashing)}
        onMouseLeave={this.handleMouseOut.bind(this, who, ppl)}
      >
        <div className={gemClass}>
          {
            pattern[yoko][tate] != 0
            ? <img src={`/pics/${scene=='king'?'k':(scene=='pirate'?'p':(scene=='forest'?'f':'a'))}${pattern[yoko][tate]}.png`} />
            : null
          }
        </div>
      </div>
    );
  }
}

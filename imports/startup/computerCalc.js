

function calcScores( tate, yoko, kyu, pattern ) {
  // 直線得分 ----------------------------------------
  let tateWinArrs = [];
  for(let k=-1; k<2; k++) { // k : -1,0,1 直線有三條要判斷
    let numArr = [];
    // 先把 kyu 放進去 pattern
    kyu.map( (cv, i) => {
      if( i%3 == k+1 && cv !=0 ) {
        let y = Math.floor(i/3)-1;
        numArr.push( yoko+y )
      }
    })
    // 檢查 pattern 的直線連線狀況
    pattern.map( (cv, i) => {
      if( cv[ tate+k ] !=0 ) numArr.push(i);
    })

    let WinArr = arrNumInLine(numArr);
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
    kyu.map( (cv, i) => {
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

    let WinArr = arrNumInLine(numArr);
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
  // 不可以寫 let newPattern = pattern, 不然不知道為什麼 只要是可以填子的地方 pattern 就會變成填過子的狀態 會改變
  var newPattern = [];
  pattern.map( (cv, i) => {
    newPattern.push([]);
    cv.map(el => {
      newPattern[i].push(el);
    })
  })
  kyu.map( (cv, i) => {
    if(cv!=0) {
      let x = i%3 -1; // 左邊數到右邊 -1,0,1
      let y = Math.floor(i/3) -1; // 上面數到下面 -1,0,1
      newPattern[ yoko+y ][ tate+x ] = cv;
    }
  });

  let leftTopWinArrs = arrNumInTilt( tate, yoko, newPattern, 'left_top' );

  // /線得分 ----------------------------------------
  let rightTopWinArrs = arrNumInTilt( tate, yoko, newPattern, 'right_top' );

  // 所有的 combo 陣列
  var dotsArrs = tateWinArrs.concat(yokoWinArrs, leftTopWinArrs, rightTopWinArrs );


  // 計算分數
  var uniqueXY = [],
      combo = dotsArrs.length, // 計算 combo
      colorDots = {'green':0, 'blue':0, 'purple':0, 'golden':0, 'skull':0},
      renju = {'r6':0, 'r7':0, 'r8':0, 'r9':0, 'r10':0, 'r11':0};

  dotsArrs.map(cv => {
    let l = cv.length;
    if( l>=6 && l<12 ) renju['r'+l]++; // 計算 renju
    else if( l>=12 ) renju['r11']++;
    uniqueXY = uniqueXY.concat(cv);
  });

  // dotsArrs 裡 排除重複座標的點
  uniqueXY = uniqueXY.map(cv => cv[0]+'_'+cv[1]);
  uniqueXY = Array.from(new Set(uniqueXY));
  uniqueXY = uniqueXY.map(cv => cv.split('_'));
  uniqueXY.map(cv => {
    const colorClass = [ '', 'white', 'green', 'blue', 'purple', 'golden', 'skull' ];
    let x = cv[0], y = cv[1];
    let n = newPattern[y][x];
    if( n>1 ) colorDots[colorClass[n]]++; // 計算 colorDots
  });

  var scoreInfo = {combo, colorDots, renju};
  const ttl_score = colorDots.green*0.5 + colorDots.blue*1 + colorDots.purple*1.5 + colorDots.golden*2 + colorDots.skull*2*(-1) +
                      renju.r6*1 + renju.r7*3 + renju.r8*5 + renju.r9*7 + renju.r10*9 + renju.r11*11;

  return { p: ttl_score, dotsArrs };
}


// -----------------------------------------------------------------------------
function arrNumInLine(arr) {
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

function arrNumInTilt( tate, yoko, newPattern, direction ) { // newPattern 是填子後的棋盤
  // 給定一個點的座標 判斷通過該點的斜線 是否有超過 5 個連成一線的子, 有的話 傳回座標陣列
  const origin = findTiltOrigin( tate, yoko, direction );
  var count = [], multicount = [];

  // 往左下/右下方找
  origin.map(cv => {
    let x = cv[0], y = cv[1];
    count = [];
    while( (direction=='left_top'?x<=19:0<=x) && y<=19 ) {
      if( newPattern[y][x] !=0 ) {
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

function findTiltOrigin( tate, yoko, direction ) {
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


function doupletStyle( cv, i, pattern, yoko, tate ) { // 處理重疊的子的判斷
  let notSameDot = true; // 判斷有沒有重疊的子
  if(cv!=0) {
    let x = i%3 -1; // 左邊數到右邊 -1,0,1
    let y = Math.floor(i/3) -1; // 上面數到下面 -1,0,1
    if( pattern[ yoko+y ][ tate+x ] !=0 ) {
      // 有重疊的子
      notSameDot = false;
    }
  }

  return notSameDot;
}

// 輸入座標 輸出分數
// 給定一個可以放子的座標 回傳如果放子的話可以得到幾分？
export const xyPoint = function( tate, yoko, kyu, pattern ) {

  // 先看 kyu 能不能放入 pattern
  var shouldexit = false;
  kyu.map( (cv, i) => {
    let notSameDot = doupletStyle( cv, i, pattern, yoko, tate );
    if( !notSameDot ) shouldexit = true; // 不能放入就離開
  })
  if( shouldexit ) return 'cant put dot';


  return calcScores( tate, yoko, kyu, pattern );
}

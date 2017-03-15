import { Mongo } from 'meteor/mongo'
import { xyPoint } from '../startup/computerCalc'


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function init_pattern( mode, scene ) { // pattern 初始值製作
  // let pattern = [];
  // let initRow = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  // for(let i=0; i<20; i++){ pattern.push(initRow) };
  // 必須要用下面這個方法, 不能讓 initRow 指向該陣列, 不然 pattern 被更改過後, 還是會得到一模一樣的 20 個 initRow
  let pattern = [];
  for(let i=0; i<20; i++){ pattern.push([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]) };

  // 死鬥模式專用 隨機初始值
  if( mode == 'deathBattle' ) {
    // 4x4 的方塊 總共有 5x5 個
    const inits = [[1,1], [2,1], [1,2], [2,2]]; // 4 種起始點模式
    const init = inits[ Math.floor(Math.random()*4) ]; // 起始點
    let centers = []; // 所有要描繪的九宮格的中心點座標
    for(let i=0; i<5; i++) {
      for(let j=0; j<5; j++) {
        if( Math.random()>0.2 ) { // 先抓大概過半的機率 才放置中心點
          centers.push([ init[0] + i*4, init[1] + j*4 ]);
        }
      }
    }

    centers.map(cv => {
      let yoko = cv[0], tate = cv[1];
      let kyu = Meteor.call('eleven.newkyu', null, null, scene);
      kyu.map( (el, i) => {
        if(el!=0) {
          let x = i%3 -1; // 左邊數到右邊 -1,0,1
          let y = Math.floor(i/3) -1; // 上面數到下面 -1,0,1
          pattern[ yoko+y ][ tate+x ] = el;
        }
      })
    });
  }

  return pattern;
}


// ---------------------------------------------------------------------------
// 移除掉 insecure 之後就要用 methods ( $ meteor remove insecure )
Meteor.methods({
  // 這裡不能用 fat arrow function, 否則 this 所指不同, this.userId 會找不到
  'eleven.newgame': function( name, mode, scene, vsComputer ) {
    let pattern = init_pattern( mode, scene );

    return Eleven.insert({
      name,
      mode,
      scene,
      gameover: false,
      kyu: [ Meteor.call('eleven.newkyu', null, null, scene), Meteor.call('eleven.newkyu', null, null, scene) ],
      pattern,
      scoreInfo: [{              // scoreInfo 可以做為紀錄遊戲步驟的依據
        combo: 0,
        colorDots: {'green':0, 'blue':0, 'purple':0, 'golden':0, 'skull':0},
        renju: {'r6':0, 'r7':0, 'r8':0, 'r9':0, 'r10':0, 'r11':0}
      }, {
        combo: 0,
        colorDots: {'green':0, 'blue':0, 'purple':0, 'golden':0, 'skull':0},
        renju: {'r6':0, 'r7':0, 'r8':0, 'r9':0, 'r10':0, 'r11':0}
      }],
      createdAt: new Date(),
      players: [null, (vsComputer?vsComputer:null)],      // 玩家的 username
      role: [null, null],         // 玩家的職業 WAR HUT MAG
      skill: [true, true],        // 記錄技能是否可以施展 true 可以, false 不能
      playersOnOff: [null, null], // 紀錄玩家在不在房間的狀況
      winLose: [null, null],      // 'win' 'lose'
      flashdots: [],              // 要執行閃爍動畫的子的座標陣列
      lastStepDots: [],           // 紀錄上一步驟的子的座標 方便加上灰底
      breakOnOff: 'off',          // 紀錄獵人技能是否開啟
      fungi: [],                  // 紀錄生長的香菇座標 方便加上綠底
      vsComputer,          // 紀錄和玩家打, 還是和電腦打
    });
  },

  'eleven.newkyu': function( id, who, scene ) {
    // 9x9 空陣列
    let kyu = [];
    let dot_num = 0; // kyu 裡有幾個子?

    // 決定是幾個子
    const p = Math.floor(Math.random()*100);
    if(p<10)      dot_num = 2;
    else if(p<40) dot_num = 3;
    else if(p<80) dot_num = 4;
    else if(p<95) dot_num = 5;
    else          dot_num = 6;

    // 決定是什麼子
    let p2 = 0;
    for(let i=0; i<9; i++){
      if(dot_num > i) {
        p2 = Math.floor(Math.random()*100);

        if( scene == 'pirate' || scene == 'forest' ) { // 海盜巢穴 蘑菇森林

          if(p2<3)       kyu.push(5)
          else if(p2<7)  kyu.push(4)
          else if(p2<13) kyu.push(3)
          else if(p2<21) kyu.push(2)
          else if(p2<31) kyu.push(6)
          else           kyu.push(1)

        } else { // 國王陵墓 煉金工坊

          if(p2<3)       kyu.push(5)
          else if(p2<7)  kyu.push(4)
          else if(p2<13) kyu.push(3)
          else if(p2<21) kyu.push(2)
          else           kyu.push(1)

        }

      } else {
        kyu.push(0)
      }
    }
    kyu = shuffle(kyu);

    if(id) { // kyu update
      var oldkyu = Eleven.findOne(id).kyu;
      oldkyu[ who ] = kyu;
      return Eleven.update( id, { $set: { kyu: oldkyu } });
    } else { // 新遊戲初始預設的 kyu
      return kyu;
    }
  },

  'eleven.putdot': function( id, tate, yoko, kyu, pattern, who, scene ) {
    let newPattern = pattern, lastStepDots = [];
    kyu[ who ].map( (cv, i) => {
      if(cv!=0) {
        let x = i%3 -1; // 左邊數到右邊 -1,0,1
        let y = Math.floor(i/3) -1; // 上面數到下面 -1,0,1
        newPattern[ yoko+y ][ tate+x ] = cv;
        lastStepDots.push([ tate+x, yoko+y ]);
      }
    })
    // 填子後 要更新 kyu
    if( Meteor.isServer ){
      Meteor.call('eleven.newkyu', id, who, scene);
    }
    return Eleven.update( id, { $set: { pattern: newPattern, lastStepDots } });
  },

  // ---------------------------------------------------------------------------

  'eleven.rotate': function( id, oldkyu, direction, who, skill ) {
    Meteor.call('eleven.skillLock', id, who, skill);

    let kyu = [ null, null ], newkyu = [];
    if( direction=='left' ) {
      const leftRotate = [2,5,8,1,4,7,0,3,6];
      oldkyu[ who ].map( (cv, i, arr) => { newkyu.push(arr[ leftRotate[i] ]); })

    } else if( direction=='right' ) {
      const rightRotate = [6,3,0,7,4,1,8,5,2];
      oldkyu[ who ].map( (cv, i, arr) => { newkyu.push(arr[ rightRotate[i] ]); })
    }
    kyu[ who ] = newkyu;
    kyu[ Number(!who) ] = oldkyu[ Number(!who) ];

    return Eleven.update( id, { $set: { kyu } });
  },

  'eleven.refresh': function( id, who, skill, scene ) {
    Meteor.call('eleven.skillLock', id, who, skill);

    if( Meteor.isServer ){
      Meteor.call('eleven.newkyu', id, who, scene);
    }
  },

  'eleven.break': function( id, x, y, who, skill ) {
    Meteor.call('eleven.skillLock', id, who, skill);

    if( Meteor.isServer ){
      Meteor.setTimeout(() => {

        // 移除掉 lastStepDots 裡面那些準備要閃爍移除的子, 這樣才不會造成連線的子移除後 灰色底還留下的情況
        let lastStepDots = [];
        const oldlastStepDots = Eleven.findOne(id).lastStepDots;
        oldlastStepDots.map(cv => {
          if( !(cv[0]==x && cv[1]==y) ) lastStepDots.push(cv);
        });

        // 移除掉 fungi 裡面那些準備要閃爍移除的子, 這樣才不會造成連線的子移除後 綠色底還留下的情況
        let fungi = [];
        const oldfungi = Eleven.findOne(id).fungi;
        oldfungi.map(cv => {
          if( !(cv[0]==x && cv[1]==y) ) fungi.push(cv);
        });

        let newPattern = Eleven.findOne(id).pattern;
        newPattern[y][x] = 0;
        Eleven.update( id, { $set: { pattern: newPattern, flashdots: [], lastStepDots, fungi } });

      }, 2400);

      // 閃動特效
      Eleven.update( id, { $set: { flashdots: [[x, y]] } });
    }

  },

  'eleven.breakSwitch': function( id, onoff ) {
    Eleven.update( id, { $set: { breakOnOff: onoff } });
  },

  'eleven.skillLock': function( id, who, skill ) {
    // 用過一次技能後 就不能再用, 更新 skill state
    let skillstate = [ null, null ];
    skillstate[ who ] = false;
    skillstate[ Number(!who) ] = true;
    Eleven.update( id, { $set: { skill: skillstate } });
  },

  'eleven.skillUnLock': function( id ) {
    // 任一方 potDot 之後, 雙方都解鎖 skill
    Eleven.update( id, { $set: { skill: [true, true] } });
  },

  'eleven.skillLockAll': function( id ) {
    // 閃爍動畫中, 雙方都鎖上 skill
    Eleven.update( id, { $set: { skill: [false, false] } });
  },

  // ---------------------------------------------------------------------------

  'eleven.calcPoints': function( id, dotsArrs, who, skill ) {
    var pattern = Eleven.findOne(id).pattern; // 這裡得到的是已經填子並更新後的 pattern
    const scene = Eleven.findOne(id).scene;
    const vsComputer = Eleven.findOne(id).vsComputer;
    const kyu = Eleven.findOne(id).kyu;

    let uniqueXY = [];
    let combo = dotsArrs.length, // 計算 combo
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
      let n = pattern[y][x];
      if( n>1 ) colorDots[colorClass[n]]++; // 計算 colorDots
    });

    var scoreInfo = {combo, colorDots, renju};
    // 消除子, 更新 pattern
    uniqueXY.map(cv => {
      let x = cv[0], y = cv[1];
      pattern[y][x] = 0;
    });

    // forest 特殊場景機制 ----------------------------------------
    function canFungiGrow( pattern, x, y ) {
      if( (x!=0  &&  x!=19  &&  y!=0  &&  y!=19
          && pattern[y-1][x-1] == 0 && pattern[y-1][x] == 0 && pattern[y-1][x+1] == 0 && pattern[y][x-1] == 0
          && pattern[y][x+1] == 0 && pattern[y+1][x-1] == 0 && pattern[y+1][x] == 0 && pattern[y+1][x+1] == 0)
          || (x==0  &&  y!=0  &&  y!=19
              && pattern[y-1][x] == 0 && pattern[y-1][x+1] == 0
              && pattern[y][x+1] == 0 && pattern[y+1][x] == 0 && pattern[y+1][x+1] == 0)
          || (x==19  &&  y!=0  &&  y!=19
              && pattern[y-1][x-1] == 0 && pattern[y-1][x] == 0 && pattern[y][x-1] == 0
              && pattern[y+1][x-1] == 0 && pattern[y+1][x] == 0)
          || (y==0  &&  x!=0  &&  x!=19
              && pattern[y][x-1] == 0
              && pattern[y][x+1] == 0 && pattern[y+1][x-1] == 0 && pattern[y+1][x] == 0 && pattern[y+1][x+1] == 0)
          || (y==19  &&  x!=0  &&  x!=19
              && pattern[y-1][x-1] == 0 && pattern[y-1][x] == 0 && pattern[y-1][x+1] == 0 && pattern[y][x-1] == 0
              && pattern[y][x+1] == 0)
        ) { return true }
      return false
    }
    // 決定哪些座標可以生長香菇
    var fungi = [];
    if( scene == 'forest' ) {
      for(let i=0; i<30; i++) {
        let x = Math.floor(Math.random()*20), y = Math.floor(Math.random()*20);
        if( pattern[y][x] == 0) { // 該座標沒有香菇
          if( canFungiGrow( pattern, x, y ) ) { // 該座標可以生長香菇嗎？
            fungi.push([x,y]);
          }
        }
      }
      // 決定香菇生長的上限數量
      let fn = Math.floor(Math.random()*100), fungiNumber;
        if(fn<15)      fungiNumber = 3;
        else if(fn<35) fungiNumber = 4;
        else if(fn<65) fungiNumber = 5;
        else if(fn<85) fungiNumber = 6;
        else           fungiNumber = 7;

      if( fungi.length > fungiNumber ) fungi = fungi.slice(0, fungiNumber);
      // map 香菇陣列, 更新 pattern
      fungi.map(cv => {
        let p2 = Math.floor(Math.random()*100), num = 1;
          if(p2<3)       num = 5;
          else if(p2<7)  num = 4;
          else if(p2<13) num = 3;
          else if(p2<21) num = 2;
          else if(p2<25) num = 6; // 長出毒菇的機率略低
          else           num = 1;
        let x = cv[0], y = cv[1];
        pattern[y][x] = num;
      });
    }
    //----------------------------------------

    // alchemy 特殊場景機制 ----------------------------------------
    function createOneItem() {
      let p2 = Math.floor(Math.random()*100), num = 0;
      if( Math.random() < 0.86 ) {
        if(p2<3)       num = 5;
        else if(p2<7)  num = 4;
        else if(p2<13) num = 3;
        else if(p2<21) num = 2;
        else           num = 1;
      }
      return num;
    }
    if( scene == 'alchemy' ) {
      for(let y=19; y>=4; y--) {
        for(let x=2; x<=4; x++) {
          if( y != 4 ) pattern[y][x] = pattern[y-1][x];
          else if( y == 4 ) pattern[y][x] = createOneItem();
        }
      }
      for(let y=0; y<=12; y++) {
        for(let x=6; x<=8; x++) {
          if( y != 12 ) pattern[y][x] = pattern[y+1][x];
          else if( y == 12 ) pattern[y][x] = createOneItem();
        }
      }
      for(let y=19; y>=7; y--) {
        for(let x=11; x<=13; x++) {
          if( y != 7 ) pattern[y][x] = pattern[y-1][x];
          else if( y == 7 ) pattern[y][x] = createOneItem();
        }
      }
      for(let y=0; y<=15; y++) {
        for(let x=15; x<=17; x++) {
          if( y != 15 ) pattern[y][x] = pattern[y+1][x];
          else if( y == 15 ) pattern[y][x] = createOneItem();
        }
      }
    }
    //----------------------------------------

    // 更新遊戲資料
    if( Meteor.isServer && uniqueXY.length !=0 ){
      // 移除掉 lastStepDots 裡面那些準備要閃爍移除的子, 這樣才不會造成連線的子移除後 灰色底還留下的情況
      let lastStepDots = [];
      const oldlastStepDots = Eleven.findOne(id).lastStepDots;
      oldlastStepDots.map(cv => {
        let shouldIpush = true;
        uniqueXY.map(el =>{ if( cv[0]==el[0] && cv[1]==el[1] ) shouldIpush = false; });
        if( shouldIpush ) lastStepDots.push(cv);
      });

      Meteor.setTimeout(() => {

        Eleven.update( id, { $set: { pattern, flashdots: [], lastStepDots, fungi }, $push: { scoreInfo } });
        Meteor.call('eleven.skillUnLock', id);

        if( vsComputer=='Faker' && who==0 ) Meteor.call('eleven.handleComputer', id, pattern, scene, kyu );

      }, 2400);

      // 閃動特效前 鎖上全部 skill
      Meteor.call('eleven.skillLockAll', id);
      // 閃動特效
      Eleven.update( id, { $set: { flashdots: uniqueXY } });

    } else if( Meteor.isServer && uniqueXY.length ==0 ) {
      // 沒有連線的子的話 馬上更新不用特效了
      Eleven.update( id, { $set: { pattern, fungi }, $push: { scoreInfo } });
      // 填子後, skill 變成 true, 這樣下一回合才可以使用技能
      Meteor.call('eleven.skillUnLock', id);

      if( vsComputer=='Faker' && who==0 ) Meteor.call('eleven.handleComputer', id, pattern, scene, kyu );

    }

  },

  'eleven.handleComputer': function( id, pattern, scene, kyu  ) {

    var maxPoint = 0,      // 紀錄可以獲得的最高分數
        samePointArr = []; // 放入可以得到最高同樣分數的所有座標
    pattern.map( (cv, y, arr) => {
      cv.map( (el, x) => {
        if( x!=0 && x!=19 && y!=0 && y!=19 ) { // 邊框線不能放子

          let obj = xyPoint( x, y, kyu[1], arr ); // return { p, dotsArrs }; p 是該座標如果放子的話可以得到的分數
          obj.XY = [x, y];

          if( obj.p!='cant put dot' ) {
            if( obj.p > maxPoint ) {
              maxPoint = obj.p;
              samePointArr = [ obj ];

            } else if( obj.p == maxPoint ) {
              samePointArr.push( obj );
            }
          }
        }
      })
    });

    const len = samePointArr.length,
          idx = Math.floor(Math.random()*len),
          tate = samePointArr[idx].XY[0],
          yoko = samePointArr[idx].XY[1];


    if( Meteor.isServer ){ // 等待一小段時間 再讓電腦下棋
      Meteor.setTimeout(() => {

        Meteor.call('eleven.putdot', id, tate, yoko, kyu, pattern, 1, scene);
        Meteor.call('eleven.calcPoints', id, samePointArr[idx].dotsArrs, 1, null); // 似乎不需要 skill 參數

      }, 1000);
    }

  },

  // ---------------------------------------------------------------------------

  'eleven.playerOn': function( gameId, idx, userId ) {
    let playersOnOff = Eleven.findOne(gameId).playersOnOff;
    playersOnOff[idx] = userId;
    return Eleven.update( gameId, { $set: { playersOnOff } });
  },

  'eleven.playerOff': function( gameId, userId ) {
    let playersOnOff = Eleven.findOne(gameId).playersOnOff;
    playersOnOff[0] = playersOnOff[0] == userId ? null : playersOnOff[0] ;
    playersOnOff[1] = playersOnOff[1] == userId ? null : playersOnOff[1] ;
    return Eleven.update( gameId, { $set: { playersOnOff } });
  },

  'eleven.addPlayer': function( gameId, idx, userId, roles ) {
    let game = Eleven.findOne(gameId);
    let players = game.players;
    players[idx] = userId;
    let playersOnOff = game.playersOnOff;
    playersOnOff[idx] = userId;
    let role = game.role;
    role[idx] = roles;
    return Eleven.update( gameId, { $set: { players, playersOnOff, role } });
  },

  // ---------------------------------------------------------------------------

  'eleven.handleGameover': function( id, winLose ) {
    return Eleven.update( id, { $set: { gameover: true, winLose } });
  },

});

export const Eleven = new Mongo.Collection('eleven');

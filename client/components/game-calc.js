





import React, { Component } from 'react';


export default class GameCalc extends Component {

  createScore() {
    const { _id, scoreInfo, players, playersOnOff, flashdots, mode, scene, gameover } = this.props.eleven;

    let ppl;
    if( !Meteor.user() ) { // 現在進來的人是 玩家一 玩家二 還是其他人（包含有登入或沒登入）
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
    let round = Math.floor(scoreInfo.length/2); // 第幾回合

    // 處理上回得分
    let last;
    if( ppl==0 ) { // 對玩家一來說 輪到我或輪到你的上一局是不同的
      last = who==0 ? scoreInfo[ scoreInfo.length-2 ] : scoreInfo[ scoreInfo.length-1 ];
    } else if( ppl==1 ) { // 對玩家二來說
      last = who==1 ? scoreInfo[ scoreInfo.length-2 ] : scoreInfo[ scoreInfo.length-1 ];
    }

    let lastArr = [], lastTotlePoints = 0;
    if( ppl != 'other' ) {
      let cd = last.colorDots, rj = last.renju;
      if( cd.green )  lastArr.push( <tr key='0'><td className='td-head'><img src={`/pics/${scene=='king'?'k':'p'}2.png`} /></td><td>{cd.green}</td><td><span>個 &times; 0.5 分</span></td></tr> );
      if( cd.blue )   lastArr.push( <tr key='1'><td className='td-head'><img src={`/pics/${scene=='king'?'k':'p'}3.png`} /></td><td>{cd.blue}</td><td><span>個 &times; 1 分</span></td></tr> );
      if( cd.purple ) lastArr.push( <tr key='2'><td className='td-head'><img src={`/pics/${scene=='king'?'k':'p'}4.png`} /></td><td>{cd.purple}</td><td><span>個 &times; 1.5 分</span></td></tr> );
      if( cd.golden ) lastArr.push( <tr key='3'><td className='td-head'><img src={`/pics/${scene=='king'?'k':'p'}5.png`} /></td><td>{cd.golden}</td><td><span>個 &times; 2 分</span></td></tr> );
      if( cd.skull )  lastArr.push( <tr key='s'><td className='td-head'><img src={`/pics/p6.png`} /></td><td style={{color: '#F44336'}}>{cd.skull}</td><td><span>個 &times; -2 分</span></td></tr> );
      if( rj.r6 )     lastArr.push( <tr key='4'><td className='td-head'>連六</td><td>{rj.r6}</td><td><span>個 &times; 1 分</span></td></tr> );
      if( rj.r7 )     lastArr.push( <tr key='5'><td className='td-head'>連七</td><td>{rj.r7}</td><td><span>個 &times; 3 分</span></td></tr> );
      if( rj.r8 )     lastArr.push( <tr key='6'><td className='td-head'>連八</td><td>{rj.r8}</td><td><span>個 &times; 5 分</span></td></tr> );
      if( rj.r9 )     lastArr.push( <tr key='7'><td className='td-head'>連九</td><td>{rj.r9}</td><td><span>個 &times; 7 分</span></td></tr> );
      if( rj.r10 )    lastArr.push( <tr key='8'><td className='td-head'>連十</td><td>{rj.r10}</td><td><span>個 &times; 9 分</span></td></tr> );
      if( rj.r11 )    lastArr.push( <tr key='9'><td className='td-head'>光棍</td><td>{rj.r11}</td><td><span>個 &times; 11 分</span></td></tr> );
      lastTotlePoints = cd.green*0.5 + cd.blue*1 + cd.purple*1.5 + cd.golden*2 + cd.skull*2*(-1) +
                        rj.r6*1 + rj.r7*3 + rj.r8*5 + rj.r9*7 + rj.r10*9 + rj.r11*11;
    }


    // 處理總分
    function reduce_scoreInfo( scoreInfo, ppl ) { // ppl = 0 或 1
      return scoreInfo.reduce((sum, cv, i) => {
        // 只要加總其中一個玩家
        if( i%2 == ppl ) {
          let { combo, colorDots, renju } = cv;
          return {
            'green': sum.green + colorDots.green,
            'blue': sum.blue + colorDots.blue,
            'purple': sum.purple + colorDots.purple,
            'golden': sum.golden + colorDots.golden,
            'skull': sum.skull + colorDots.skull,
            'r6': sum.r6 + renju.r6,
            'r7': sum.r7 + renju.r7,
            'r8': sum.r8 + renju.r8,
            'r9': sum.r9 + renju.r9,
            'r10': sum.r10 + renju.r10,
            'r11': sum.r11 + renju.r11
          }
        } else {
          return sum;
        }
      }, { 'green':0, 'blue':0, 'purple':0, 'golden':0, 'skull':0, 'r6':0, 'r7':0, 'r8':0, 'r9':0, 'r10':0, 'r11':0});
    }
    const ttl_0 = reduce_scoreInfo( scoreInfo, 0 ); // 玩家一的總分 object
    const ttl_1 = reduce_scoreInfo( scoreInfo, 1 ); // 玩家二的總分 object

    // 玩家一的總分
    const ttl_score_0 = ttl_0.green*0.5 + ttl_0.blue*1 + ttl_0.purple*1.5 + ttl_0.golden*2 + ttl_0.skull*2*(-1) +
                        ttl_0.r6*1 + ttl_0.r7*3 + ttl_0.r8*5 + ttl_0.r9*7 + ttl_0.r10*9 + ttl_0.r11*11;
    // 玩家二的總分
    const ttl_score_1 = ttl_1.green*0.5 + ttl_1.blue*1 + ttl_1.purple*1.5 + ttl_1.golden*2 + ttl_1.skull*2*(-1) +
                        ttl_1.r6*1 + ttl_1.r7*3 + ttl_1.r8*5 + ttl_1.r9*7 + ttl_1.r10*9 + ttl_1.r11*11;

    // 處理勝利的情況
    let winLose = [null, null]; // 'win' 'lose'
    if( mode == 'classic' ) {
      if( ttl_score_0>=11 || ttl_score_1>=11 ) { // 任一方達到 11 分 遊戲結束
        winLose = ttl_score_0>=11 ? [players[0], players[1]] : [players[1], players[0]];
        Meteor.call('eleven.handleGameover', _id, winLose);
      }

    } else if( mode == 'deathBattle' ) {
      if( round >= 12 && ttl_score_0 != ttl_score_1 ) { // 第 12 回合正要開始時 遊戲結束
        winLose = ttl_score_0>ttl_score_1 ? [players[0], players[1]] : [players[1], players[0]];
        Meteor.call('eleven.handleGameover', _id, winLose);
      }
    }

    return (
      <div id="calc">
        <div id='calc-ttl'>
          <h3>總分</h3>
          <table className='calc-box'>
            <tbody>
              <tr className='calc-row'>
                <td className='td-name'>{players[0] ? players[0] : '等待中'}</td>
                <td className='td-ttlscore' style={{color: mode=='classic' && ttl_score_0>9?'#F44336':'#424242'}}>
                  { ttl_score_0 }
                </td>
                <td><span> 分</span></td>
              </tr>
              <tr className='calc-row'>
                <td className='td-name'>{players[1] ? players[1] : '等待中'}</td>
                <td className='td-ttlscore' style={{color: mode=='classic' && ttl_score_1>9?'#F44336':'#424242'}}>
                  { ttl_score_1 }
                </td>
                <td><span> 分</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {
          ppl == 'other' ? null : (
            <div id='calc-last'>
              <h3>我的上回合得分</h3>
              {
                lastArr.length == 0
                ? <p>沒有任何得分項目</p>
                : (
                  <div>
                    <table><tbody>{lastArr}</tbody></table>
                    <table className='calc-box'>
                      <tbody>
                        <tr className='calc-row last'>
                          <td className='td-name'>上回合總得分</td>
                          <td className='td-ttlscore'>
                            { lastTotlePoints }
                          </td>
                          <td><span> 分</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )
              }
            </div>
          )
        }

        {
          ppl == 'other' ? null : (
            <div id='calc-board'>
              <h3>我的計分表</h3>
              <table>
                <tbody>
                  <tr>
                    <td className='td-head'><img src={`/pics/${scene=='king'?'k':'p'}2.png`} /></td>
                    <td>{ ppl==0 ? ttl_0.green : ttl_1.green }</td>
                    <td><span>個 &times; 0.5 分</span></td>
                  </tr>
                  <tr>
                    <td className='td-head'><img src={`/pics/${scene=='king'?'k':'p'}3.png`} /></td>
                    <td>{ ppl==0 ? ttl_0.blue : ttl_1.blue }</td>
                    <td><span>個 &times; 1 分</span></td>
                  </tr>
                  <tr>
                    <td className='td-head'><img src={`/pics/${scene=='king'?'k':'p'}4.png`} /></td>
                    <td>{ ppl==0 ? ttl_0.purple : ttl_1.purple }</td>
                    <td><span>個 &times; 1.5 分</span></td>
                  </tr>
                  <tr>
                    <td className='td-head'><img src={`/pics/${scene=='king'?'k':'p'}5.png`} /></td>
                    <td>{ ppl==0 ? ttl_0.golden : ttl_1.golden }</td>
                    <td><span>個 &times; 2 分</span></td>
                  </tr>
                  {
                    scene == 'pirate'
                    ? (
                      <tr>
                        <td className='td-head'><img src='/pics/p6.png' /></td>
                        <td style={{color: '#F44336'}}>{ ppl==0 ? ttl_0.skull : ttl_1.skull }</td>
                        <td><span>個 &times; -2 分</span></td>
                      </tr>
                    ) : null
                  }
                  <tr>
                    <td className='td-head'>連六</td>
                    <td>{ ppl==0 ? ttl_0.r6 : ttl_1.r6 }</td>
                    <td><span>個 &times; 1 分</span></td>
                  </tr>
                  <tr>
                    <td className='td-head'>連七</td>
                    <td>{ ppl==0 ? ttl_0.r7 : ttl_1.r7 }</td>
                    <td><span>個 &times; 3 分</span></td>
                  </tr>
                  <tr>
                    <td className='td-head'>連八</td>
                    <td>{ ppl==0 ? ttl_0.r8 : ttl_1.r8 }</td>
                    <td><span>個 &times; 5 分</span></td>
                  </tr>
                  <tr>
                    <td className='td-head'>連九</td>
                    <td>{ ppl==0 ? ttl_0.r9 : ttl_1.r9 }</td>
                    <td><span>個 &times; 7 分</span></td>
                  </tr>
                  <tr>
                    <td className='td-head'>連十</td>
                    <td>{ ppl==0 ? ttl_0.r10 : ttl_1.r10 }</td>
                    <td><span>個 &times; 9 分</span></td>
                  </tr>
                  <tr>
                    <td className='td-head'>光棍</td>
                    <td>{ ppl==0 ? ttl_0.r11 : ttl_1.r11 }</td>
                    <td><span>個 &times; 11 分</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        }

      </div>
    )
  }


  render() {
    if( !this.props.eleven ) {
      return (<div>loading...</div>)
    }
    return (
      <div id='game-calc'>
        { this.createScore() }
      </div>
    );
  }
}

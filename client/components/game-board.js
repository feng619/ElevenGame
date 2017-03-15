import React, { Component } from 'react';

import Cube from './cube';

export default class GameBoard extends Component {
  createCubes() {
    const { pattern } = this.props.eleven;

    return pattern.map( (cv, i) => {
      return cv.map( (el, j) => {
        return (
          <Cube
            key={('i'+i)+('j'+j)}
            yoko={i}
            tate={j}
            eleven={this.props.eleven}
          />
        )
      })
    })
  }

  createLeftCubes() {
    const leftArr = [];
    for(let i=0; i<20; i++){
      leftArr.push(
        <div key={i} className="left-cubes">{i}</div>
      );
    }
    return leftArr;
  }

  createBotCubes() {
    const botArr = [];
    for(let i=-1; i<20; i++){
      botArr.push(
        <div key={i} className="bot-cubes">{i>-1?i:''}</div>
      );
    }
    return botArr;
  }

  render() {
    const { eleven: { _id, kyu, playersOnOff, scoreInfo, scene, mode } } = this.props;
    const colorClass = [ '', 'white', 'green', 'blue', 'purple', 'golden' ];
    const sceneColor = scene=='king'?'#917b53':(scene=='pirate'?'#4d8b9a':(scene=='forest'?'#61833d':'#b05d2c'));

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

    return (
      <div id="game-board">

        <div className="game-board-row game-board-title">
          <div className='game-board-title-el'>{scene=='king'?'國王陵墓':(scene=='pirate'?'海賊巢穴':(scene=='forest'?'蘑菇森林':'煉金工坊'))}</div>
          <div className='game-board-title-el'>
            <div className='lists-badge' style={{backgroundColor: sceneColor}}>
              <img src={mode=='classic'?'/pics/mode-1.png':'/pics/mode-2.png'} />
            </div>
          </div>
          <div className='game-board-title-el'>{mode=='classic'?'經典模式':'死鬥模式'}</div>
        </div>

        <div id="game-board-midrow">
          <div className="game-board-col">
            {this.createLeftCubes()}
          </div>
          <div id="game-board-main">
            <div id='hoverKyu'>
              {
                who == ppl // 輪到的該玩家 hoverkyu 裡面才要放東西
                ? (
                  kyu[ who ].map( (cv, i) => {
                    return (
                      <div className='cube' key={i}>
                        <div className={'gem '+colorClass[cv]}>
                          {
                            cv != 0
                            ? <img src={`/pics/${scene=='king'?'k':(scene=='pirate'?'p':(scene=='forest'?'f':'a'))}${cv}.png`} />
                            : null
                          }
                        </div>
                      </div>
                    )
                  })
                )
                : null
              }
            </div>
            {
              scene == 'alchemy'
              ? (
                <div>
                  <div id='slider1' className='alchemy-sliders'></div>
                  <div id='slider2' className='alchemy-sliders'></div>
                  <div id='slider3' className='alchemy-sliders'></div>
                  <div id='slider4' className='alchemy-sliders'></div>
                </div>
              )
              : null
            }
            {this.createCubes()}
          </div>
          <div className="game-board-col game-board-col-right">
            {
              mode=='classic'
              ? <p>勝利條件<br/>：<br/>不計回合<br/>，<br/>先得到 11 分者得勝</p>
              : <p>勝利條件<br/>：<br/>第 11 回合結束時<br/>，<br/>高分者得勝</p>
            }
          </div>
        </div>

        <div className="game-board-row">
          {this.createBotCubes()}
        </div>

      </div>
    );
  }
}

import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';

export default class GameInfo extends Component {
  createKyu( who, ppl, scene ) {
    const { _id, kyu } = this.props.eleven;
    const colorClass = [ '', 'white', 'green', 'blue', 'purple', 'golden' ];

    if( ppl == who ) {
      return kyu[ who ].map( (cv, i) => {
        return (
          <div className={'cube'} key={i}>
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
    } else if( ppl == Number(!who) ) {
      return kyu[ Number(!who)].map( (cv, i) => {
        return (
          <div className={'cube'} key={i}>
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
    }

  }

  // if( who == ppl && skill ) 輪到該玩家 而且都還沒用過技能 才可以施放技能
  handleRotate( _id, kyu, direction, who, ppl, skill, flashing ) {
    if( who == ppl && skill[who] && !flashing ) Meteor.call('eleven.rotate', _id, kyu, direction, who, skill);
    else console.log('還沒輪到你！或是你用過技能了！動畫中不能用技能！');
  }
  handleRefresh( _id, who, ppl, skill, flashing, scene ) {
    if( who == ppl && skill[who] && !flashing ) Meteor.call('eleven.refresh', _id, who, skill, scene);
    else console.log('還沒輪到你！或是你用過技能了！動畫中不能用技能！');
  }
  breakSwitch( _id, who, ppl, skill, flashing ) {
    if( who == ppl && skill[who] && !flashing ) {

      Meteor.call('eleven.breakSwitch', _id, 'on');

    } else {
      console.log('還沒輪到你！或是你用過技能了！動畫中不能用技能！');
    }
  }

  createSkillBtn( btnStyle, iconStyle, ppl, who, skill, flashing, scene ) {
    const { _id, kyu, scoreInfo, role, players, breakOnOff } = this.props.eleven;

    if( ppl == 'other' ) return; // 閒雜人不能看到技能區塊

    if( role[ ppl ] == 'WAR' ) {
      return (
        <div className='skill skillofWAR'>
          <div className='skill-ttl'>
            <h3>野蠻之力</h3>
            <p>使出強大的力量左右轉動九宮格方塊</p>
          </div>
          <div className='skill-WAR'>
            <IconButton tooltip="野蠻之力（左）" iconStyle={iconStyle} style={btnStyle}
              onClick={ this.handleRotate.bind(this, _id, kyu, 'left', who, ppl, skill, flashing) }
              >
              <img src='/pics/eleven-role-05.png'/>
            </IconButton>
            <div className='mid-pic'>
              <img src={`/pics/skill01${who==ppl && skill[who]?'':'-grey'}.png`}/>
            </div>
            <IconButton tooltip="野蠻之力（右）" iconStyle={iconStyle} style={btnStyle}
              onClick={ this.handleRotate.bind(this, _id, kyu, 'right', who, ppl, skill, flashing) }
              >
              <img src='/pics/eleven-role-07.png'/>
            </IconButton>
          </div>
        </div>
      )

    } else if( role[ ppl ] == 'HUT' ) {
      return (
        <div className='skill'>
          <div className='skill-ttl'>
            <h3>精準射擊</h3>
            <p className='HUT'>瞄準棋盤上的一個座標，射箭摧毀目標物</p>
          </div>
          <div className='skill-HUT'>
            {
              breakOnOff == 'on' && who == ppl
              ? (
                <div className='skill-row shooting'>
                  <p>選擇一個目標摧毀<br />或點選棋盤空白處取消</p>
                </div>
              ) : null
            }

            <div className='skill-row'>
              { breakOnOff == 'on' && who == ppl ? <div id='shootingRipple'></div> : null }

              <IconButton tooltip="精準射擊" iconStyle={iconStyle} style={btnStyle}
                onClick={ this.breakSwitch.bind(this, _id, who, ppl, skill, flashing) }
                >
                <img src={`/pics/skill02${who==ppl && skill[who]?'':'-grey'}.png`}/>
              </IconButton>
            </div>
          </div>
        </div>
      )

    } else if( role[ ppl ] == 'MAG' ) {
      return (
        <div className='skill'>
          <div className='skill-ttl'>
            <h3>元素脈衝</h3>
            <p>破壞九宮格方塊的能量結構，得到全新的方塊</p>
          </div>
          <div className='skill-MAG'>
            <IconButton tooltip="元素導引" iconStyle={iconStyle} style={btnStyle}
              onClick={ this.handleRefresh.bind(this, _id, who, ppl, skill, flashing, scene) }
              >
              <img src={`/pics/skill03${who==ppl && skill[who]?'':'-grey'}.png`}/>
            </IconButton>
          </div>
        </div>
      )

    }

  }

  createWinnerBox() {
    const { _id, players, winLose } = this.props.eleven;
    return (
      <div id='winner-box'>
        <h3>遊戲已結束</h3>
        <p>恭喜 {winLose[0]} 獲得勝利！</p>
      </div>
    )
  }

  render() {
    const { _id, name, kyu, players, playersOnOff, role, scoreInfo, flashdots, skill, scene, mode, gameover, vsComputer } = this.props.eleven;
    const btnStyle = {width: '70px', height: '70px'};
    const iconStyle = {width: '100%'};

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
    let round = Math.floor(scoreInfo.length/2); // 第幾回合

    if( !this.props.eleven ) {
      return (<div>loading...</div>)
    }

    return (
      <div id="game-info">

        <h2>{name}</h2>

        <div id='players'>
          <h3>第<span style={{color: mode=='deathBattle' && round>9?'#F44336':'#626262'}}>{` ${round} `}</span>回合</h3>
          <div className='players-row'>
            <div className='img-box'>
              {
                role[0]
                ? (
                  <img src={`/pics/eleven-role${playersOnOff[0]?'':'-grey'}-0${role[0]=='WAR'?'1':(role[0]=='HUT'?'2':'3')}.png`} />
                )
                : null // waiting 的情況不用 icon
              }
            </div>
            <div>{role[0] ? players[0] : '等待中'}</div>
            <div className='img-box right'>{ who==0 && !gameover?<img src='/pics/loading_dots.gif' />:null }</div>
          </div>

          <div className='players-row'>
            <div className='img-box'>
              {
                vsComputer == 'Faker'
                ? null
                : (
                  role[1]
                  ? (
                    <img src={`/pics/eleven-role${playersOnOff[1]?'':'-grey'}-0${role[1]=='WAR'?'1':(role[1]=='HUT'?'2':'3')}.png`} />
                  )
                  : null // waiting 的情況不用 icon
                )
              }
            </div>
            <div>
              {
                vsComputer == 'Faker'
                ? 'Faker(C)'
                : ( role[1] ? players[1] : '等待中' )
              }
            </div>
            <div className='img-box right'>{ who==1 && !gameover?<img src='/pics/loading_dots.gif' />:null }</div>
          </div>
        </div>


        {
          ppl == 'other' || gameover ? null : (
            <div id="kyu">
              { this.createKyu( who, ppl, scene ) }
            </div>
          )
        }

        {
          gameover ? (
            this.createWinnerBox()
          ) : (
            this.createSkillBtn( btnStyle, iconStyle, ppl, who, skill, flashing, scene )
          )
        }

        <div id="goHome">
          <RaisedButton
            href="/"  target="_self"  label="回首頁"
            buttonStyle={{height: '46px', display: 'block', boxSizing: 'content-box'}}
            overlayStyle={{height: '46px'}}
            labelStyle={{fontSize: '16px', display: 'inline-block', lineHeight: '46px', color: '#626262', fontFamily: 'Noto Sans TC'}}
            icon={<img style={{width: '46px'}} src='/pics/eleven-role-08.png'/>}
          />
        </div>

      </div>
    );
  }
}

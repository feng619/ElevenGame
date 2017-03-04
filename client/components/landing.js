import React, { Component } from 'react';
import { Eleven } from '../../imports/collections/eleven';
import { Meteor } from 'meteor/meteor';
import { connect } from 'react-redux';
//import { Link } from 'react-router';

import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import moment from 'moment';

import Header from './header';
import Newgame from './newgame';

class Landing extends Component {
  componentWillMount() {
    Meteor.subscribe('eleven');
  }

  componentDidMount() {
    // 覆蓋掉 game.js 的 handleOff, 也就是移除 onbeforeunload 事件的註冊的意思, 所以如果直接改變網址回首頁的話 會先在對戰房間執行 handleRemove 移除玩家訊息, 接著在進入首頁時移除 onbeforeunload 的事件註冊, 避免進入對戰房間時又再次呼叫 handleRemove, 發生進入對戰房間 玩家訊息被移除的狀況
    window.onbeforeunload = function(){};
  }

  addPlayer( id, idx, roles, e ) {
    if ( Meteor.user() ) {
      Meteor.call('eleven.addPlayer', id, idx, Meteor.user().username, roles);
    } else {
      e.preventDefault();
      console.log('請先登入會員');
    }
  }

  playerOn( id, idx ) {
    if ( Meteor.user() ) {
      Meteor.call('eleven.playerOn', id, idx, Meteor.user().username);
    }
  }

  createEntries( _id, players, playersOnOff, role, url, btnStyle, iconStyle, gameover, _0or1 ) {
    // 決定 icon image src
    const icon_src=`/pics/eleven-role${playersOnOff[_0or1]?'':'-grey'}-0${role[_0or1]=='WAR'?'1':(role[_0or1]=='HUT'?'2':'3')}.png`;

    return (
      <div className='entries-box'>
        { // 先手後手的按鈕：如果你已經按了先手 那就要看不到後手的按鈕
          Meteor.user() && (Meteor.user().username == players[ +!_0or1 ])
          ? (
            players[ _0or1 ]
            ? (
              <div className='entries-row'>
                <div className='img-box'><img src={icon_src} /></div>
                <div className='name-box'>{players[ _0or1 ]}</div>
              </div>
            )
            : '等待中...'
          )
          : ( // 有人按了之後 這裡就要替換成按的人名, 沒按的話 就可以選職業
            !players[_0or1]
            ? (
              <div className='roles-row'>

                <IconButton href={url} tooltip="戰士" iconStyle={iconStyle} style={btnStyle}
                  onClick={this.addPlayer.bind(this, _id, _0or1, 'WAR')}
                  >
                  <img src='/pics/eleven-role-01.png'/>
                </IconButton>

                <IconButton href={url} tooltip="獵人" iconStyle={iconStyle} style={btnStyle}
                  onClick={this.addPlayer.bind(this, _id, _0or1, 'HUT')}
                  >
                  <img src='/pics/eleven-role-02.png'/>
                </IconButton>

                <IconButton href={url} tooltip="法師" iconStyle={iconStyle} style={btnStyle}
                  onClick={this.addPlayer.bind(this, _id, _0or1, 'MAG')}
                  >
                  <img src='/pics/eleven-role-03.png'/>
                </IconButton>

              </div>
            )
            : (
              <div className='entries-row'>
                <div className='img-box'><img src={icon_src} /></div>
                <div className='name-box'>{players[ _0or1 ]}</div>

                { // 繼續的按鈕：必須是綁住這個遊戲的玩家 才可以繼續玩
                  Meteor.user() && (Meteor.user().username == players[_0or1])
                  ? (
                    <IconButton href={url} tooltip={gameover?'觀看':'繼續'} iconStyle={iconStyle} style={btnStyle}
                      onClick={this.playerOn.bind(this, _id, _0or1)}
                      >
                      { // 如果遊戲結束 就放觀看的眼睛圖案 不然就放繼續的按鈕
                        gameover
                        ? <img src='/pics/eleven-role-04.png'/>
                        : <img src='/pics/eleven-role-06.png'/>
                      }
                    </IconButton>
                  )
                  : null
                }
              </div>
            )
          )
        }


      </div>
    )
  }

  createLists() {
    return this.props.eleven.reverse().map( (cv, i, arr) => {
      const { _id, name, gameover, createdAt, players, playersOnOff, role, mode, scene } = cv;
      const url = `/games/${_id}`;
      const btnStyle = {width: '70px', height: '70px'};
      const iconStyle = {width: '100%'};

      return (
        <tr key={_id}>
          <td>#{arr.length-i}</td>
          <td>{name}</td>
          <td>{moment(createdAt).format('MM/DD HH:mm')}</td>
          <td>
            <div className='lists-badge' style={{backgroundColor: (scene=='king'?'#917b53':'#4d8b9a')}}>
              <img src={mode=='classic'?'/pics/mode-1.png':'/pics/mode-2.png'} />
            </div>
          </td>
          <td>
            { this.createEntries( _id, players, playersOnOff, role, url, btnStyle, iconStyle, gameover, 0 ) }
          </td>
          <td>
            { this.createEntries( _id, players, playersOnOff, role, url, btnStyle, iconStyle, gameover, 1 ) }
          </td>
          <td>
            <IconButton href={url} tooltip="觀戰" iconStyle={iconStyle} style={btnStyle}>
              <img src='/pics/eleven-role-04.png'/>
            </IconButton>
          </td>
        </tr>
      )
    })
  }

  render() {
    return (
      <div>

        <Header />

        <div id='about-outer'>
          <div id='about'>
            <h2>兩人對戰策略棋類遊戲</h2>
            <h2><span>2</span> 種場景 <span className='grey'>&times;</span> <span>2</span> 種模式 <span className='grey'>&times;</span> <span>3</span> 種職業</h2>
          </div>
        </div>

        <Newgame />

        <table id='game-list'>
          <thead>
            <tr>
              <th>編號</th>
              <th>遊戲名稱</th>
              <th>創建時間</th>
              <th>設定</th>
              <th>先手</th>
              <th>後手</th>
              <th>觀戰</th>
            </tr>
          </thead>
          <tbody>
            { this.createLists() }
          </tbody>
        </table>

      </div>
    );
  }
}

function mapStateToProps( state ){
  return { eleven: state.reducer_one }
}

export default connect(mapStateToProps)(Landing);

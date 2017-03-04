import React, { Component } from 'react';

import FlatButton from 'material-ui/FlatButton';


export default class Newgame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: 'classic',
      scene: 'king'
    }
  }

  componentDidMount() {
    document.newgame.mode.value = 'classic';
    document.newgame.scene.value = 'king';
  }

  modeChange(e) {
    const mode = e.target.value;
    this.setState({ mode });
  }

  sceneChange(e) {
    const scene = e.target.value;
    this.setState({ scene });
  }

  onCreaterClick(event) {
    event.preventDefault();
    let name = this.refs.room.value;
    let mode = this.state.mode;
    let scene = this.state.scene;


    if ( !Meteor.user() ) {
      alert('請先登入會員！')
    } else if( !name || name.length>9 ) {
      alert('請輸入 9 個字以內的遊戲房間名稱！')
    } else {
      Meteor.call('eleven.newgame', name, mode, scene);
    }
  }

  render() {
    const labelStyle = {
      height: '39px',
      display: 'block',
      lineHeight: '39px',
      fontSize: '18px',
      letterSpacing: '2px',
      color: this.state.scene=='king'?'#917b53':'#4d8b9a',
    };
    const style = {
      width: '240px',
      height: '39px',
      outline: this.state.scene=='king'?'1px solid #917b53':'1px solid #4d8b9a',
      margin: '18.5px 0'
    };
    // console.log(this.state.mode);
    // console.log(this.state.scene);
    return (
      <div id='newgame-outer'>
        <form id='newgame' name='newgame'>

          <div id='newgame-left'>

            <div className='newgame-box'>
              <div className='newgame-ttl'><span>房間名稱</span></div>
              <div className='newgame-content'>
                <div className='label-box roomname'>
                  <input style={{border: this.state.scene=='king'?'1px solid #917b53':'1px solid #4d8b9a'}} type='text' ref='room'></input>
                </div>
              </div>
            </div>

            <div className='newgame-box'>
              <div className='newgame-ttl'><span>遊戲場景</span></div>
              <div className='newgame-content'>
                <div className='label-box'>
                  <label>
                    <input id='btn-king' type="radio" name="scene" onChange={this.sceneChange.bind(this)} value="king"/>
                    國王陵墓
                    <div className='radio-dot'><div className='radio-dot-color'></div></div>
                  </label>
                  <label>
                    <input id='btn-pirate' type="radio" name="scene" onChange={this.sceneChange.bind(this)} value="pirate"/>
                    海賊巢穴
                    <div className='radio-dot'><div className='radio-dot-color'></div></div>
                  </label>
                </div>
                <div className='p-box'>
                  {
                    this.state.scene == 'king'
                    ? <p>擁有遼闊疆土的古代君主長眠於此<br/>如今也只有覬覦珠寶的盜墓者才會來訪</p>
                    : <p>經歷內鬨而分崩離析的海賊霸主們<br/>在離開老巢前似乎還遺留下了大量的財寶</p>
                  }
                </div>
              </div>
            </div>

            <div className='newgame-box'>
              <div className='newgame-ttl'><span>遊戲模式</span></div>
              <div className='newgame-content'>
                <div className='label-box'>
                  <label>
                    <input id='btn-classic' type="radio" name="mode" onChange={this.modeChange.bind(this)} value="classic"/>
                    經典模式
                    <div className='radio-dot'>
                      <div className='radio-dot-color' style={{backgroundColor: (this.state.scene=='king'?'#917b53':'#4d8b9a')}}></div>
                    </div>
                  </label>
                  <label>
                    <input id='btn-deathBattle' type="radio" name="mode" onChange={this.modeChange.bind(this)} value="deathBattle"/>
                    死鬥模式
                    <div className='radio-dot'>
                      <div className='radio-dot-color' style={{backgroundColor: (this.state.scene=='king'?'#917b53':'#4d8b9a')}}></div>
                    </div>
                  </label>
                </div>
                <div className='p-box'>
                  {
                    this.state.mode == 'classic'
                    ? <p>勝利條件：不計回合，先得到 11 分者得勝</p>
                    : <p>勝利條件：第 11 回合結束時，高分者得勝</p>
                  }
                </div>
              </div>
            </div>

            <div className='newgame-box'>
              <div className='newgame-ttl'>
                <div id='newgame-badge' style={{backgroundColor: (this.state.scene=='king'?'#917b53':'#4d8b9a')}}>
                  <img src={this.state.mode=='classic'?'/pics/mode-1.png':'/pics/mode-2.png'} />
                </div>
              </div>
              <div className='newgame-content'>
                <FlatButton
                  label='新遊戲'
                  style={style}
                  labelStyle={labelStyle}
                  onClick={this.onCreaterClick.bind(this)}
                />
              </div>
            </div>

          </div>



          <div id='newgame-right'>
            <div id='scene-img'>
              <img src={this.state.scene=='king'?'/pics/scene-king.png':'/pics/scene-pirate.jpg'} />
            </div>
          </div>

        </form>
      </div>
    );
  }
}

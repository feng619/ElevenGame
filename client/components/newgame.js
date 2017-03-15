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

  onCreaterClick(vsComputer, event) {
    event.preventDefault();
    let name = this.refs.room.value;
    let mode = this.state.mode;
    let scene = this.state.scene;

    if ( !Meteor.user() ) {
      alert('請先登入會員！')
    } else if( !name || name.length>9 ) {
      alert('請輸入 9 個字以內的遊戲房間名稱！')
    } else {
      Meteor.call('eleven.newgame', name, mode, scene, vsComputer);
    }
  }

  render() {
    const sceneColor = this.state.scene=='king'?'#917b53':(this.state.scene=='pirate'?'#4d8b9a':(this.state.scene=='forest'?'#61833d':'#b05d2c'));
    const labelStyle = {
      height: '39px',
      display: 'block',
      lineHeight: '39px',
      fontSize: '16px',
      letterSpacing: '2px',
      color: sceneColor,
    };
    const style = {
      width: '150px',
      height: '39px',
      outline: `1px solid ${sceneColor}`,
      margin: '18.5px 15px 18.5px 0'
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
                  <input style={{border: `1px solid ${sceneColor}`}} type='text' ref='room'></input>
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
                <div className='label-box'>
                  <label>
                    <input id='btn-forest' type="radio" name="scene" onChange={this.sceneChange.bind(this)} value="forest"/>
                    蘑菇森林
                    <div className='radio-dot'><div className='radio-dot-color'></div></div>
                  </label>
                  <label>
                    <input id='btn-alchemy' type="radio" name="scene" onChange={this.sceneChange.bind(this)} value="alchemy"/>
                    煉金工坊
                    <div className='radio-dot'><div className='radio-dot-color'></div></div>
                  </label>
                </div>
                <div className='p-box'>
                  {
                    this.state.scene == 'king'
                    ? <p>擁有遼闊疆土的古代君主長眠於此<br/>如今也只有覬覦珠寶的盜墓者才會來訪</p>
                    : ( this.state.scene == 'pirate'
                      ? <p>經歷內鬨而分崩離析的海賊霸主們<br/>在離開老巢前似乎還遺留下了大量的財寶</p>
                      : ( this.state.scene == 'forest'
                        ? <p>這片魔法森林擁有巨大的生長能量<br/>各種珍稀的菇類多到似乎沒有拔完的那天</p>
                        : <p>五顏六色的魔法藥水總是供不應求<br/>城鎮裡到處都有這樣忙碌的小工坊在運作</p>
                      )
                    )
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
                      <div className='radio-dot-color' style={{backgroundColor: sceneColor}}></div>
                    </div>
                  </label>
                  <label>
                    <input id='btn-deathBattle' type="radio" name="mode" onChange={this.modeChange.bind(this)} value="deathBattle"/>
                    死鬥模式
                    <div className='radio-dot'>
                      <div className='radio-dot-color' style={{backgroundColor: sceneColor}}></div>
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
                <div id='newgame-badge' style={{backgroundColor: sceneColor}}>
                  <img src={this.state.mode=='classic'?'/pics/mode-1.png':'/pics/mode-2.png'} />
                </div>
              </div>
              <div className='newgame-content'>
                <FlatButton
                  label='玩家 vs 電腦'
                  style={style}
                  labelStyle={labelStyle}
                  onClick={this.onCreaterClick.bind(this, 'Faker')}
                />

                <FlatButton
                  label='玩家 vs 玩家'
                  style={style}
                  labelStyle={labelStyle}
                  onClick={this.onCreaterClick.bind(this, false)}
                />
              </div>
            </div>

          </div>



          <div id='newgame-right'>
            <div id='scene-img'>
              <img src={this.state.scene=='king'?'/pics/scene-king.png':
                (this.state.scene=='pirate'?'/pics/scene-pirate.jpg':(this.state.scene=='forest'?'/pics/scene-forest.png':'/pics/scene-alchemy.jpg'))} />
            </div>
          </div>

        </form>
      </div>
    );
  }
}

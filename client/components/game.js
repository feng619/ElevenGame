import React, { Component } from 'react';
import { Eleven } from '../../imports/collections/eleven';
import { connect } from 'react-redux';

import GameCalc from './game-calc';
import GameBoard from './game-board';
import GameInfo from './game-info';

class Game extends Component {
  handleOff( e ) {
    e.preventDefault();
    if ( Meteor.user() ) {
      // 處理直接關掉網頁或是直接改變網址的狀況
      Meteor.call('eleven.playerOff', this.props.eleven[0]._id, Meteor.user().username);
    }
  }

  componentDidMount() {
    Meteor.subscribe('eleven');
    window.onbeforeunload = this.handleOff.bind(this);
  }

  componentWillUnmount() {
    if ( Meteor.user() ) {
      //處理按鈕回首頁的狀況
      Meteor.call('eleven.playerOff', this.props.eleven[0]._id, Meteor.user().username);
    }
  }

  renderList() {
    const eleven = this.props.eleven[0];
    return (
      <div id="game" key={eleven._id}>
        <GameInfo eleven={eleven}/>
        <GameBoard eleven={eleven}/>
        <GameCalc eleven={eleven}/>
      </div>
    );
  }

  render() {
    if(!this.props.eleven[0]) {
      return (<div>Loading...</div>);
    }
    return (
      <div>
        { this.renderList() }
      </div>
    );
  }
}


function mapStateToProps( state, ownProps ){
  return { eleven: Eleven.find(ownProps.params.gameId).fetch() }
}

export default connect(mapStateToProps)(Game);

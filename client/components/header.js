import React, { Component } from 'react';
import { Link } from 'react-router';
import Accounts from './accounts';


export default class Header extends Component {
  render() {
    return (
      <div id='appbar'>

        <h1><Link to="/">光棍達人</Link><span>v 1.0.0</span></h1>
        <Accounts />

      </div>
    );
  }
}

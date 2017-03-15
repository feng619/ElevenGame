import React, { Component } from 'react';
import { Link } from 'react-router';
import Accounts from './accounts';


export default class Header extends Component {
  render() {
    return (
      <div id='appbar'>

        <h1>
          <Link to="/">光棍達人</Link>
          <span>v 1.2.0
            <span className='version-info'>&sect; 新增場景『煉金工坊』</span>
            <span className='version-info'>&sect; 新增 Faker（電腦）</span>
          </span>
        </h1>
        <Accounts />

      </div>
    );
  }
}

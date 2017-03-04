import React from 'react';
import ReactDOM from 'react-dom';
import { Eleven } from '../imports/collections/eleven';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import App from './components/app';
import Landing from './components/landing';
import Game from './components/game';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Tracker } from 'meteor/tracker';
import { Provider } from 'react-redux';

import '../imports/startup/accounts-config.js';

const elevenReducer = (state = [], action) => {
  switch (action.type) {
    case 'SET_ELEVEN':
      return action.eleven;
    default:
      return state;
  }
};

const reducers = combineReducers({reducer_one: elevenReducer});
const store = createStore(reducers);

Tracker.autorun(() => {
  store.dispatch({
    type: 'SET_ELEVEN',
    eleven: Eleven.find().fetch(),
  });
});

Meteor.startup(() => {
  ReactDOM.render(
    <Provider store={store}>
      <MuiThemeProvider>
        <Router history={browserHistory}>
          <Route path="/" component={App}>
            <IndexRoute component={Landing} />
            <Route path="games/:gameId" component={Game} />
          </Route>
        </Router>
      </MuiThemeProvider>
    </Provider>,
    document.querySelector('#render-target'))
});

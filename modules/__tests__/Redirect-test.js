import expect from 'expect';
import React from 'react';
import createHistory from 'history/lib/createMemoryHistory';
import Redirect from '../Redirect';
import Router from '../Router';
import Route from '../Route';
import execSteps from './execSteps';

describe('A <Redirect>', function () {
  var node;
  beforeEach(function () {
    node = document.createElement('div');
  });

  afterEach(function () {
    React.unmountComponentAtNode(node);
  });

  it('works', function (done) {
    React.render((
      <Router history={createHistory('/notes/5')}>
        <Route path="/messages/:id" />
        <Redirect from="/notes/:id" to="/messages/:id" />
      </Router>
    ), node, function () {
      expect(this.state.location.pathname).toEqual('/messages/5');
      done();
    });
  });

  it('calls onEnter but not onLeave', function (done) {
    var enterCalled = 0;
    var leaveCalled = 0;
    var onEnter = () => enterCalled++;
    var onLeave = () => leaveCalled++;
    var history = createHistory('/notes/5')
    React.render((
      <Router history={history} onUpdate={() => console.log(enterCalled)}>
        <Route onEnter={onEnter} onLeave={onLeave}>
          <Route path="/messages/:id"/>
          <Redirect from="/notes/:id" to="/messages/:id"/>
        </Route>
      </Router>
    ), node, function() {
      expect(enterCalled).toEqual(1);
      expect(leaveCalled).toEqual(0);
      done();
    });
  });

  it('doesn\'t call onEnter or onLeave when redirecting inside the same parent', function (done) {
    var enterCalled = 0;
    var leaveCalled = 0;
    var onEnter = () => enterCalled++;
    var onLeave = () => leaveCalled++;
    var history = createHistory('/messages/5/details');

    var steps = [
      function () {
        expect(this.state.location.pathname).toEqual('/messages/5/details');
        expect(enterCalled).toEqual(1);
        expect(leaveCalled).toEqual(0);
        history.replaceState(null, '/messages/6');
      },
      function () {
        expect(this.state.location.pathname).toEqual('/messages/6/details');
        expect(enterCalled).toEqual(1);
        expect(leaveCalled).toEqual(0);
      }
    ];

    var execNextStep = execSteps(steps, done);

    React.render((
      <Router onUpdate={execNextStep} history={history}>
        <Route onEnter={onEnter} onLeave={onLeave}>
          <Redirect from="/messages/:id" to="/messages/:id/details"/>
          <Route path="/messages/:id/details"/>
        </Route>
      </Router>
    ), node, execNextStep);
  });
});

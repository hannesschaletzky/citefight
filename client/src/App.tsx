/* eslint-disable react/jsx-pascal-case */

import React, { Component } from 'react';
import st from './App.module.scss';
import 'styles/app.global.scss'; //import global styles that can be used in entire app now

import { BrowserRouter, Route, Switch } from 'react-router-dom'

import Root_Header from 'components/root/Header'
import Landing from 'components/pages/Landing'

import Match from 'components/match/Match'
import Setup from 'components/match/setup/Setup'
import Mockup from 'components/match/Mockup'

import Root_Footer from 'components/root/Footer'
import Legal from 'components/pages/Legal'
import About from 'components/pages/About'
import Donate from 'components/pages/Donate'
import Credits from 'components/pages/Credits'

import NotFound from 'components/pages/errorpages/NotFound'

class App extends Component {
  state = {
  };
  
render() {

  return (

    <div className={st.Root_Background}>

      <div className={st.Root_Header}>
        <Root_Header/>
      </div>
      <div className ={st.Root_FlexboxWrapper}>
        <div className={st.Root_Content}>
          <BrowserRouter>
            <Switch>
              <Route exact path="/" component={Landing}/>

              <Route exact path="/start" component={Landing}/>
              <Route exact path="/legal" component={Legal}/>
              <Route exact path="/about" component={About}/>
              <Route exact path="/donate" component={Donate}/>
              <Route exact path="/credits" component={Credits}/>

              <Route exact path="/match/mockup" component={Mockup}/> 
              <Route path="/match/setup/:id" component={Setup}/> 
              <Route path="/match/:id" component={Match}/>

              <Route component={NotFound} /* final route for 404 not found *//>
            </Switch>
          </BrowserRouter>
        </div>
        <div className={st.Root_Footer}>
          <Root_Footer/>
        </div>
      </div>
      
    </div>

    );
  }
}

export default App;
/* eslint-disable react/jsx-pascal-case */

import React, { Component } from 'react';
import st from './App.module.scss';

import { BrowserRouter, Route, Switch } from 'react-router-dom'

import Root_Header from 'components/root/Header'
import Landing from 'components/pages/Landing'

import Join from 'components/match/join/Join'
import Match from 'components/match/Match'
import Setup from 'components/match/setup/Setup'
import Mockup from 'components/match/Mockup'

import Root_Footer from 'components/root/Footer'
import Legal from 'components/pages/Legal'
import About from 'components/pages/About'
import Donate from 'components/pages/Donate'
import Credits from 'components/pages/Credits'
import TwitterRedirect from 'components/pages/TwitterRedirect'
import TwitterCallback from 'components/match/setup/TwitterCallback'


import NotFound from 'components/pages/errorpages/NotFound'

class App extends Component {
  state = {
  };

  //redirect user to twitter login page
  redirectToTwitterLogin(token:string="") {
    window.location.href = 'https://api.twitter.com/oauth/authorize?oauth_token=' + token
  }
  
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

                <Route path="/redirect/:token" render={() => 
                  <TwitterRedirect onRedirect={(token:string) => this.redirectToTwitterLogin(token)}/>}
                />
                
                <Route exact path="/start" component={Landing}/>
                <Route exact path="/legal" component={Legal}/>
                <Route exact path="/about" component={About}/>
                <Route exact path="/donate" component={Donate}/>
                <Route exact path="/credits" component={Credits}/>

                  
                <Route exact path="/match/mockup" component={Mockup}/> 
                <Route exact path="/match/setup/twittercallback" component={TwitterCallback}/> 
                <Route path="/match/join/:id" component={Join}/>
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
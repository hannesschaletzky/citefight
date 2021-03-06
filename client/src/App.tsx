/* eslint-disable react/jsx-pascal-case */
import React, { Component } from 'react';
import st from './App.module.scss';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import {log} from 'components/Logic'

//interfaces
import {JoinProps} from 'components/Functional_Interface'

//components
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

class App extends Component <any, any> {

  constructor(props: any) {
      super(props)
      this.state = {
        pusherClient: null
      }
  }

  componentDidMount() {
    log('componentDidMount')
  }

  componentDidUpdate(prevProps:any) {
    log('componentDidUpdate: ' + prevProps)
  }
  
  setPusherClient(newClient:any) {
    log('set pusher client in app!')
    log(newClient)
    this.setState({pusherClient: newClient})
    this.forceUpdate() //THIS IS NOT GETTING CALLED 
  }

  //redirect user to twitter login page
  redirectToTwitterLogin(token:string="") {
    window.location.href = 'https://api.twitter.com/oauth/authorize?oauth_token=' + token
  }
  
  render() {

    //create react component from functional 
    let joinprops:JoinProps = {
        pusherClient: this.state.pusherClient,
        onNewClient: this.setPusherClient
    }
    const JoinComp = React.createElement(Join, joinprops)

    return (
      
      <div className={st.Root_Body}>

        <div className={st.Root_Header}>
          <Root_Header/>
        </div>
        <div className ={st.Root_Content}>
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

              <Route path="/join/:id" render={() => JoinComp}/>
              <Route path="/setup/:id" component={Setup}/>
              <Route path="/match/:id" component={Match}/>
                
              <Route component={NotFound} /* final route for 404 not found *//>
            </Switch>
          </BrowserRouter>
        </div>
        <div className={st.Root_Footer}>
          <Root_Footer/>
        </div>
      </div>
    );
  }
}

export default App


/*
  <Route path="/join/:id" component={Join}/>
  <Route path="/setup/:id" component={Setup}/>
  <Route path="/match/:id" component={Match}/>


  tried:
  <Route path="/join/:id" render={() => 
    Join(this.state.pusherClient, this.setPusherClient)}
  />



*/




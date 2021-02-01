/* eslint-disable react/jsx-pascal-case */

import React, { Component } from 'react';
import st from './App.module.scss';

import { BrowserRouter, Route, Switch } from 'react-router-dom'

import Tweet from 'components/match/tweet/Tweet'

import Root_Header from 'components/root/Header'
import Landing from 'components/pages/Landing'

import Matchroom from 'components/match/Match'
import Setup from 'components/match/Setup'
import Mockup from 'components/match/Mockup'

import Root_Footer from 'components/root/Footer'
import Legal from 'components/pages/Legal'
import About from 'components/pages/About'
import Donate from 'components/pages/Donate'
import Credits from 'components/pages/Credits.module'

import NotFound from 'components/pages/errorpages/NotFound'

class App extends Component {
  state = {
    response: '',
    post: '',
    responseToPost: '',
  };
  
  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.data.length }))
      .catch(err => console.log(err));
  }
  
  callApi = async () => {
    const response = await fetch('/api/users');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    
    return body;
  };
  
  handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const response = await fetch('/api/world', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ post: this.state.post }),
    });
    const body = await response.text();
    
    this.setState({ responseToPost: body });
  };
  
render() {
    return (
      <div>
        <div className={st.App}>
          <p>{this.state.response}</p>
          <form onSubmit={this.handleSubmit}>
            <p>
              <strong>Post to Server:</strong>
            </p>
            <input
              type="text"
              value={this.state.post}
              onChange={e => this.setState({ post: e.target.value })}
            />
            <button type="submit">Submit</button>
          </form>
          <p>{this.state.responseToPost}</p>
        </div>
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
                  <Route exact path="/tweet" component={Tweet}/>
                  <Route exact path="/legal" component={Legal}/>
                  <Route exact path="/about" component={About}/>
                  <Route exact path="/donate" component={Donate}/>
                  <Route exact path="/credits" component={Credits}/>

                  <Route exact path="/match/setup" component={Setup}/> 
                  <Route exact path="/match/mockup" component={Mockup}/> 
                  <Route path="/match/:id" component={Matchroom}/>

                  <Route component={NotFound} /* final route for 404 not found *//>
                </Switch>
              </BrowserRouter>
            </div>
            <div className={st.Root_Footer}>
              <Root_Footer/>
            </div>
          </div>
          
        </div>

      </div>
    );
  }
}

export default App;
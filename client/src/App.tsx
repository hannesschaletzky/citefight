/* eslint-disable react/jsx-pascal-case */

import React, { Component } from 'react';
import styles from './App.module.scss';

import { BrowserRouter, Route, Switch } from 'react-router-dom'

import Test_Comp from './components/Test'
import TestRouteComp from './components/TestRouteComp'
import NotFound from './components/pages/errorpages/NotFound'

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
        <div className={styles.App}>
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
        <div>
          <BrowserRouter>
            <Switch>
              <Route exact path="/" component={Test_Comp}/>

              <Route exact path="/test" component={TestRouteComp}/>

              <Route component={NotFound} /* final route for 404 not found *//>
            </Switch>
          </BrowserRouter>
        </div>
      </div>
    );
  }
}

export default App;
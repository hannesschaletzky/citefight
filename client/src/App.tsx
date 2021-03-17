/* eslint-disable react/jsx-pascal-case */
/* eslint-disable no-lone-blocks */
import React, { useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import st from './App.module.scss';
import {log} from 'components/Logic'

//functional-interfaces
import {JoinProps} from 'components/Functional_Interfaces'
import {SetupProps} from 'components/Functional_Interfaces'
import {MatchProps} from 'components/Functional_Interfaces'

//components
import Root_Header from 'components/0_root/Header'
import Landing from 'components/pages/Landing'

import Join from 'components/1_join/Join'
import Setup from 'components/2_setup/Setup'
import Match from 'components/3_match/Match'

import Root_Footer from 'components/0_root/Footer'
import Legal from 'components/pages/Legal'
import About from 'components/pages/About'
import Donate from 'components/pages/Donate'
import Credits from 'components/pages/Credits'
import TwitterRedirect from 'components/pages/TwitterRedirect'
import TwitterCallback from 'components/pages/TwitterCallback'

import NotFound from 'components/pages/errorpages/NotFound'


export default function App() {
    //state
    const [pusherClient,setPusherClient] = useState(null)

    const onNewPusherClient = (newClient:any) => {
        log('set pusher client in app:')
        log(newClient)
        setPusherClient(newClient)
    }

    //redirect user to twitter login page
    const redirectToTwitterLogin = (token:string="") => {
        window.location.href = 'https://api.twitter.com/oauth/authorize?oauth_token=' + token
    }

    /*
    ##################################
    ##################################
            GET FUNC. COMPONENTS
    ##################################
    ##################################
    */

    const getJoinComp = () => {
        //create react component from functional 
        let props:JoinProps = {
                pusherClient: pusherClient,
                onNewClient: onNewPusherClient
        }
        const comp = React.createElement(Join, props)
        return comp
    }

    const getSetupComp = () => {
        //create react component from functional 
        let props:SetupProps = {
                pusherClient: pusherClient
        }
        const comp = React.createElement(Setup, props)
        return comp
    }

    const getMatchComp = () => {
        //create react component from functional 
        let props:MatchProps = {
                pusherClient: pusherClient
        }
        const comp = React.createElement(Match, props)
        return comp
    }

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
                        <TwitterRedirect onRedirect={(token:string) => redirectToTwitterLogin(token)}/>}
                    />
                    
                    <Route exact path="/start" component={Landing}/>
                    <Route exact path="/legal" component={Legal}/>
                    <Route exact path="/about" component={About}/>
                    <Route exact path="/donate" component={Donate}/>
                    <Route exact path="/credits" component={Credits}/>

                    <Route exact path="/match/setup/twittercallback" component={TwitterCallback}/> 
                        
                    <Route path="/join/:id" render={() => getJoinComp()}/>
                    <Route path="/setup/:id" render={() => getSetupComp()}/>
                    <Route path="/match/:id" render={() => getMatchComp()}/>
                        
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




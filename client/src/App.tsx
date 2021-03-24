/* eslint-disable react/jsx-pascal-case */
/* eslint-disable no-lone-blocks */
import React, { useState , useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import st from './App.module.scss';
import {log} from 'components/Logic'
//functional-interfaces
import {JoinProps} from 'components/Functional_Interfaces'
import {SetupProps} from 'components/Functional_Interfaces'
import {MatchProps} from 'components/Functional_Interfaces'
//main components
import Root_Header from 'components/0_root/Header'
import Root_Footer from 'components/0_root/Footer'
import Landing from 'components/1_landing/Landing'
import Join from 'components/2_join/Join'
import Setup from 'components/3_setup/Setup'
import Match from 'components/4_match/Match'
//pages
import Legal from 'components/pages/Legal'
import About from 'components/pages/About'
import Donate from 'components/pages/donate/Donate'
import DonateThankYou from 'components/pages/donate/Donate_ThankYou'
import Credits from 'components/pages/Credits'
import TwitterRedirect from 'components/pages/TwitterRedirect'
import TwitterCallback from 'components/pages/TwitterCallback'
//error pages
import NotFound from 'components/pages/errorpages/NotFound'


export default function App() {
    //state
    const [pusherClient,setPusherClient] = useState(null)
    const [logInfo, setLogInfo] = useState(false)

    useEffect(() => {
        if (!logInfo) {
            console.log('Hi there! Nice that you wanna have a technical look 🎉🎉🎉 Let me know if you find any game-related issues that could be improved. I am keen on enhancing the user experience in any way. Feel free to connect on LinkedIn: https://www.linkedin.com/in/hannesschaletzky/')
            setLogInfo(true)
        }
    }, [logInfo])

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
                    <Route exact path="/donate/thankyou" component={DonateThankYou}/> 
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




/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useEffect, useState, useReducer } from 'react';
import  { Redirect } from 'react-router-dom'
import st from './Match.module.scss'
import {log, logObjectPretty} from 'components/Logic'
//UI Elements
import CircularProgress from '@material-ui/core/CircularProgress'
//interfaces
import {LocalStorage} from 'components/Interfaces'
import {Player} from 'components/Interfaces'
import {Profile} from 'components/Interfaces'
import {Tweet} from 'components/Interfaces'
//functional interfaces
import {MatchProps} from 'components/Functional_Interfaces'
//logic
import {isValidMatchID} from 'components/Logic'
import {initSettings} from 'components/Logic'
//puhser
import * as Pu from 'components/pusher/Pusher'

//STATE
interface State {
    matchID: string;
    state: Status;
}
enum Status {
    init = 'init'
}
const init_state:State = {
    matchID: '',
    state: Status.init
}

//DATA
const init_profiles:Profile[] = []
const init_players:Player[] = []
const init_tweets:Tweet[] = []

export default function Match(props:MatchProps) {
    //state
    const [redirectToJoin,setRedirectToJoin] = useState(false)
    const [validMatchID,setValidMatchID] = useState(true)
    //refs
    const ref_username = useRef("")
    const ref_state = useRef(init_state)
    const ref_tweets = useRef(init_tweets)
    const ref_profiles = useRef(init_profiles)
    const ref_settings = useRef(initSettings)
    const ref_players = useRef(init_players)
    //pusher refs
    const ref_pusherClient = useRef(Pu.init_pusherCient)
    const ref_pusherChannel = useRef(Pu.init_pusherChannel)
    const ref_pusherState = useRef(Pu.State.init)
    const [,forceUpdate] = useReducer(x => x + 1, 0);

	useEffect(() => {

        //check if given MatchID is invalid
        let matchID = isValidMatchID(window.location.href)
        if (!matchID) {
            setValidMatchID(false)
            return
        }
        ref_state.current.matchID = matchID

        //get pusherclient (only at first loading -> .init)
        if (props.pusherClient === null && ref_pusherState.current === Pu.State.init) {
            log('no pusher client -> redirect to join')
            setRedirectToJoin(true)
            return
        }

        //set initial values passed from setup
        const setValue = (ref:React.MutableRefObject<any>, type:LocalStorage) => {
            let data = sessionStorage.getItem(type)
            if (data !== null) {
                ref.current = JSON.parse(data)
                sessionStorage.removeItem(type)
                //log('set item: ' + type)
                log(ref.current)
            }
        }
        setValue(ref_tweets, LocalStorage.Trans_Content)
        setValue(ref_profiles, LocalStorage.Trans_Profiles)
        setValue(ref_players, LocalStorage.Trans_Players)
        setValue(ref_settings, LocalStorage.Trans_Settings)
        log('transfered necessary data from setup')

        //retrieve & set pusherclient (once)
        if (ref_pusherClient.current === null) {
            ref_pusherClient.current = props.pusherClient
            log('match: retrieved and set pusher client')
            //get username
            let savedUsername = localStorage.getItem(LocalStorage.Username)
            if (savedUsername !== null) {
                ref_username.current = savedUsername
                joinGame()
            }
            else {
                log('error joining -> no username')
            }
        }
  	})

    /*
    ##################################
    ##################################
                GENERAL
    ##################################
    ##################################
    */

    const getMatchName = ():string => {
        return Pu.Channel_Match + ref_state.current.matchID
    }
    
    const setPusherState = (state:Pu.State) => {
        //log('set state to: ' + state)
        ref_pusherState.current = state
        forceUpdate()
    }

    /*
    ##################################
    ##################################
            JOIN && LEAVE 
    ##################################
    ##################################
    */
    const joinGame = () => {

        //bind to connection state change events
        ref_pusherClient.current.connection.bind(Pu.Conn_State_Change, (states:any) => {
            //states = {previous: 'oldState', current: 'newState'}
            log('new pusher state from event "state_change": ' + states.current)
            setPusherState(states.current) 
        })

        //sub to events of lobby if connected
        if (ref_pusherClient.current.connection.state === Pu.State.connected) {

            //unsubscribe from lobby channel first
            let name:string = Pu.Channel_Lobby + ref_state.current.matchID
            ref_pusherClient.current.unsubscribe(name)

            //sub to match channel
            name = getMatchName()
            const channel = props.pusherClient.subscribe(name)
            channel.bind(Pu.Channel_Sub_Fail, (err:any) => {
                logObjectPretty(err)
                setPusherState(Pu.State.failed) 
            })
            channel.bind(Pu.Channel_Sub_Success, () => {
                log('MATCH: sub to: ' + channel.name)

                //BIND TO ALL NECESSARY GAME EVENTS HERE

                //user left pusher-event 
                channel.bind(Pu.Channel_Member_Removed, 
                    (member:any) => userLeft(member.id)
                )
                
                //set channel
                ref_pusherChannel.current = channel
                
                //TEMP
                setPusherState(Pu.State.connected)
            })
        }
    }

    const userLeft = (memberID:string) => {
        //member id -> e.g. 2021-03-09T01:38:42.941Z7
        ref_players.current.forEach((item:Player, i) => {
            if (item.pusherID === memberID) {
                ref_players.current.splice(i,1)
                forceUpdate()
                return
            }
        })
    }

    /*
    ##################################
    ##################################
                  UI 
    ##################################
    ##################################
    */
    
    const getSpecialContent = () => {

        let content = <div></div>

        if (!validMatchID) {
            content =  
                <div className={st.State_Con}>
                    Invalid Match ID! Double check the URL, only numbers allowed
                </div>
            return content
        }

        //redirect back to join page
        if (redirectToJoin) {
            let redirectURL = '/join/' + ref_state.current.matchID
            return <Redirect to={redirectURL}/>
        }
        
        //PUSHER STATE
        //loading
        if (ref_pusherState.current === Pu.State.init ||
            ref_pusherState.current === Pu.State.connecting) {
            content =  
                <div className={st.State_Con}>
                    <CircularProgress/>
                </div>
        }
        //error
        else if (ref_pusherState.current !== Pu.State.connected) {
            content =  
                <div className={st.State_Con}>
                    Could not connect to lobby, pusher service status is: {ref_pusherState.current}. 
                    Please try again later!
                </div>
        }

        return content
    }

	return (
		<div>
            {getSpecialContent()}
            Matchroom for ID: {ref_state.current.matchID} ready to go!
        </div>
	)
}



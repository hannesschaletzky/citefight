/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useEffect, useState } from 'react';
import  { Redirect } from 'react-router-dom'
import st from './Match.module.scss'
import {log, logObjectPretty} from 'components/Logic'

//UI Elements
import CircularProgress from '@material-ui/core/CircularProgress'

//interfaces
import {LocalStorage} from 'components/Interfaces'
import {Settings, 
        Settings_Roundtime, 
        Settings_Pictures, 
        Settings_DrinkingMode} from 'components/Interfaces'
import {Player} from 'components/Interfaces'
import {Profile} from 'components/Interfaces'
import {Tweet} from 'components/Interfaces'
//functional interfaces
import {MatchProps} from 'components/Functional_Interface'

//puhser
import * as Pu from 'components/pusher/Pusher'

//logic
import {isValidMatchID} from 'components/Logic'

//STATE
interface Match_State {
    matchID: string;
    state: MatchStatus;
}
enum MatchStatus {
    init = 'init'
}
const init_state:Match_State = {
    matchID: '',
    state: MatchStatus.init
}

//DATA
const init_profiles:Profile[] = []
const init_players:Player[] = []
const init_tweets:Tweet[] = [] 
const init_settings:Settings = {
    rounds: 25,
    roundtime: Settings_Roundtime.Normal,
    autoContinue: true,
    pictures: Settings_Pictures.AtHalftime,
    drinking: Settings_DrinkingMode.Off
}



export default function Match(props:MatchProps) {
    //state
    const [redirectToJoin,setRedirectToJoin] = useState(false)
    const [validMatchID,setValidMatchID] = useState(true)

    //refs
    const ref_state = useRef(init_state)
    const ref_tweets = useRef(init_tweets)
    const ref_profiles = useRef(init_profiles)
    const ref_settings = useRef(init_settings)
    const ref_players = useRef(init_players)
    const ref_pusherState = useRef(Pu.PusherState.init)

	useEffect(() => {

        //check if given MatchID is invalid
        let matchID = isValidMatchID(window.location.href)
        if (!matchID) {
            setValidMatchID(false)
            return
        }
        ref_state.current.matchID = matchID

        //get pusherclient (only at first loading -> .init)
        if (props.pusherClient === null && ref_pusherState.current === Pu.PusherState.init) {
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
                log('set item: ' + type)
                //log(ref.current)
            }
        }
        setValue(ref_tweets, LocalStorage.Trans_Content)
        setValue(ref_profiles, LocalStorage.Trans_Profiles)
        setValue(ref_players, LocalStorage.Trans_Players)
        setValue(ref_settings, LocalStorage.Trans_Settings)
  	})

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
        /*
            init = 'init',
            connecting = 'connecting',
            connected = 'connected',
            unavailable = 'unavailable',
            disconnected = 'disconnected',
            error = 'error'
        */
        //loading
        if (ref_pusherState.current === Pu.PusherState.init ||
            ref_pusherState.current === Pu.PusherState.connecting) {
            content =  
                <div className={st.State_Con}>
                    <CircularProgress/>
                </div>
        }
        //error
        else if (ref_pusherState.current !== Pu.PusherState.connected) {
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
            Matchroom for ID: {ref_state.current.matchID}
        </div>
	)
}



/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState, useReducer } from 'react';
import  { Redirect } from 'react-router-dom'
import st from './Match.module.scss'
import {log, logErr, logObjectPretty} from 'components/Logic'
//UI Elements
import CircularProgress from '@material-ui/core/CircularProgress'
//interfaces
import {LocalStorage} from 'components/Interfaces'
import {Player} from 'components/Interfaces'
import {Profile} from 'components/Interfaces'
import {Tweet} from 'components/Interfaces'
import {ChatMsg, SysMsgType} from 'components/Interfaces'
//functional interfaces
import {MatchProps} from 'components/Functional_Interfaces'
//logic
import {isValidMatchID} from 'components/Logic'
//pusher
import * as Pu from 'components/pusher/Pusher'
//components
import Players from '../2_setup/players/Players'
import Nav, {NavProps} from './nav/Nav'
import Countdown from './Countdown'
import * as Chat from 'components/00_shared/chat/Chat'
import * as Settings from 'components/00_shared/settings/Settings'
import * as Not from 'components/00_shared/notification/Notification'
import * as TweetComp from './tweet/Tweet'

//STATE
interface State {
    matchID: string
    status: Status
    statusMsg: string //for everyone joined

    roundIndex: number
    roundStarts: Date
    roundEnds: Date
    roundCountdown: number

}
enum Status {
    init,
    everyoneJoined,
    everyoneReady,
    calcRound,
    startRoundcountdown,
    showRound,
    showRound_Solution,
    
    //errors
    errorInitalValues
}
const init_state:State = {
    matchID: '',
    status: Status.init,
    statusMsg: '',
    roundIndex: -1,
    roundStarts: new Date(),
    roundEnds: new Date(),
    roundCountdown: -1
}

//DATA
const init_userName = ""
const init_profiles:Profile[] = []
const init_players:Player[] = []
const init_tweets:Tweet[] = []
const init_chat:ChatMsg[] = []

export default function Match(props:MatchProps) {
    //state
    const [redirectToJoin,setRedirectToJoin] = useState(false)
    const [validMatchID,setValidMatchID] = useState(true)
    //refs
    const ref_username = useRef(init_userName)
    const ref_state = useRef(init_state)
    const ref_tweets = useRef(init_tweets)
    const ref_profiles = useRef(init_profiles)
    const ref_settings_lobby = useRef(Settings.initSettings_Lobby)
    const ref_settings_match = useRef(Settings.initSettings_Match)
    const ref_notification = useRef(Not.init)
    const ref_players = useRef(init_players)
    const ref_chat = useRef(init_chat)
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

        //only get inital values at first loading
        if (ref_state.current.status === Status.init) {
            if (ref_tweets.current === init_tweets) {
                setInitialValues(ref_tweets, LocalStorage.Trans_Tweets)
            }
            if (ref_profiles.current === init_profiles) {
                setInitialValues(ref_profiles, LocalStorage.Trans_Profiles)
            }
            if (ref_players.current === init_players) {
                setInitialValues(ref_players, LocalStorage.Trans_Players)
                //set everyone to unready
                ref_players.current.forEach((player) => {
                    player.ready = false
                })
            }
            if (ref_settings_lobby.current === Settings.initSettings_Lobby) {
                setInitialValues(ref_settings_lobby, LocalStorage.Trans_Settings)
                //set roundtime
                ref_state.current.roundCountdown = ref_settings_lobby.current.roundtime
            }
            if (ref_username.current === init_userName) {
                setInitialValues(ref_username, LocalStorage.Username)
            }
        }

        //set welcome chat messages
        if (ref_chat.current.length === 0) {
            addSysMsg(SysMsgType.welcome, '🎉🎉🎉 Welcome to the Match 🎉🎉🎉')
            addSysMsg(SysMsgType.welcome, 'Set yourself ready and lets go!')
        }
        
        //retrieve & set pusherclient (once at beginning)
        if (ref_pusherClient.current === null) {
            ref_pusherClient.current = props.pusherClient
            log('match: retrieved and set pusher client')
            joinGame()
        }
  	})

    /*
    ##################################
    ##################################
                GENERAL
    ##################################
    ##################################
    */

    //set initial values passed from setup
    const setInitialValues = (ref:React.MutableRefObject<any>, type:LocalStorage) => {
        let data = sessionStorage.getItem(type)
        if (data !== null) {
            if (type === LocalStorage.Username) {
                ref.current = data
            }
            else {
                ref.current = JSON.parse(data)
            }
            sessionStorage.removeItem(type)
            log(ref.current)
        }
        else {
            //CRITIAL ERROR -> could not set inital values
            logErr(type + ' is null! Inital Values from Setup not retrieved')
            setStatus(Status.errorInitalValues, true)
        }
    }

    const addSysMsg = (type:SysMsgType, inputMsg:string) => {
        Chat.addSysMsg(type, inputMsg, ref_chat)
    }

    const userIsReady = ():boolean => {
        for(let i=0;i<ref_players.current.length;i++) {
            let player = ref_players.current[i]
            if (player.name === ref_username.current) {
                return player.ready
            }
        }
        return false
    }

    const getMatchName = ():string => {
        return Pu.Channel_Match + ref_state.current.matchID
    }
    
    const setPusherState = (state:Pu.State) => {
        //log('set state to: ' + state)
        ref_pusherState.current = state
        forceUpdate()
    }

    const setStatus = (newStatus:Status, update:boolean = false) => {
        ref_state.current.status = newStatus
        if (update) {forceUpdate()} 
    }

    const isAdmin = ():boolean => {
        if (ref_username.current !== null && ref_players.current.length > 0) {
            if (ref_username.current === ref_players.current[0].name) {
                return true
            }
            return false
        }
        return true
    }

    const showNotification = (msg:string, notType:Not.Type, update:boolean=true)  => {
        let newNot:Not.Notification = {
            id: new Date().toISOString(),
            type: notType,
            msg: msg,
            disapearAfter: 5000
        }
        //update UI
        ref_notification.current = newNot
        if (update) {forceUpdate()}
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
            channel.bind(Pu.Channel_Member_Removed, //left
                (member:any) => userLeft(member.id)
            )
            channel.bind(Pu.Channel_Member_Added,   //joined
                () => checkIfEveryoneJoined()
            )
            channel.bind(Pu.Channel_Sub_Fail, (err:any) => {
                logObjectPretty(err)
                setPusherState(Pu.State.failed) 
            })
            channel.bind(Pu.Channel_Sub_Success, () => {
                log('MATCH: sub to: ' + channel.name)

                channel.bind(Pu.EventType.Match_State, 
                    (data:Pu.Event) => handleEvent_State(data)
                )
                channel.bind(Pu.EventType.Player, 
                    (data:Pu.Event) => handleEvent_Players(data)
                )
                channel.bind(Pu.EventType.Chat, 
                    (data:Pu.Event) => handleEvent_Chat(data)
                )

                //set channel
                ref_pusherChannel.current = channel
                
                //start next step
                setPusherState(Pu.State.connected)
                checkIfEveryoneJoined()
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
            Flow
    ##################################
    ##################################
    */

    //1ST: Check if everyone is in matchroom
    const checkIfEveryoneJoined = () => {
        //first user handles
        if (isAdmin()) {
            let members:any[] = ref_pusherChannel.current.members.members
            log(members)
            
            //determine missing players
            let playersLeft = ''
            let statusMsg = ''
            ref_players.current.forEach((player) => {
                if (!(player.pusherID in members)) {
                    playersLeft += player.name + ', '
                }
            })
            //determine action + broadcast 
            if (playersLeft !== '') {
                playersLeft = playersLeft.substring(0, playersLeft.length - 2) //remove last ,
                statusMsg = `Waiting for: ${playersLeft} to enter the Matchroom`
                log(statusMsg)
                ref_state.current.status = Status.everyoneJoined
                ref_state.current.statusMsg = statusMsg
                fireEvent_State()
            }
            else {
                log('everyone joined -> start first round')
                /*
                    fire after timeout to avoid having another 
                    call with Status.everyoneJoined coming in afterwards
                */
                setTimeout(() => {
                    setStatus(Status.everyoneJoined)
                    ref_state.current.statusMsg = 'Everyone joined, starting...'
                    fireEvent_State()
                }, 500) 
                setTimeout(() => {
                    setStatus(Status.calcRound)
                    ref_state.current.statusMsg = statusMsg
                    fireEvent_State()
                }, 2500) 
            }
        }
    }

    //2ND: Calculate start of new round and trigger countdown
    const calculateRound = () => {
        //increment round
        ref_state.current.roundIndex += 1

        //round start/end time
        let startCountdown = 3
        let start = new Date()
        let end = new Date()
        //start
        start.setSeconds(start.getSeconds() + startCountdown)
        ref_state.current.roundStarts = start
        //end
        end.setSeconds(end.getSeconds() + startCountdown + ref_settings_lobby.current.roundtime)
        ref_state.current.roundEnds = end

        //start round-countdown
        setStatus(Status.startRoundcountdown)
        fireEvent_State()
    }

    //3RD: SHOW ROUND
    const showRound = () => {
        log(`show round with index ${ref_state.current.roundIndex}`)
        setStatus(Status.showRound, true)

        //reset countdown
        ref_state.current.roundCountdown = ref_settings_lobby.current.roundtime

        //calc differnce until target date
        let diffS = ref_settings_lobby.current.roundtime



        //logic for decrease timeout
        const decrease = () => {
            if (ref_state.current.status === Status.showRound) {
                ref_state.current.roundCountdown -= 1
                forceUpdate()
            }
        }

        /*
        FROM HERE INTO LOGIC MODULE
        */

        //last call
        setTimeout(() => {
            decrease()
            showRoundSolution()
        }, diffS*1000)
        //intermediate calls
        let span = 1000
        while (diffS > 1) { //>1 -> skip last call
            setTimeout(() => {
                decrease()
            }, span)
            span += 1000
            diffS -= 1
        }

        /*
        UNTIL HERE
        */
    }

    //4TH: SHOW ROUND SOLUTION
    const showRoundSolution = () => {
        log('finished round')
        setStatus(Status.showRound_Solution, true)
    }



    //helper function
    const setYourselfReady = () => {
        //set yourself ready
        ref_players.current.forEach((player) => {
            if (player.name === ref_username.current) {
                player.ready = true
            }
        })
        fireEvent_Players()
    }

    /*
    ##################################
    ##################################
            EVENT: State
    ##################################
    ##################################
    */
    const handleEvent_State = (event:Pu.Event) => {
        //check type-mismatch
        if (event.type !== Pu.EventType.Match_State) {
            log('EventType mismatch in handleEvent_State:\n\n' + event)
            return
        }
        //set new state
        let newState:State = event.data
        //log('new state retrieved')
        //log(newState)
        ref_state.current = newState
        forceUpdate()

        //ADMIN EVENTS
        if (isAdmin()) {
            if (ref_state.current.status === Status.calcRound) {
                calculateRound()
            }
        }
    }

    const fireEvent_State = async () => {
        //prepare
        let event:Pu.Event = {
            type: Pu.EventType.Match_State,
            data: ref_state.current
        }
        //trigger
        Pu.triggerEvent(getMatchName(), event.type, event)
    }

    /*
    ##################################
    ##################################
            EVENT: Players
    ##################################
    ##################################
    */
    const handleEvent_Players = (event:Pu.Event) => {
        //security
        if (event.type !== Pu.EventType.Player) {
            log('EventType mismatch in handleEvent_Player:\n\n' + event)
            return
        }
        //set new players
        let newPlayers:Player[] = event.data
        ref_players.current = newPlayers
        forceUpdate()
    }

    const fireEvent_Players = async () => {
        //prepare
        let event:Pu.Event = {
            type: Pu.EventType.Player,
            data: ref_players.current
        }
        //trigger
        Pu.triggerEvent(getMatchName(), event.type, event)
    }

    /*
    ##################################
    ##################################
        EVENT: Chat
    ##################################
    ##################################
    */
    const handleEvent_Chat = (event:Pu.Event) => {

        //security
        if (event.type !== Pu.EventType.Chat) {
            log('EventType mismatch in handleEvent_Chat:\n\n' + event)
            return
        }

        //set new chat
        let newChat:ChatMsg[] = event.data
        log('total msgs: ' + newChat.length)
        ref_chat.current = newChat
        forceUpdate()
    }

    const fireEvent_Chat = async () => {

        //prepare
        ref_chat.current = Chat.cutToSizeLimit(ref_chat.current)
        let event:Pu.Event = {
            type: Pu.EventType.Chat,
            data: ref_chat.current
        }
        //trigger
        Pu.triggerEvent(getMatchName(), event.type, event)
    }

    /*
    ##################################
    ##################################
                HANDLERS 
    ##################################
    ##################################
    */
    const onReadyClick = () => {
        setYourselfReady()
    }

    const onNextRoundCountdownFinished = () => {
        showRound()
    }

    const onSelectAnswer = (profile:Profile) => {
        log('selected answer: ' + profile.screen_name)
    }

    const onNewChatMessage = (newMsg:ChatMsg) => {
        newMsg.n = ref_username.current //chat component does not know/set user name
        ref_chat.current.push(newMsg)
        fireEvent_Chat()
    }
    const onSettingsChanged = (newSettings:Settings.Settings_Match) => {
        ref_settings_match.current = newSettings
        forceUpdate()
    }

    /*
    ##################################
    ##################################
                  UI 
    ##################################
    ##################################
    */

    const getOverlayContent = () => {

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
        
        /*
        ######################
            PUSHER STATE
        ######################
        */
        //loading
        if (ref_pusherState.current === Pu.State.init ||
            ref_pusherState.current === Pu.State.connecting) {
            return content =  
                <div className={st.State_Con}>
                    <CircularProgress/>
                </div>
        }
        //error
        else if (ref_pusherState.current !== Pu.State.connected) {
            return content =  
                <div className={st.State_Con}>
                    Could not connect to lobby, pusher service status is: {ref_pusherState.current}. 
                    Please try again later!
                </div>
        }

        /*
        ######################
            MATCH STATUS
        ######################
        */
        //ERROR (transferring initial values from setup)
        if (ref_state.current.status === Status.errorInitalValues) {
            return content =  
                <div className={st.State_Con}>
                    Critial Error: Inital Values could not be transferred from setup.  
                </div>
        }
        //HAS EVERTYONE JOINED?
        else if (ref_state.current.status === Status.init ||
            ref_state.current.status === Status.everyoneJoined) {
            return content =  
                <div className={st.State_Con}>
                    <div className={st.State_Caption}>
                        {ref_state.current.statusMsg}
                    </div>
                    <CircularProgress/>
                </div>
        }

        return content
    }
    
    //OPERATIONAL MATCH LOGIC
    const getContent = () => {

        let content = <div></div>

        //IS EVERYONE READY?
        if (ref_state.current.status === Status.everyoneReady) {
            return content = 
                <div className={st.Content_Con}>
                    {!ref_settings_lobby.current.autoContinue && 
                        <div className={st.AutoContinue_Con}>
                            Autocontinue: Off
                        </div>
                    }
                    {ref_settings_lobby.current.autoContinue && 
                        <div className={st.AutoContinue_Con}>
                            Autocontinue in 30
                        </div>
                    }
                    <div className={st.Players_Con}>
                        <Players   
                            data={ref_players.current}
                            currentUser={ref_username.current}
                        />
                    </div>
                    {!userIsReady() && 
                        <button className={st.Button_Ready} onClick={() => onReadyClick()}>
                            I am Ready
                        </button>
                    }
                </div>
        }
        //CALC ROUND
        else if (ref_state.current.status === Status.calcRound) {
            return content = 
                <div className={st.Content_Con}>
                    <div className={st.State_Caption}>
                        Setting up next round...
                    </div>
                    <CircularProgress/>
                </div>
        }
        //START ROUND-COUNTDOWN
        else if (ref_state.current.status === Status.startRoundcountdown) {
            return content = 
                <div className={st.Content_Con}>
                    <div>
                        Round {ref_state.current.roundIndex + 1} starts in:
                    </div>
                    <div>
                        {Countdown(ref_state.current.roundStarts, onNextRoundCountdownFinished)}
                    </div>
                </div>
        }
        //SHOW ROUND 
        else if (ref_state.current.status === Status.showRound) {
            return content = 
                <div className={st.Content_Con}>
                    {TweetComp.getComponent(ref_tweets.current[0])}
                </div>
        }
        //SHOW SOLUTION 
        else if (ref_state.current.status === Status.showRound_Solution) {
            return content = 
                <div className={st.Content_Con}>
                    {TweetComp.getComponent(ref_tweets.current[0])}
                </div>
        }
        
        return content
    }

    const getNavComp = () => {
        let props:NavProps = {
            profiles: ref_profiles.current,
            onSelectAnswer: onSelectAnswer,
            chatmessages: ref_chat.current,
            onNewMessage: onNewChatMessage,
            settings: ref_settings_match.current,
            onSettingsChanged: onSettingsChanged,
            onNotfication: showNotification
        }
        return React.createElement(Nav, props)
    }

	return (
		<div className={st.Con}>
            {Not.getComponent(ref_notification.current)}
            {getOverlayContent()}
            <div className={st.Left_Con}>
                AD CONTAINER
            </div>
            <div className={st.Center_Con}>
                {getContent()}
            </div>
            <div className={st.Right_Con}>
                <div className={st.Info_Con}>
                    <div className={st.Clock} title="Time">
                        {ref_state.current.roundCountdown}
                    </div>
                    <div className={st.Round} title="Round">
                        {(ref_state.current.roundIndex + 1)+ '/' + ref_settings_lobby.current.rounds}
                    </div>
                </div>
                <div className={st.Nav_Con}>
                    {getNavComp()}
                </div>
            </div>
        </div>
	)
}




/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState, useReducer } from 'react';
import  { Redirect } from 'react-router-dom'
import st from './Match.module.scss'
import st_tweet from './tweet/Tweet.module.scss'
import {log, logErr, logObjectPretty} from 'components/Logic'
//UI Elements
import CircularProgress from '@material-ui/core/CircularProgress'
//interfaces
import {LocalStorage} from 'components/Interfaces'
import {Player} from 'components/Interfaces'
import {Profile} from 'components/Interfaces'
import {Tweet} from 'components/Interfaces'
import {Matrix, Point} from 'components/Interfaces'
import {ChatMsg, SysMsgType} from 'components/Interfaces'
//functional interfaces
import {MatchProps, MatrixProps} from 'components/Functional_Interfaces'
//logic
import {isValidMatchID, setCountdown} from 'components/Logic'
//pusher
import * as Pu from 'components/pusher/Pusher'
//components
import Players from '../3_setup/players/Players'
import Nav, {NavProps} from './nav/Nav'
import MatrixComponent from './matrix/Matrix'
import * as Chat from 'components/00_shared/chat/Chat'
import * as Settings from 'components/00_shared/settings/Settings'
import * as Not from 'components/00_shared/notification/Notification'
import * as TweetComp from './tweet/Tweet'

interface RoundSolution {
    t_userName: string
    t_userTag: string
    t_userVerified: boolean
    t_profileURL: string
    t_userPicURL: string
    t_tweetURL: string
}
const init_roundSolution: RoundSolution = {
    t_userName: '',
    t_userTag: '',
    t_userVerified: false,
    t_profileURL: '',
    t_userPicURL: '',
    t_tweetURL: ''
} 

enum Status {
    init = 'init',
    everyoneJoined = 'everyoneJoined',
    everyoneReady = 'everyoneReady',
    calcRound = 'calcRound',
    startRoundcountdown = 'startRoundcountdown',
    showRound = 'showRound',
    showRound_OwnPick = 'showRound_OwnPick',
    showRound_Solution = 'showRound_Solution',
    finishMatch = 'finishMatch',
    
    //errors
    errorInitalValues = 'errorInitalValues'
}

//STATE
interface State {
    matchID: string
    status: Status
    statusMsg: string //for everyone joined

    readyCountdown: number
    startCountdown: number
    roundIndex: number
    roundStarts: Date
    roundCountdown: number
    roundActive: boolean
    roundSolution: RoundSolution
    fadeInClass: string //used to manage fade in of top con in tweet component
}
const init_state:State = {
    matchID: '',
    status: Status.init,
    statusMsg: '',
    readyCountdown: -1,
    startCountdown: -1,
    roundIndex: -1,
    roundStarts: new Date(),
    roundCountdown: -1,
    roundActive: false,
    roundSolution: init_roundSolution,
    fadeInClass: st_tweet.Top_Con_Fade_In_1
}

//MATRIX
const init_matrix:Matrix = {}
interface Event_Matrix_Data {
    player: string
    round: number
    point: Point
}
interface Event_Matrix {
    type: Pu.EventType
    data: Event_Matrix_Data
}

//DATA
const init_userName = ""
const init_profiles:Profile[] = []
const init_players:Player[] = []
const init_tweets:Tweet[] = []
const init_chat:ChatMsg[] = []
const init_timeouts:NodeJS.Timeout[] = []

export default function Match(props:MatchProps) {
    //state
    const [redirectToJoin,setRedirectToJoin] = useState(false)
    const [validMatchID,setValidMatchID] = useState(true)
    //refs
    const ref_username = useRef(init_userName)
    const ref_state = useRef(init_state)
    const ref_matrix = useRef(init_matrix)
    const ref_tweets = useRef(init_tweets)
    const ref_profiles = useRef(init_profiles)
    const ref_settings_lobby = useRef(Settings.initSettings_Lobby)
    const ref_settings_match = useRef(Settings.initSettings_Match)
    const ref_notification = useRef(Not.init)
    const ref_players = useRef(init_players)
    const ref_chat = useRef(init_chat)
    const ref_HoverPic = useRef('')
    const ref_showMatrix = useRef(false)
    const ref_timeouts = useRef(init_timeouts)
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

        //at first loading -> do init stuff (set values, cache images, create matrix, ...)
        if (ref_state.current.status === Status.init) {
            if (ref_tweets.current === init_tweets) {
                setInitialValues(ref_tweets, LocalStorage.Trans_Tweets)
                /*
                //mock
                for(let i=0;i<ref_tweets.current.length;i++) {
                    if (i===0) {
                        ref_tweets.current[i].c_photo1 = "https://pbs.twimg.com/media/EsWwrpuW8AIRn_q.jpg"
                        ref_tweets.current[i].c_photo2 = "" 
                        ref_tweets.current[i].c_photo3 = "" 
                        ref_tweets.current[i].c_photo4 = "" 
                    }
                    if (i===1) {
                        ref_tweets.current[i].c_photo1 = "https://pbs.twimg.com/media/EsWwrpuW8AIRn_q.jpg"
                        ref_tweets.current[i].c_photo2 = "https://pbs.twimg.com/media/EsWwrpvXEAAeKSW.jpg" 
                        ref_tweets.current[i].c_photo3 = "" 
                        ref_tweets.current[i].c_photo4 = "" 
                    }
                    if (i===2) {
                        ref_tweets.current[i].c_photo1 = "https://pbs.twimg.com/media/EsWwrpuW8AIRn_q.jpg"
                        ref_tweets.current[i].c_photo2 = "https://pbs.twimg.com/media/EsWwrpvXEAAeKSW.jpg" 
                        ref_tweets.current[i].c_photo3 = "https://pbs.twimg.com/media/EsWwrpmW8AALVuN.jpg" 
                        ref_tweets.current[i].c_photo4 = "" 
                    }
                    if (i===3) {
                        ref_tweets.current[i].c_photo1 = "https://pbs.twimg.com/media/EsWwrpuW8AIRn_q.jpg"
                        ref_tweets.current[i].c_photo2 = "https://pbs.twimg.com/media/EsWwrpvXEAAeKSW.jpg" 
                        ref_tweets.current[i].c_photo3 = "https://pbs.twimg.com/media/EsWwrpmW8AALVuN.jpg" 
                        ref_tweets.current[i].c_photo4 = "https://pbs.twimg.com/media/EsWwrppW4AQrA4z.jpg" 
                    }
                }
                */
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

            //dont cache images when set to Off
            if (ref_settings_lobby.current.pictures !== Settings.Pictures.Off) {
                cacheImages()
            }
            createMatrix()

            //set welcome chat messages
            if (ref_chat.current.length === 0) {
                addSysMsg(SysMsgType.welcome, '🎉🎉🎉 Welcome to the Match 🎉🎉🎉')
                addSysMsg(SysMsgType.welcome, 'Set yourself ready and lets go!')
            }

            //retrieve & set pusherclient
            if (ref_pusherClient.current === null) {
                ref_pusherClient.current = props.pusherClient
                log('match: retrieved and set pusher client')
                joinGame()
            }
        }
  	})

    /*
    ##################################
    ##################################
                INIT
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

    const cacheImages = () => {
        //cache images
        let imageUrls:string[] = []
        for(let i=0;i<ref_tweets.current.length;i++) {
            let t = ref_tweets.current[i]
            if (t.c_photo1 !== "") {imageUrls.push(t.c_photo1)}
            if (t.c_photo2 !== "") {imageUrls.push(t.c_photo2)}
            if (t.c_photo3 !== "") {imageUrls.push(t.c_photo3)}
            if (t.c_photo4 !== "") {imageUrls.push(t.c_photo4)}
        }
        log('caching images')
        imageUrls.forEach((picURL) => {
            new Image().src = picURL
        })
        log(imageUrls.length + ' images cached!')
    }

    const createMatrix = () => {

        if (ref_tweets.current.length === 0 || ref_players.current.length === 0) {
            //CRITIAL ERROR -> could not set inital values
            logErr('ref_tweets or ref_players not set! Inital Values from Setup not retrieved')
            setStatus(Status.errorInitalValues, true)
            return
        }

        //one row for each player
        ref_players.current.forEach((player) => {
            //create target array
            let points:Point[] = []
            for(let i=0;i<ref_settings_lobby.current.rounds;i++) {
                let point:Point = {
                    goal: ref_tweets.current[i].t_userTag,
                    answer: '',
                    correct: false,
                    timeMS: ref_settings_lobby.current.roundtime*1000,
                    ready: false
                }
                points.push(point)
            }
            //assign 
            ref_matrix.current[player.name] = points
        })
        log('created matrix')
        log(ref_matrix.current) 
    }

    //double ask user before leaving, but not when game finished
    const handleBeforeUnloadEvent = (ev:BeforeUnloadEvent) => {
        ev.preventDefault()
        return ev.returnValue = ''
    }

    /*
    ##################################
    ##################################
                GENERAL
    ##################################
    ##################################
    */

    //toggle fade in class for answer in tweet component
    const toggleFadeInClass = () => {
        if (ref_state.current.fadeInClass === st_tweet.Top_Con_Fade_In_2) {
            ref_state.current.fadeInClass = st_tweet.Top_Con_Fade_In_1
        }
        else if (ref_state.current.fadeInClass === st_tweet.Top_Con_Fade_In_1) {
            ref_state.current.fadeInClass = st_tweet.Top_Con_Fade_In_2
        }
    }

    const getPointFor = (playerName:string = ref_username.current):Point => {
        return ref_matrix.current[playerName][ref_state.current.roundIndex]
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

    const pictureClick = (newPic:string) => {
        if (ref_HoverPic.current === "") {
            //log('show')
            ref_HoverPic.current = newPic
        }
        else {
            //log('hide')
            ref_HoverPic.current = ""
        }
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
            channel.bind(Pu.Channel_Member_Removed, //left
                (member:any) => userLeft(member.id)
            )
            channel.bind(Pu.Channel_Member_Added, () => { //joined 
                if (ref_state.current.status === Status.everyoneJoined) {
                    checkIfEveryoneJoined()
                }
            })
            
            channel.bind(Pu.Channel_Sub_Fail, (err:any) => {
                logObjectPretty(err)
                setPusherState(Pu.State.failed) 
            })
            channel.bind(Pu.Channel_Sub_Success, () => {
                log('MATCH: sub to: ' + channel.name)

                channel.bind(Pu.EventType.Match_State, 
                    (data:Pu.Event) => handleEvent_State(data)
                )
                channel.bind(Pu.EventType.Matrix, 
                    (data:Event_Matrix) => handleEvent_Matrix(data)
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
                //remove player
                ref_players.current.splice(i,1)
                delete ref_matrix.current[item.name]
                addSysMsg(SysMsgType.userLeft, item.name)
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

        //set round start time
        let start = new Date()
        start.setSeconds(start.getSeconds() + 3)
        ref_state.current.roundStarts = start

        //start round-countdown
        setStatus(Status.startRoundcountdown)
        fireEvent_State()
    }

    //3RD: Calculate start of new round and trigger countdown
    const startRoundCountdown = () => {

        log('start round countdown')

        //calc differnce until target date
        let now = new Date()
        let ref = new Date(ref_state.current.roundStarts)
        let diffMS = ref.getTime() - now.getTime() //milliseconds 
        let diffS = Math.round(diffMS/1000) //seconds -> rounded

        //reset countdown
        ref_state.current.startCountdown = diffS
        forceUpdate()
        
        //logic for decrease timeout
        const decrease = () => {
            ref_state.current.startCountdown -= 1
            forceUpdate()
        }

        setCountdown(diffS, diffMS, decrease, showRound)
    }

    //4TH: SHOW ROUND
    const showRound = () => {

        //add/remove event listener when user refreshes
        if (ref_state.current.roundIndex+1 < ref_settings_lobby.current.rounds) {
            window.addEventListener("beforeunload", handleBeforeUnloadEvent)
        }  
        else {
            //-> remove at last round
            window.removeEventListener("beforeunload", handleBeforeUnloadEvent)
        }

        //calc differnce until target date
        let diffS = ref_settings_lobby.current.roundtime

        //logic for decrease timeout
        const decrease = () => {
            //finish round when everyone answered
            if (ref_state.current.status === Status.showRound_OwnPick) {
                //check if everyone answered
                let finishRound = true
                ref_players.current.forEach((player) => {
                    if (ref_matrix.current[player.name][ref_state.current.roundIndex].answer === '') {
                        finishRound = false
                    }
                })
                if (finishRound) {
                    log('everyone answered -> show solution!')
                    //stop countdown by clearing timeouts
                    ref_timeouts.current.forEach((timeout) => {
                        clearTimeout(timeout)
                    })
                    ref_timeouts.current = []
                    //show solution after small timeout so animation can finish
                    setTimeout(() => showRoundSolution(),1000)
                    return
                }
            }
            ref_state.current.roundCountdown -= 1
            forceUpdate()
        }

        //start countdown and store timeouts
        ref_timeouts.current = setCountdown(diffS, diffS*1000, decrease, showRoundSolution)

        //save solution of round
        let cur = ref_tweets.current[ref_state.current.roundIndex]
        ref_state.current.roundSolution.t_userName = cur.t_userName
        ref_state.current.roundSolution.t_userTag = cur.t_userTag
        ref_state.current.roundSolution.t_userVerified = cur.t_userVerified
        ref_state.current.roundSolution.t_profileURL = cur.t_profileURL
        ref_state.current.roundSolution.t_userPicURL = cur.t_userPicURL
        ref_state.current.roundSolution.t_tweetURL = cur.t_tweetURL

        //hide solution in current
        ref_tweets.current[ref_state.current.roundIndex].t_userName = '???'
        ref_tweets.current[ref_state.current.roundIndex].t_userTag = '???'
        ref_tweets.current[ref_state.current.roundIndex].t_userVerified = true
        ref_tweets.current[ref_state.current.roundIndex].t_profileURL = ''
        ref_tweets.current[ref_state.current.roundIndex].t_userPicURL = ''
        ref_tweets.current[ref_state.current.roundIndex].t_tweetURL = ''

        log(`show round with index ${ref_state.current.roundIndex}`)
        ref_state.current.roundActive = true
        setStatus(Status.showRound, true)
    }

    //5TH: SHOW OWN PICK
    const showOwnSelection = (pick:Profile) => {

        if (pick.screen_name === ref_tweets.current[ref_state.current.roundIndex].t_userTag) {
            log('answer already logged in')
            return
        }

        //set own pick in current
        ref_tweets.current[ref_state.current.roundIndex].t_userName = pick.name
        ref_tweets.current[ref_state.current.roundIndex].t_userTag = pick.screen_name
        ref_tweets.current[ref_state.current.roundIndex].t_userVerified = pick.verified
        ref_tweets.current[ref_state.current.roundIndex].t_profileURL = "https://twitter.com/" + pick.screen_name
        ref_tweets.current[ref_state.current.roundIndex].t_userPicURL = pick.profile_image_url_https
        ref_tweets.current[ref_state.current.roundIndex].t_tweetURL = ''
        
        //calculate new point
        let point:Point = getPointFor()
        point.answer = pick.screen_name
        point.correct = (point.answer === point.goal)
        //time diff
        let now = new Date()
        let ref = new Date(ref_state.current.roundStarts)
        let diffMS = now.getTime() - ref.getTime() //milliseconds 
        point.timeMS = diffMS
        //broadcast
        fireEvent_Matrix(point)

        //manage UI
        log('show pick: ' + pick.name)
        toggleFadeInClass()
        setStatus(Status.showRound_OwnPick, true)
    }

    //6TH: SHOW ROUND SOLUTION
    const showRoundSolution = () => {

        //set solution in current
        ref_tweets.current[ref_state.current.roundIndex].t_userName = ref_state.current.roundSolution.t_userName
        ref_tweets.current[ref_state.current.roundIndex].t_userTag = ref_state.current.roundSolution.t_userTag
        ref_tweets.current[ref_state.current.roundIndex].t_userVerified = ref_state.current.roundSolution.t_userVerified
        ref_tweets.current[ref_state.current.roundIndex].t_profileURL = ref_state.current.roundSolution.t_profileURL
        ref_tweets.current[ref_state.current.roundIndex].t_userPicURL = ref_state.current.roundSolution.t_userPicURL
        ref_tweets.current[ref_state.current.roundIndex].t_tweetURL = ref_state.current.roundSolution.t_tweetURL

        //remove temp values in solution
        ref_state.current.roundSolution.t_userName = ''
        ref_state.current.roundSolution.t_userTag = ''
        ref_state.current.roundSolution.t_userVerified = false
        ref_state.current.roundSolution.t_profileURL = ''
        ref_state.current.roundSolution.t_userPicURL = ''
        ref_state.current.roundSolution.t_tweetURL = ''

        //reset vars
        ref_state.current.roundCountdown = ref_settings_lobby.current.roundtime
        ref_HoverPic.current = ""
        //show solution
        log('show solution')
        toggleFadeInClass()
        ref_state.current.roundActive = false
        setStatus(Status.showRound_Solution, true)

        //game finished
        if (ref_state.current.roundIndex+1 === ref_settings_lobby.current.rounds) {
            return
        }

        //handle autoready
        if (ref_settings_match.current.autoready || ref_settings_lobby.current.autoContinue) {
            const decrease = () => {
                if (ref_state.current.status === Status.showRound_Solution) {
                    ref_state.current.readyCountdown -= 1
                    forceUpdate()
                }
            }
            const finished = () => {
                if (ref_state.current.status === Status.showRound_Solution) {
                    setYourselfReady()
                }
            }
            let diffS = 5
            ref_state.current.readyCountdown = diffS
            forceUpdate()
            setCountdown(diffS, diffS*1000, decrease, finished)
        }
    }

    //7TH: SET READY (-> next round if everyone ready)
    const setYourselfReady = () => {
        //broadcast point
        let point:Point = getPointFor()
        point.ready = true
        fireEvent_Matrix(point)
        //manually adjust UI
        ref_matrix.current[ref_username.current][ref_state.current.roundIndex].ready = true
        forceUpdate()
    }

    //8TH: FINISH MATCH
    const finishMatch = () => {
        log('finish match')
        setStatus(Status.finishMatch, true)
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

        //start round countdown for everyone
        if (ref_state.current.status === Status.startRoundcountdown) {
            startRoundCountdown()
        }

        //ADMIN calculates round
        if (isAdmin() && ref_state.current.status === Status.calcRound) {
            calculateRound()
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
            EVENT: Matrix
    ##################################
    ##################################
    */
    const handleEvent_Matrix = (event:Event_Matrix) => {
        //security
        if (event.type !== Pu.EventType.Matrix) {
            log('EventType mismatch in handleEvent_Matrix:\n\n' + event)
            return
        }
        //set new matrix point
        let d:Event_Matrix_Data = event.data
        ref_matrix.current[d.player][d.round] = d.point
        log('new point:')
        log(ref_matrix.current)

        //update UI -> see how answered already
        if (ref_state.current.status === Status.showRound) {
            forceUpdate()
        }
        //update UI -> see how is ready
        else if (ref_state.current.status === Status.showRound_Solution) {
            forceUpdate()
        }
        
        //ADMIN starts next round if everyone is ready
        if (isAdmin() && ref_state.current.status === Status.showRound_Solution) {
            //check if everyone is ready
            for(let i=0;i<ref_players.current.length;i++) {
                let player = ref_players.current[i]
                if (!getPointFor(player.name).ready) {
                    return
                }
            }
            log('everyone ready -> next round')
            setStatus(Status.calcRound)
            fireEvent_State()
        }
    }

    const fireEvent_Matrix = async (point:Point) => {
        //prepare
        let data:Event_Matrix_Data = {
            player: ref_username.current,
            round: ref_state.current.roundIndex,
            point: point
        }
        let event:Event_Matrix = {
            type: Pu.EventType.Matrix,
            data: data
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
        PASSED TO CHILD COMP 
    ##################################
    ##################################
    */
    const onSelectAnswer = (profile:Profile) => {
        showOwnSelection(profile) 
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
    
    const onDetailedRankingClick = () => {
        ref_showMatrix.current = true
        forceUpdate()
    }

    const onMatrixCloseClick = () => {
        ref_showMatrix.current = false
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
        else if (ref_state.current.status === Status.init || ref_state.current.status === Status.everyoneJoined) {
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

        //calculate display of images
        let showImages = false
        if (ref_settings_lobby.current.pictures === Settings.Pictures.Instantly) {
            showImages = true
        }
        else if (ref_settings_lobby.current.pictures === Settings.Pictures.AtHalftime && 
                 ref_state.current.roundCountdown <= ref_settings_lobby.current.roundtime/2) {
            showImages = true
        }
        //-> always show at solution
        if (ref_settings_lobby.current.pictures !== Settings.Pictures.Off &&
            ref_state.current.status === Status.showRound_Solution) {
            showImages = true
        }

        let fadeInClass = ref_state.current.fadeInClass

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
                        <button className={st.Button_Ready} onClick={() => setYourselfReady()}>
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
                    <div className={st.StartCountdown_Caption}>
                        Round {ref_state.current.roundIndex + 1} starts in:
                    </div>
                    <div className={st.StartCountdown_Number}>
                        {ref_state.current.startCountdown}
                    </div>
                </div>
        }
        //SHOW ROUND 
        else if (ref_state.current.status === Status.showRound) {
            return content = 
                <div className={st.Tweet_Con}>
                    {TweetComp.getComponent(ref_tweets.current[ref_state.current.roundIndex], showImages, fadeInClass, pictureClick)}
                </div>
        }
        //SHOW OWN PICK 
        else if (ref_state.current.status === Status.showRound_OwnPick) {
            return content = 
                <div className={st.Tweet_Con}>
                    {TweetComp.getComponent(ref_tweets.current[ref_state.current.roundIndex], showImages, fadeInClass, pictureClick)}
                </div>
        }
        //SHOW SOLUTION 
        else if (ref_state.current.status === Status.showRound_Solution) {
            return content = 
                <div className={st.Tweet_Con}>
                    {TweetComp.getComponent(ref_tweets.current[ref_state.current.roundIndex], showImages, fadeInClass, pictureClick)}
                </div>
        }
        //FINISH MATCH 
        else if (ref_state.current.status === Status.finishMatch) {
            return content = 
                <div className={st.Tweet_Con}>
                    <div className={st.Content_Con}>
                        <div className={st.StartCountdown_Caption}>
                            Thanks for playing! If you like the game, consider a <a href="/donate">donation</a> :) <br></br><br></br>
                            If you have any suggestions for improvements, let me know. 
                        </div>
                        
                    </div>
                </div>
        }
        
        return content
    }

    const getReadyCountdownComp = () => {

        //show ready button only on solution and when user is not ready
        if (ref_state.current.status === Status.showRound_Solution && !getPointFor().ready) {
            //game finished
            if (ref_state.current.roundIndex+1 === ref_settings_lobby.current.rounds) {
                return <button className={st.Button_Ready} onClick={() => finishMatch()}>
                            Finish!
                        </button>
            }
            return  <button className={st.Button_Ready} onClick={() => setYourselfReady()}>
                        Ready {ref_state.current.readyCountdown > 0 && ref_state.current.readyCountdown}
                    </button>
        }
        //for the rest -> show countdown
        else {
            return  <div className={st.Clock} title="Answering time left">
                        {ref_state.current.roundCountdown}
                    </div>
        }
    }

    const getNavComp = () => {

        //roundUntil: only include current round in scoreboard when solution was displayed
        //readyEnabled: only display ready changes (enable) when solution is displayed
        let roundUntil = ref_state.current.roundIndex
        let readyEnabled = false
        if (ref_state.current.status === Status.showRound_Solution) {
            roundUntil++
            readyEnabled = true
        }
        if (ref_state.current.status === Status.calcRound) {
            //this is due to that the round index will be increased after calc round has finished
            roundUntil++
        }

        let props:NavProps = {
            profiles: ref_profiles.current,
            onSelectAnswer: onSelectAnswer,
            roundActive: ref_state.current.roundActive,
            chatmessages: ref_chat.current,
            onNewMessage: onNewChatMessage,
            settings: ref_settings_match.current,
            onSettingsChanged: onSettingsChanged,
            matrix: ref_matrix.current,
            userName: ref_username.current,
            roundUntil: roundUntil,
            readyEnabled: readyEnabled,
            onDetailedRankingClick: onDetailedRankingClick,
            onNotfication: showNotification
        }
        return React.createElement(Nav, props)
    }

    const getMatrixComponent = () => {

        let roundUntil = ref_state.current.roundIndex
        if (ref_state.current.status === Status.showRound_Solution ||
            ref_state.current.status === Status.finishMatch) {
            roundUntil++
        }
        let props:MatrixProps = {
            matrix: ref_matrix.current,
            profiles: ref_profiles.current,
            roundUntil: roundUntil,
            onCloseClick: onMatrixCloseClick
        }
        return React.createElement(MatrixComponent, props)
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
                    {getReadyCountdownComp()}
                    <div className={st.Round} title="Round">
                        {(ref_state.current.roundIndex + 1)+ '/' + ref_settings_lobby.current.rounds}
                    </div>
                </div>
                <div className={st.Nav_Con}>
                    {getNavComp()}
                </div>
            </div>
            {ref_HoverPic.current !== '' && 
                <div className={st.HoverPic_Con} onClick={() => pictureClick('')}>
                    <img className={st.HoverPic} src={ref_HoverPic.current} alt=""/>
                </div>
            }
            {ref_showMatrix.current && 
                getMatrixComponent()
            }
        </div>
	)
}




/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-lone-blocks */
import React, { useState, useEffect, useRef, useReducer } from 'react';
import  { Redirect } from 'react-router-dom'
import st from './Join.module.scss';
import {log, logObjectPretty} from 'components/Logic'
//ui 
import CircularProgress from '@material-ui/core/CircularProgress'
//interfaces
import {LocalStorage} from 'components/Interfaces'
import {JoinProps} from 'components/Functional_Interface'
//logic
import {isValidMatchID} from 'components/Logic'
//pusher
import * as Pu from 'components/pusher/Pusher'

//STATUS
interface Status {
    Join: JoinStatus;
    GameInfo: GameInfoStatus;
    MatchID: string;
    AlreadyJoined: string[];
    IsLobby: boolean;
}
enum JoinStatus {
    init,
    pusherConnected,
    pusherError,
    connecting //-> redirect to lobby/match
}
enum GameInfoStatus {
    init,
    loading,
    success,
    error,
}
const init_status:Status = {
    Join: JoinStatus.init, //progress status
    GameInfo: GameInfoStatus.init, //progress status
    MatchID: "",
    AlreadyJoined: [],
    IsLobby: true
}

export default function Join(props:JoinProps) {
    //state
    const [validMatchID,setValidMatchID] = useState(true)
    const [joinEnabled, setJoinEnabled] = useState(false);
    const [userName, setUserName] = useState("");
    const [userNameError, setUserNameError] = useState("");
    //refs
    const ref_status = useRef(init_status)

    const [,forceUpdate] = useReducer(x => x + 1, 0);

    //other
    const maxNameChars = 25
    let gameInfoTimeOut = setTimeout(() => {}, 1) //hold timeout for game info auto abort

    useEffect(() => {

        //check if given MatchID is invalid
        let matchID = isValidMatchID(window.location.href)
        if (!matchID) {
            setValidMatchID(false)
            return
        }
        ref_status.current.MatchID = matchID

        //connect and get pusher client at very first call
        if (props.pusherClient === null && ref_status.current.Join === JoinStatus.init) {
            Pu.getNewPusherClient()
                .then(res => {
                    props.onNewClient(res)
                    setJoinStatus(JoinStatus.pusherConnected) //start game info retrieval
                })
                .catch(err => {
                    log(err)
                    setJoinStatus(JoinStatus.pusherError)
                })
        }

        //retrieve gameinfo
        if (ref_status.current.Join === JoinStatus.pusherConnected &&
            ref_status.current.GameInfo === GameInfoStatus.init) {
            setGameInfoStatus(GameInfoStatus.loading)
            retrieveGameInfo()
        }
    })

    /*
    ##################################
    ##################################
                GENERAL 
    ##################################
    ##################################
    */

    const setJoinStatus = (newStatus:JoinStatus) => {
        ref_status.current.Join = newStatus
        forceUpdate()
    }

    const setGameInfoStatus = (newStatus:GameInfoStatus) => {
        ref_status.current.GameInfo = newStatus
        forceUpdate()
    }

    /*
    ##################################
    ##################################
            RETRIEVE GAME INFO 
    ##################################
    ##################################
    */

    const retrieveGameInfo = () => {

        //if user is first, no pong event will be received, user will be able to join after a time
        gameInfoTimeOut = setTimeout(() => {
            setGameInfoStatus(GameInfoStatus.success)
        }, 2000)

        //sub to lobby channel
        let name:string = Pu.Channel_Lobby + ref_status.current.MatchID
        const channel_Lobby = props.pusherClient.subscribe(name)
        channel_Lobby.bind(Pu.Channel_Sub_Fail, subChannelErr)
        channel_Lobby.bind(Pu.Channel_Sub_Success, () => {
            log('subscribed to channel: ' + channel_Lobby.name)
            channel_Lobby.bind(Pu.Event_Pong_Name, 
                (data:Pu.Event_Pong) => handleEventPong(data)
            )
            Pu.triggerEvent(channel_Lobby.name, Pu.Event_Ping_Name)
        })
    }

    const subChannelErr = (err:any) => {
        logObjectPretty(err)
        setJoinStatus(JoinStatus.pusherError)
    }

    const handleEventPong = (data:Pu.Event_Pong) => {
        log('handle event pong!')
        clearTimeout(gameInfoTimeOut) //clear auto timeout 
        ref_status.current.AlreadyJoined = data.players
        ref_status.current.IsLobby = data.isLobby
        setGameInfoStatus(GameInfoStatus.success)
    }

    /*
    ##################################
    ##################################
                JOIN GAME 
    ##################################
    ##################################
    */
    const onJoinClick = (name:string) =>  {
        //check enabled
        if (!joinEnabled) {
            return
        }
        //is trying
        if (ref_status.current.Join === JoinStatus.connecting) {
            log('already trying')
            return
        }
        executeJoin(name)
    }

    const onQuickJoinClick = () => {
        let userName = localStorage.getItem(LocalStorage.Username)
        if (userName !== null) {
            executeJoin(userName)
        }
    }

    const executeJoin = (userName:string) => {
        localStorage.setItem(LocalStorage.Username, userName)
        setJoinStatus(JoinStatus.connecting)
    }

    /*
    ##################################
    ##################################
            Handlers
    ##################################
    ##################################
    */
    const userNameChanged = (name: string) => {

        //check empty or only spaces
        if (name.length === 0) {
            setJoinEnabled(false)
            setUserNameError('')
        }
        else if (name.length > maxNameChars) {
            setJoinEnabled(false)
            setUserNameError(maxNameChars + ' characters maximum')
        }
        else if (!checkUserNameContent(name)) {
            setJoinEnabled(false)
            setUserNameError('Letters, numbers and "_" are allowed')
        }
        else {
            setUserNameError('')
            setUserName(name)
            setJoinEnabled(true)
        }
    }

    const keyPressed = (event: any) => {
        if (event.key === 'Enter' && userName !== "") {
            onJoinClick(userName)
        }
    }

    const checkUserNameContent = (name:string):boolean => {
        return (/^[a-zA-Z0-9_]+$/.test(name))
    }

    /*
    ##################################
    ##################################
            UI
    ##################################
    ##################################
    */
    const getContent = () => {

        let content = <div></div>

        //check if given MatchID is invalid
        if (!validMatchID) {
            content =  
                <div className={st.State_Con}>
                    Invalid Match ID! Double check the URL, only numbers are allowed
                </div>
            return content
        }
        
        //CONNECT TO PUSHER
        if (ref_status.current.Join === JoinStatus.init) {
            content  = 
            <div className={st.State_Con}>
                <div className={st.State_Caption}>
                    Setting things up...
                </div>
                <CircularProgress/>
            </div>
        }
        //PUSHER -> ERROR
        else if (ref_status.current.Join === JoinStatus.pusherError) {
            content  = 
            <div className={st.State_Con}>
                <div className={st.State_Caption}>
                    Could not connect to Pusher-service. Please try another time.
                </div>
            </div>
        }
        //PUSHER -> SUCCESS -> USER CAN JOIN
        else if (ref_status.current.Join === JoinStatus.pusherConnected) {

            //DETERMINE GAME INFO STATUS
            if (ref_status.current.GameInfo === GameInfoStatus.init ||
                ref_status.current.GameInfo === GameInfoStatus.loading) {
                content  = 
                <div className={st.State_Con}>
                    <div className={st.State_Caption}>
                        Retrieving Game Info...
                    </div>
                    <CircularProgress/>
                </div>
            }
            else if (ref_status.current.GameInfo === GameInfoStatus.error) {
                content  = 
                <div className={st.State_Con}>
                    <div className={st.State_Caption}>
                        Could not retrieve mandatory game info for {ref_status.current.MatchID}. Please try again.
                    </div>
                </div>
            }
            else if (ref_status.current.GameInfo === GameInfoStatus.success) {
                //already-joined component
                let count = ref_status.current.AlreadyJoined.length
                let memberInfo = <div></div>
                //you are the only person in room
                if (count === 0) {
                    memberInfo = 
                        <div className={st.MemberInfo_Caption}>
                            You are the first person to join the lobby!
                        </div>
                }
                //more people already joined
                else if (count >= 1) {
                    let items = [<div></div>]
                    items = []
                    ref_status.current.AlreadyJoined.forEach((member:string, id) => {
                        items.push(
                            <div className={st.MemberInfo_Item} key={id}>
                                {member}
                            </div>
                        )
                    })
                    memberInfo = 
                        <div className={st.MemberInfo_Con}>
                            <div className={st.MemberInfo_Caption}>
                                {count} already joined:
                            </div>
                            <div className={st.MemberInfo_Item_Con}>
                                {items}
                            </div>
                        </div>
                }

                //compose join comp and member info
                content = 
                <div className={st.Join_Con}>
                    <div className={st.Caption}>
                        Type your name and join in!
                    </div>
                    <input  className={st.Input}
                                type="search" 
                                autoComplete="off" 
                                placeholder="Enter a name"
                                onChange={e => userNameChanged(e.target.value)} 
                                onKeyUp={e => keyPressed(e)}/>
                    {(userNameError !== '') &&
                        <div className={st.Error_Con}>
                            {userNameError}
                        </div>
                    }
                    {joinEnabled && 
                        <button className={st.Button_Join} onClick={() => onJoinClick(userName)}>
                            Join
                        </button>
                    }
                    {(localStorage.getItem(LocalStorage.Username) !== null) &&
                        <button className={st.Button_Join} onClick={() => onQuickJoinClick()}>
                            Quick Join as '{localStorage.getItem(LocalStorage.Username)}'
                        </button>
                    }
                    {memberInfo}
                </div>
            }
        }
        //JOINING -> redirect user
        else if (ref_status.current.Join === JoinStatus.connecting) {
            let redirectURL = '/setup/' + ref_status.current.MatchID 
            content = <Redirect to={redirectURL}/>
        }
        return content
    }

    return (
        getContent()
    );
}


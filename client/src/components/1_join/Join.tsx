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
import {JoinProps} from 'components/Functional_Interfaces'
//logic
import {isValidMatchID} from 'components/Logic'
//pusher
import * as Pu from 'components/pusher/Pusher'

//STATUS
interface Status {
    Join: JoinStatus;
    GameInfo: GameInfoStatus;
    MatchID: string;
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

        //sub to match channel -> check if you are only one: yes -> still in lobby phase
        let name:string = Pu.Channel_Match + ref_status.current.MatchID
        const channel = props.pusherClient.subscribe(name)
        channel.bind(Pu.Channel_Sub_Fail, (err:any) => {
            logObjectPretty(err)
            setGameInfoStatus(GameInfoStatus.error)
        })
        channel.bind(Pu.Channel_Sub_Success, () => {
            log('Check match status:')
            if (channel.members.count === 1) {
                log(' -> active setup!')
                setGameInfoStatus(GameInfoStatus.success)
            }
            else {
                log(' -> active match!')
                ref_status.current.IsLobby = false
                setGameInfoStatus(GameInfoStatus.success)
            }
            props.pusherClient.unsubscribe(name) //unsubscribe from match channel
        })
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
        if (!ref_status.current.IsLobby) {
            alert('Match is already ongoing, you cannot join.')
            return
        }
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


/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-lone-blocks */
import React, { useState, useEffect, useRef, useReducer } from 'react';
import  { Redirect } from 'react-router-dom'
import st from './Join.module.scss';
import {log} from 'components/Logic'
//ui 
import CircularProgress from '@material-ui/core/CircularProgress'
//interfaces
import {LocalStorage} from 'components/Interfaces'
import {JoinProps} from 'components/Functional_Interface'
//logic
import {isValidMatchID} from 'components/Logic'
import {getNewPusherClient} from './PusherClient' 

//determine status of join
enum JoinStatus {
    init,
    pusherConnected,
    pusherError,
    connecting //-> redirect to lobby/match
}

//export default function Join(pusherClient:any, onNewClient:(newClient:any) => void) {
export default function Join(props:JoinProps) {
    //state
    const [validMatchID,setValidMatchID] = useState(true)
    const [joinEnabled, setJoinEnabled] = useState(false);
    const [userName, setUserName] = useState("");
    const [userNameError, setUserNameError] = useState("");
    //refs
    const ref_matchID = useRef("")
    const ref_status = useRef(JoinStatus.init)

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
        ref_matchID.current = matchID

        //connect and get pusher client at very first call
        if (props.pusherClient === null && ref_status.current === JoinStatus.init) {
            getNewPusherClient()
            .then(res => {
                props.onNewClient(res)
                setStatus(JoinStatus.pusherConnected)
            })
            .catch(err => {
                log(err)
                setStatus(JoinStatus.pusherError)
            })
        }
    })

    /*
    ##################################
    ##################################
                GENERAL 
    ##################################
    ##################################
    */

    const setStatus = (newStatus:JoinStatus) => {
        ref_status.current = newStatus
        forceUpdate()
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
        if (ref_status.current === JoinStatus.connecting) {
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
        setStatus(JoinStatus.connecting)
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
        if (ref_status.current === JoinStatus.init) {
            content  = 
            <div className={st.State_Con}>
                <div className={st.Caption}>
                    Setting things up
                </div>
                <CircularProgress/>
            </div>
        }
        //PUSHER -> ERROR
        if (ref_status.current === JoinStatus.pusherError) {
            content  = 
            <div className={st.State_Con}>
                <div className={st.Caption}>
                    Could not connect to service. Please try another time.
                </div>
            </div>
        }
        //PUSHER -> SUCCESS -> USER CAN JOIN
        else if (ref_status.current === JoinStatus.pusherConnected) {
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
        //JOINING -> redirect user
        else if (ref_status.current === JoinStatus.connecting) {
            let redirectURL = '/setup/' + ref_matchID.current
            content = <Redirect to={redirectURL}/>
        }
        return content
    }

    return (
        getContent()
    );
}



/*

//channel information (already joined players)
                let memberInfo = [<div key="d"></div>]
                /*
                memberInfo = []
                //you are the only person in room
                if (ref_pusherChannel_Join.current.members.count === 1) {
                    memberInfo.push(
                        <div className={st.MemberInfo_Caption} key="_">
                            You are the first person to join the lobby!
                        </div>
                    )
                }
                //more people already joined
                else if (ref_pusherChannel_Join.current.members.count > 1) {
                    memberInfo.push(
                        <div className={st.MemberInfo_Caption} key="_">
                            {ref_pusherChannel_Join.current.members.count} already joined:
                        </div>
                    )
                    ref_pusherChannel_Join.current.members.each((member:any) => {
                        memberInfo.push(
                            <div className={st.MemberInfo_Item} key={member.id}>
                                {member.id}
                            </div>
                        )
                    })
                }



//loading game info
            if (ref_pusherState.current === PusherStatus.init || 
                ref_pusherState.current === PusherStatus.loading) {
                content = 
                <div className={st.Join_Con}>
                    <div className={st.Caption}>
                        Retrieving Game Info
                    </div>
                    <CircularProgress/>
                </div>
            }
            //retrieved game info
            else if (ref_pusherState.current === PusherStatus.succes) {
                
                //Join + MemberInfo Component
                
            }
            else if (ref_pusherState.current === PusherStatus.error) { 
                content = 
                <div className={st.Join_Con}>
                    Error retrieving game info... critial error!
                </div>
            }

                */


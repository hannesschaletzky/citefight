/* eslint-disable no-lone-blocks */
import React, { useState, useEffect, useRef, useReducer } from 'react';
import  { Redirect } from 'react-router-dom'
import st from './Join.module.scss';
import {log} from 'components/Logic'

//import {getMembersOfChannel} from './PusherClient' //promise to test

//interfaces
import {LocalStorage} from 'components/Interfaces'

//logic
import {isValidMatchID} from 'components/Logic'

//determine status of join
enum JoinStatus {
    init,
    connecting //-> redirect to lobby/match
}

export default function Join() {
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {

        /*
        getMembersOfChannel("presence-123")
            .then(res => {
                log(res)
            })
            .catch(err => {

            })
        */

        //check if given MatchID is invalid
        let matchID = isValidMatchID(window.location.href)
        if (!matchID) {
            setValidMatchID(false)
            return
        }
        ref_matchID.current = matchID

    })

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
        sessionStorage.setItem(LocalStorage.JoinGame, '1')
        localStorage.setItem(LocalStorage.Username, userName)
        ref_status.current = JoinStatus.connecting
        forceUpdate()
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

    

    

    //specify content to return
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
        
        //BEFORE JOIN
        if (ref_status.current === JoinStatus.init) {

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


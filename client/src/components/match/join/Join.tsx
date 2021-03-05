import React, { useState } from 'react';
import  { Redirect } from 'react-router-dom'
import st from './Join.module.scss';

import {LocalStorage} from 'components/Interfaces'

enum JoinStatus {
    init,
    connecting,
    error,
}

export default function Join() {
    const [status, setStatus] = useState(JoinStatus.init);
    const [joinEnabled, setJoinEnabled] = useState(false);
    const [userName, setUserName] = useState("");
    const [userNameError, setUserNameError] = useState("");

    const maxNameChars = 25

    const onJoinClick = (name:string) =>  {
        //check enabled
        if (!joinEnabled) {
            return
        }
        //is trying
        if (status === JoinStatus.connecting) {
            console.log('already trying')
            return
        }

        localStorage.setItem(LocalStorage.Username, name)
        setStatus(JoinStatus.connecting)
    }

    const onQuickJoinClick = () => {
        let userName = localStorage.getItem(LocalStorage.Username)
        if (userName !== null) {
            localStorage.setItem(LocalStorage.Username, userName)
            setStatus(JoinStatus.connecting)
        }
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

        //check if given MatchID is invalid
        let current = window.location.href
        let matchID = current.substr(current.lastIndexOf('/') + 1);
        if (matchID.length === 0 || !(/^\d+$/.test(matchID))) {
            console.log('INVALID ID: ' + matchID)
            return <div>'{matchID}' is an invalid Match ID! Only numbers allowed</div>
        }
        
        let content = <div></div>
        if (status === JoinStatus.init) {
            //BEFORE JOIN
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
        else if (status === JoinStatus.connecting) {
            //Redirect user
            sessionStorage.setItem(LocalStorage.JoinGame, '1')
            let redirectURL = '/match/setup/' + matchID
            content = <Redirect to={redirectURL}/>
        }
        return content
    }

    return (
        getContent()
    );
}

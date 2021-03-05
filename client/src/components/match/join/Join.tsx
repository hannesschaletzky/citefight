/* eslint-disable no-lone-blocks */
import React, { useState, useEffect, useRef, useReducer } from 'react';
import  { Redirect } from 'react-router-dom'
import st from './Join.module.scss';
import {log} from 'components/Logic'

//ui elements
import CircularProgress from '@material-ui/core/CircularProgress';

//interfaces
import {LocalStorage} from 'components/Interfaces'

//logic
import {isValidMatchID} from 'components/Logic'

//determine status of join
enum JoinStatus {
    init,
    connecting //-> redirect to lobby/match
}
//retrieve info of matchroom
enum PusherStatus {
    init,
    loading,
    succes,
    error,
}

let init_pusherChannel:any = null

export default function Join() {
    //state
    const [validMatchID,setValidMatchID] = useState(true)
    const [joinEnabled, setJoinEnabled] = useState(false);
    const [userName, setUserName] = useState("");
    const [userNameError, setUserNameError] = useState("");
    //refs
    const ref_matchID = useRef("")
    const ref_status = useRef(JoinStatus.init)

    //pusher
    const Pusher = require('pusher-js');
    const ref_pusherState = useRef(PusherStatus.init)
    const ref_pusherChannel_Join = useRef(init_pusherChannel)

    const [,forceUpdate] = useReducer(x => x + 1, 0);

    //other
    const maxNameChars = 25

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {

        //check if given MatchID is invalid
        let matchID = isValidMatchID(window.location.href)
        if (!matchID) {
            setValidMatchID(false)
            return
        }
        ref_matchID.current = matchID

        //check if user clicked join -> which triggers a refresh to dc websocket
        if (localStorage.getItem(LocalStorage.JoinGame) !== null) {
            localStorage.removeItem(LocalStorage.JoinGame) //remove from perma storage
            ref_matchID.current = matchID
            sessionStorage.setItem(LocalStorage.JoinGame, '1') //set auto join for next page
            log('joining game: ' + matchID)
            ref_status.current = JoinStatus.connecting
            forceUpdate()
            return
        }

        //trigger retrievement of matchinfo
        if (ref_status.current === JoinStatus.init && 
            ref_pusherState.current === PusherStatus.init) {
            setPusherStatus(PusherStatus.loading)
            connectToPusher()
        }

    })

    /*
    ##################################
    ##################################
            RETRIEVE GAME INFO 
    ##################################
    ##################################
    */
    const setPusherStatus = (status:PusherStatus, err:any={}) => {
        if (status === PusherStatus.error) {
            let str = JSON.stringify(err, null, 4);
            log('error at pusher:')
            log(str)
        }
        ref_pusherState.current = status
        forceUpdate()
    }

    const connectToPusher = () => {

        //create random userid
        let rndID = new Date().toISOString()
        rndID += Math.floor(Math.random() * Math.floor(100))
        log('retrieving game info with userid: ' + rndID)

        //init pusher client
        let appKey = process.env.REACT_APP_PUSHER_KEY
        let cluster = process.env.REACT_APP_PUSHER_CLUSTER
        let _pusherClient = new Pusher(appKey, {
          cluster: cluster,
          encrypted: true,
          authEndpoint: '/api/pusher/auth?id=' + rndID
        })

        //bind error event
        _pusherClient.connection.bind('error', (err:any) => 
            setPusherStatus(PusherStatus.error, err)
        )

        //bind connected
        _pusherClient.connection.bind('connected', async () => {
            log('pusher is connected')
            //sub channel
            const channel = _pusherClient.subscribe("presence-" + ref_matchID.current)
            // -> success
            channel.bind('pusher:subscription_succeeded', () => {
                log('subbed to: ' + ref_matchID.current)
                //set vars
                ref_pusherChannel_Join.current = channel

                //@@TODO
                //sub to member removed and member added and adjust list accordingly

                setPusherStatus(PusherStatus.succes)
            })
            // -> error
            channel.bind('pusher:subscription_error', (err:any) => 
                setPusherStatus(PusherStatus.error, err)
            )
            channel.bind('pusher:member_removed', (member:any) => {
                forceUpdate()
            })
            channel.bind('pusher:member_added', (member:any) => {
                forceUpdate()
            })
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
        if (ref_status.current === JoinStatus.connecting) {
            log('already trying')
            return
        }

        localStorage.setItem(LocalStorage.MatchID, ref_matchID.current)
        localStorage.setItem(LocalStorage.Username, name)
        localStorage.setItem(LocalStorage.JoinGame, '1')
        window.location.reload()
        //document.location.reload()
        //sessionStorage.setItem(LocalStorage.JoinGame, '1')
        //localStorage.setItem(LocalStorage.Username, name)
        //setStatus(JoinStatus.connecting)
    }

    const onQuickJoinClick = () => {
        let userName = localStorage.getItem(LocalStorage.Username)
        if (userName !== null) {
            localStorage.setItem(LocalStorage.MatchID, ref_matchID.current)
            localStorage.setItem(LocalStorage.Username, userName)
            localStorage.setItem(LocalStorage.JoinGame, '1')
            window.location.reload()
            //document.location.reload()
            //sessionStorage.setItem(LocalStorage.JoinGame, '1')
            //localStorage.setItem(LocalStorage.Username, userName)
            //setStatus(JoinStatus.connecting)
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

                //channel information (already joined players)
                let memberInfo = [<div></div>]
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

                //Join + MemberInfo Component
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
            else if (ref_pusherState.current === PusherStatus.error) { 
                content = 
                <div className={st.Join_Con}>
                    Error retrieving game info... critial error!
                </div>
            }
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

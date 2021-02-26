/* eslint-disable react/jsx-pascal-case */
import { useRef, useReducer, useEffect, useState } from 'react';
import  { Redirect } from 'react-router-dom'
import st from './Setup.module.scss'


import {LocalStorage} from 'components/Interfaces'
import {Setup_Event} from 'components/Interfaces'
import {Setup_Player} from 'components/Interfaces'
import {Setup_ChatMsg} from 'components/Interfaces'
import {Twitter_User} from 'components/Interfaces'
import {SysMsgType} from 'components/Interfaces'
import {SetupEventType} from 'components/Interfaces'
import {Setup_Notification} from 'components/Interfaces'
import {NotificationType} from 'components/Interfaces'
import {PusherState} from 'components/Interfaces'

import Search from './search/Search'
import Interaction from './interaction/Interaction'
import Players from './players/Players'
import Chat from './chat/Chat'

const Pusher = require('pusher-js');

const init_twitterUser:Twitter_User[] = []
const init_players:Setup_Player[] = []
const init_chat:Setup_ChatMsg[] = []
const init_Notification:Setup_Notification = {
    display: false,
    msg: "",
    type: NotificationType.Not_Success,
    scssClass: ''
}

let init_pusherCient:any = null
let init_pusherChannel:any = null

export default function Setup() {
    //state
    const [redirectToJoin,setRedirectToJoin] = useState(false)
    //refs
    const ref_twitterUsers = useRef(init_twitterUser);
    const ref_players = useRef(init_players);
    const ref_chat = useRef(init_chat);
    const ref_pusherState = useRef(PusherState.init)
    const ref_notification = useRef(init_Notification)

    //control flow refs
    const ref_username = useRef("")
    const ref_pusherClient = useRef(init_pusherCient)
    const ref_pusherChannel = useRef(init_pusherChannel)

    const [,forceUpdate] = useReducer(x => x + 1, 0);
    
    let notTimeout = setTimeout(() => {}, 1) //store notification-timeout 

    const channelName = 'presence-Game2'

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {

        //CHECK SESSION STORAGE TO DETERMINE WHERE USER CAME FROM

        //twitter login callback && join page
        let twitterLoginSucces = sessionStorage.getItem(LocalStorage.TwitterLoginSuccess)
        let join = sessionStorage.getItem(LocalStorage.JoinGame)
        if (twitterLoginSucces !== null || join != null) {
            //get username
            let savedUsername = localStorage.getItem(LocalStorage.Username)
            if (savedUsername !== null) {
                ref_username.current = savedUsername
                //remove session storage tokens -> prevent infinite loop
                sessionStorage.removeItem(LocalStorage.JoinGame)
                sessionStorage.removeItem(LocalStorage.TwitterLoginSuccess) 
                joinGame()
                return
            }
        }
        
        //only check for redirect back to join page when user not already in state
        if (ref_pusherState.current === PusherState.init) {
            setRedirectToJoin(true)
        }
    })

    /*
    ##################################
    ##################################
        GENERAL FUNCTIONS
    ##################################
    ##################################
    */

    const getIndexOfUser = (name:string):number => {
        for (let i=0; i<ref_players.current.length;i++) {
            let user = ref_players.current[i]
            if (user.name === name) {
                return i
            }
        }
        //console.log('ERROR: could not find user in players array')
        return -1
    }

    
    const setPusherState = (state:PusherState) => {
        console.log('set state to: ' + state)
        ref_pusherState.current = state
        forceUpdate()
    }
    
    const addSysMsg = (type:SysMsgType, inputMsg:string) => {

        //create msg
        let msg:Setup_ChatMsg = {
            n: '',
            m: '',
            t: type
        }

        //determine type 
        if (type === SysMsgType.welcome) {
            msg.m = inputMsg
        }
        else if (type === SysMsgType.userJoined) {
            msg.m = inputMsg + ' joined 🎊'
        }
        else if (type === SysMsgType.userLeft) {
            msg.m = inputMsg + ' left 😭'
        }
        else if (type === SysMsgType.info) {
            msg.m = '📢 ' + inputMsg
        }
        
        //add
        ref_chat.current.push(msg)
    }

    const showNotification = (msg:string, notType:NotificationType)  => {
        let newNot:Setup_Notification = {
            display: true,
            msg: msg,
            type: notType,
            scssClass: ''
        }
        //set scss class
        if (notType === NotificationType.Not_Success) {
            newNot.scssClass = st.Not_Success
        }
        else if (notType === NotificationType.Not_Warning) {
            newNot.scssClass = st.Not_Warning
        }
        else if (notType === NotificationType.Not_Error) {
            newNot.scssClass = st.Not_Error
        }
        //update UI
        ref_notification.current = newNot
        forceUpdate()

        //clear old timeout && set new timer to hide it after seconds
        clearTimeout(notTimeout)
        notTimeout = setTimeout(hideNotification, 5000);
    }

    const hideNotification = () => {
        ref_notification.current.display = false
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

        //has already joined
        if (ref_pusherState.current === PusherState.connected ||
            ref_pusherState.current === PusherState.connecting) {
            console.log('already connecting or connected')
            return
        }
        setPusherState(PusherState.connecting)

        //init pusher client
        let appKey = process.env.REACT_APP_PUSHER_KEY
        let cluster = process.env.REACT_APP_PUSHER_CLUSTER
        let _pusherClient = new Pusher(appKey, {
          cluster: cluster,
          encrypted: true,
          authEndpoint: '/api/pusher/auth?id=' + ref_username.current 
        })

        //bind to all events
        //see: https://pusher.com/docs/channels/using_channels/connection#available-states
        _pusherClient.connection.bind('state_change', (states:any) => {
            //states = {previous: 'oldState', current: 'newState'}
            console.log('new pusher state from event "state_change": ' + states.current)
            //setPusherConState(states.current) //-> also see enum PusherConState
        });

        //bind error event
        _pusherClient.connection.bind('error', (err:any) => {
            setPusherState(PusherState.error)
            let str = JSON.stringify(err, null, 4);
            console.log('error during pusher connection')
            console.log(str)
        })

        //bind connected
        _pusherClient.connection.bind('connected', async () => {
            
            if (ref_pusherClient.current !== null) {
                //reconnected
                console.log('reconnected')
                return
            }
            console.log('pusher is connected')

            //sub channel
            const channel = _pusherClient.subscribe(channelName)
            // -> success
            channel.bind('pusher:subscription_succeeded', () => {
                console.log('subscribed to channel: ' + channelName)
                
                //set vars
                ref_pusherClient.current = _pusherClient 
                ref_pusherChannel.current = channel

                //bind to events
                ref_pusherChannel.current.bind(SetupEventType.Join, 
                    (data:any) => handleEvent_Join(data)
                )
                ref_pusherChannel.current.bind(SetupEventType.Player, 
                    (data:any) => handleEvent_Player(data)
                )
                ref_pusherChannel.current.bind(SetupEventType.Chat, 
                    (data:any) => handleEvent_Chat(data)
                )
                ref_pusherChannel.current.bind('pusher:member_removed', (member:any) => {
                    //remove user
                    let i = getIndexOfUser(member.id)
                    ref_players.current.splice(i,1);
                    addSysMsg(SysMsgType.userLeft, member.id)
                    forceUpdate()
                    assignJoinEventAdmin()
                });

                //request current state from lobby
                fireEvent_Join()
            });

            // -> error
            channel.bind('pusher:subscription_error', (err:any) => {
                let str = JSON.stringify(err, null, 4);
                console.log('error during subscribing to channel: ' + channelName)
                console.log(str)
            });
        })
    }


    const leaveGame = () => {
        
        //unbind channels & disconnect
        if (ref_pusherChannel.current !== null) {
            ref_pusherChannel.current.unbind()
            ref_pusherChannel.current = null
            console.log('channel unbound')
        }
        if (ref_pusherClient.current !== null) {
            ref_pusherClient.current.disconnect()
            ref_pusherClient.current = null 
            console.log('client disconnected')
        }
        
        //reset refs
        ref_twitterUsers.current = []
        ref_chat.current = []
        ref_players.current = []
        forceUpdate()
        
        //redirect
        setTimeout(() => setRedirectToJoin(true), 1000)
    }

    /*
    ##################################
    ##################################
        EVENT: Join
    ##################################
    ##################################
    */
    const handleEvent_Join = (event:any) => {

        /*
            ONLY FIRST USER HANDLES THIS
        */

        /*
        let str = JSON.stringify(event.data, null, 4);
        console.log(str)
        */

        //security
        if (event.type !== SetupEventType.Join) {
            console.log('EventType mismatch in handleEvent_Admin:\n\n' + event)
            return
        }
        let triggerUser = event.data
            
        //encapsulated join
        const joinPlayer = (name:string) => {
            let newUser:Setup_Player = {
                name: name,
                ready: false
            }
            ref_players.current.push(newUser)
            addSysMsg(SysMsgType.userJoined, name)
        }

        if (ref_players.current.length === 0 && triggerUser === ref_username.current ) {
            /*
                you are the only one in the game
                -> dont send out event, add youself manually
            */
            console.log('you are the only person in the room')
            //insert welcome first
            let currentUrl = window.location.href
            addSysMsg(SysMsgType.welcome,   '🎉 Welcome to your matchroom!') 
            addSysMsg(SysMsgType.welcome,   '🎉 Invite the people you wanna play by sending them the match-link (Browser-URL).' +
                                            ' You can also let others scan the QR Code.' +
                                            ' The game will start when everyone is ready.') 
            addSysMsg(SysMsgType.welcome,   currentUrl) 
            joinPlayer(triggerUser)
            setPusherState(PusherState.connected) //force update is incl. here
            return
        }

        if (ref_players.current[0].name === ref_username.current ) {
            /*
                you are admin
                -> attach new user 
                -> broadcast current state
            */
            console.log('BROADCAST join for: ' + triggerUser)
            joinPlayer(triggerUser)
            fireEvent_Chat()
            fireEvent_Player()
        }
    }

    const fireEvent_Join = async () => {

        //prepare
        let event:Setup_Event = {
            type: SetupEventType.Join,
            data: ref_username.current 
        }

        //exectue
        const response = await fetch('/api/pusher/setup/trigger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pusherchannel': channelName,
                'pusherevent': SetupEventType.Join
            },
            body: JSON.stringify(event), 
        });

        //read response
        const body = await response.text();
        console.log(body)
    }

    const assignJoinEventAdmin = () => {
        /*
            This has to be called when a new user joins or one leaves
            -> assign new answer player for join event
            -> only first player handles join event
            (unbind to avoid double calling!)
        */
        if (ref_players.current.length > 0) {
            ref_pusherChannel.current.unbind(SetupEventType.Join);
            if (ref_players.current[0].name === ref_username.current ) {
                //bind
                ref_pusherChannel.current.bind(SetupEventType.Join,
                    (data:any) => handleEvent_Join(data)
                )
                console.log('Bound join event')
            }
        }
    }

    /*
    ##################################
    ##################################
        EVENT: Chat
    ##################################
    ##################################
    */
    const handleEvent_Chat = (event:any) => {

        //security
        if (event.type !== SetupEventType.Chat) {
            console.log('EventType mismatch in handleEvent_Chat:\n\n' + event)
            return
        }

        //set new state
        let newChat:Setup_ChatMsg[] = event.data
        console.log(newChat.length + ' msgs retr.')
        ref_chat.current = newChat
        forceUpdate()
        
    }

    const fireEvent_Chat = async () => {

        //publish without info messages -> remove them
        for(let i=ref_chat.current.length-1;i>=0;i--) {
            if (ref_chat.current[i].t === SysMsgType.info) {
                ref_chat.current.splice(i,1)
            }
        }

        //remove first message of chat until chat is smaller than 10KB
        let chatString = JSON.stringify(ref_chat.current)
        while (chatString.length > 10000) {
            console.log('Chat too long\n -> removing first message')
            //find first non welcome message to remove
            for(let i=0;i<ref_chat.current.length;i++) {
                if (ref_chat.current[i].t !== SysMsgType.welcome) {
                    ref_chat.current.splice(i,1)
                    break
                }
            }
            chatString = JSON.stringify(ref_chat.current)
        }

        //prepare
        let event:Setup_Event = {
            type: SetupEventType.Chat,
            data: ref_chat.current
        }

        //execute
        console.log('broadcast new chat ' + chatString.length)
        const response = await fetch('/api/pusher/setup/trigger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pusherchannel': channelName,
                'pusherevent': SetupEventType.Chat
            },
            body: JSON.stringify(event),
        });

        //read response
        const body = await response.text();
        console.log(body)
    }



    /*
    ##################################
    ##################################
        EVENT: Player
    ##################################
    ##################################
    */
    const handleEvent_Player = (event:any) => {

        //let str = JSON.stringify(event.data, null, 4);
        //console.log(str)

        //console.log(pusherChannel.members.count)
        //security
        if (event.type !== SetupEventType.Player) {
            console.log('EventType mismatch in handleEvent_Player:\n\n' + event)
            return
        }

        //set new state
        let newPlayers:Setup_Player[] = event.data
        console.log(newPlayers.length + ' total players')
        ref_players.current = newPlayers
        setPusherState(PusherState.connected) //force update incl. here

        assignJoinEventAdmin()
    }

    const fireEvent_Player = async () => {

        //prepare
        let event:Setup_Event = {
            type: SetupEventType.Player,
            data: ref_players.current
        }

        //execute
        console.log('broadcast new players')
        const response = await fetch('/api/pusher/setup/trigger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pusherchannel': channelName,
                'pusherevent': SetupEventType.Player
            },
            body: JSON.stringify(event),
        });
        
        //read response
        const body = await response.text();
        console.log(body)

    }

    const toogleReady = (ready:boolean) => {
        //set yourself ready
        let i = getIndexOfUser(ref_username.current)
        ref_players.current[i].ready = ready
        fireEvent_Player()
    }

    /*
    ##################################
    ##################################
        Functions to child components
    ##################################
    ##################################
    */

    //passed to search component
    const onNewTwitterUserAdded = (newUser: Twitter_User):void => {
        console.log('new twitter user added: ' + newUser.screen_name)
        ref_twitterUsers.current.push(newUser)
        //@@TODO FIRE EVENT
    }

    //passed to chat 
    const onNewChatMessage = (newMsg:Setup_ChatMsg) => {
        //console.log('new chat msg received: ' + newMsg.m)
        newMsg.n = ref_username.current //chat component does not know/set user name
        ref_chat.current.push(newMsg)
        fireEvent_Chat()
    }

    const onLeaveTriggered = () => {
        leaveGame()
    }

    const onToogleReady = (ready:boolean) => {
        toogleReady(ready)
    } 

    const onNewNotification = (msg:string, notType:NotificationType) => {
        showNotification(msg, notType)
    }

    /*
    ##################################
    ##################################
            Handlers
    ##################################
    ##################################
    */

    const getContent = () => {

        //check if given MatchID is invalid
        let current = window.location.href
        let matchID = current.substr(current.lastIndexOf('/') + 1);
        if (matchID.length === 0 || !(/^\d+$/.test(matchID))) {
            console.log('INVALID ID: ' + matchID)
            return <div>'{matchID}' is an invalid Match ID! Only numbers allowed</div>
        }

        //redirect back to join page
        if (redirectToJoin) {
            let redirectURL = '/match/join/' + matchID
            return <Redirect to={redirectURL}/>
        }

        //check pusher state
        if (ref_pusherState.current !== PusherState.connected) {
            //return <div>'Could not connect to match.</div>
        }

        

        let rtn = 
        <div className={st.Content_Con}>
            {Search(
                ref_twitterUsers.current,
                st.Left_Panel, //pass outside panel css-class, so it can be embedded and returned
                onNewTwitterUserAdded,
                onNewNotification
                )
            }
            {ref_twitterUsers.current.length > 0 &&
                <div className={st.Center_Panel}>
                    {ref_twitterUsers.current.length}
                </div>
            }
            <div className={st.Right_Panel}>
                <div className={st.Interaction_Con}>
                    <Interaction
                        user={ref_players.current[getIndexOfUser(ref_username.current)]}
                        onLeaveClick={onLeaveTriggered}
                        onToogleReadyClick={onToogleReady}
                        addNotification={onNewNotification}
                    />
                </div>
                <div className={st.Players_Con}>
                    <Players   
                        data={ref_players.current}
                        currentUser={ref_username.current}
                    />
                </div>
                <div className={st.Chat_Con}>
                    <Chat   
                        data={ref_chat.current}
                        onNewMsg={onNewChatMessage}
                    />
                </div>
            </div>
            {ref_notification.current.display && 
                <div className={ref_notification.current.scssClass} onClick={() => hideNotification()}>
                    <div className={st.Not_Text}>
                        {ref_notification.current.msg}
                    </div>
                    <div className={st.Not_Close}>
                        x
                    </div>
                </div>
            }
        </div>
        return rtn
    }
    
    return (
        getContent()
    );
}
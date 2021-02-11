/* eslint-disable react/jsx-pascal-case */
import { useState, useEffect, useRef, useReducer } from 'react';
import st from './Setup.module.scss'
//import { useParams } from 'react-router-dom';

import CircularProgress from '@material-ui/core/CircularProgress';

import Search from './search/Search'
import Players from './players/Players'
import Chat from './chat/Chat'

import {Setup_State} from 'components/Interfaces'
import {Setup_Player} from 'components/Interfaces'
import {Setup_ChatMsg} from 'components/Interfaces'
import {Twitter_User} from 'components/Interfaces'

enum PusherConState {
    initialized = 'initialized',
    connecting = 'connecting',
    connected = 'connected',
    unavailable = 'unavailable',
    failed = 'failed',
    disconnected = 'disconnected',
}

enum SystemMessage {
    userJoined,
    userLeft
}

//TEST CHAT
/*
let msg1:Setup_ChatMsg = {
    name: 'Leo',
    message: 'Hi Chat, gl all'
}
let msg2:Setup_ChatMsg = {
    name: 'Adam',
    message: 'Hi Leo, ty u2'
}
let msg3:Setup_ChatMsg = {
    name: 'Phil',
    message: 'Hi together, have a good game guys. I really wish you luck'
}
let testChat:Setup_ChatMsg[] = [msg1, msg2, msg3]
*/

const selectedUserInit:Twitter_User[] = []
const playersInit:Setup_Player[] = []
const chatInit:Setup_ChatMsg[] = []

const setupStateInit:Setup_State = {
    players: playersInit,
    chat: chatInit,
    selectedTwitterUser: selectedUserInit
}

const Pusher = require('pusher-js');
let pusherClient:any = null

export default function Setup() {
    //setup state for entire setup page
    const ref_setupState = useRef(setupStateInit);
    const [,forceUpdate] = useReducer(x => x + 1, 0);

    //RIGHT PANEL
    const [userName, setUserName] = useState("");
    const [joinEnabled, setJoinEnabled] = useState(false);
    const [joined, setJoined] = useState(false);
    const [loading, setLoading] = useState(false)
    const [pusherConState, setPusherConState] = useState(PusherConState.initialized)
    
    const channelName = 'Game1'
    const event_Setup = 'Setup'

    //params hook
    //const { id } = useParams<Record<string, string | undefined>>()

    useEffect(() => {

    });

    /*
    ##################################
    ##################################
        JOIN GAME && LEAVE GAME
    ##################################
    ##################################
    */
    const createPlayerObject = (name: string) => {
        let newPlayer:Setup_Player = {
            name: name
        }
        return newPlayer
    }

    const addSystemChatMsg = (type:SystemMessage, userName:string) => {

        //create msg
        let msg:Setup_ChatMsg = {
            name: 'sys',
            message: ''
        }

        //determine type 
        if (type === SystemMessage.userJoined) {
            msg.message = userName + ' joined'
        }
        else if (type === SystemMessage.userLeft) {
            msg.message = userName + ' left'
        }

        //add
        ref_setupState.current.chat.push(msg)
    }



    /*
    ##################################
    ##################################
        JOIN GAME && LEAVE GAME
    ##################################
    ##################################
    */
    const joinGame = () => {

        //check if enabled
        if (!joinEnabled) {
            return
        }

        //check if user already joined
        if (pusherClient !== null) {
            console.log('already joined')
            return
        }

        setLoading(true)

        //init pusher client
        let appKey = process.env.REACT_APP_PUSHER_KEY
        let cluster = process.env.REACT_APP_PUSHER_CLUSTER
        let _pusherClient = new Pusher(appKey, {
          cluster: cluster,
          encrypted: true
        })

        //bind to all events
        //see: https://pusher.com/docs/channels/using_channels/connection#available-states
        _pusherClient.connection.bind('state_change', (states:any) => {
            //states = {previous: 'oldState', current: 'newState'}
            console.log('new con state: ' + states.current)
            setPusherConState(states.current) //-> also see enum PusherConState
        });

        //bind error event
        _pusherClient.connection.bind('error', (err:any) => {
            setJoined(false)
            setLoading(false)
            let str = JSON.stringify(err, null, 4);
            console.log('error during pusher connection')
            console.log(str)
        })

        //bind connected
        _pusherClient.connection.bind('connected', () => {
            console.log('pusher is connected')
            pusherClient = _pusherClient //set to global var
            setJoined(true)
            setLoading(false)

            //sub to game channel
            const channel = pusherClient.subscribe(channelName)
            //bind sub success
            channel.bind('pusher:subscription_succeeded', () => {
                console.log('subscribed to channel: ' + channelName)
                //bind event 'Setup State'
                channel.bind(event_Setup, (data:any) => 
                    handleEvent_SetupState(data)
                )

                //tell others you're here
                let newUser = createPlayerObject(userName)
                ref_setupState.current.players.push(newUser)
                addSystemChatMsg(SystemMessage.userJoined, userName)
                fireEvent_NewState()
            });

            //bind sub error
            channel.bind('pusher:subscription_error', (err:any) => {
                let str = JSON.stringify(err, null, 4);
                console.log('error during subscribing to channel: ' + channelName)
                console.log(str)
            });
        })
    }


    const leaveGame = () => {

        //bind disconnect event
        pusherClient.connection.bind('disconnected', () => {

            //remove user from players, share new state, empty players list
            for (let i = 0; ref_setupState.current.players.length;i++) {
                let user = ref_setupState.current.players[i]
                if (user.name === userName) {
                    console.log('removing player: ' + user.name)
                    addSystemChatMsg(SystemMessage.userLeft, user.name)
                    ref_setupState.current.players.splice(i,1);
                    break
                }
            }
            fireEvent_NewState()
            ref_setupState.current.players = []

            //reset vars
            setJoinEnabled(false)
            setJoined(false)
            setLoading(false)
            pusherClient = null //must be last 

            console.log('successfully disconnected')
        })

        pusherClient.disconnect()
    }

    

    

    /*
    ##################################
    ##################################
        EVENT: SetupState
    ##################################
    ##################################
    */
    const handleEvent_SetupState = (data:any) => {
        let str = JSON.stringify(data, null, 4);
        console.log(str)

        //read new state
        let newState:Setup_State = data.state
        let newPlayer:Setup_Player = newState.players[0]
        
        /*
            one entry in players
            && NOT your username 
            -> request from new user to join
            -> reply current state with attached new user
        */
        if (newState.players.length === 1 && newPlayer.name !== userName) {
            //attach new player
            let newUser = createPlayerObject(newPlayer.name)
            addSystemChatMsg(SystemMessage.userJoined, newPlayer.name)
            ref_setupState.current.players.push(newUser)
            //only first user replies -> reduce number of events triggered
            if (userName === ref_setupState.current.players[0].name) {
                fireEvent_NewState()
            }
        }
        /*
            -> new state received
        */
       else {
            ref_setupState.current = newState
            forceUpdate()
       }
    }

    const fireEvent_NewState = async () => {

        console.log('Broadcast new state')
        let socketID = pusherClient.connection.socket_id;
        let state:Setup_State = ref_setupState.current

        const response = await fetch('/api/pusher/setup/players', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'pusherchannel': channelName,
            'pusherevent': event_Setup,
            'pushersocketid': socketID
        },
        body: JSON.stringify({ state }), //msg
        });
        const body = await response.text();
        console.log(body)
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
        //you have to put a new object entirely
        //-> see https://stackoverflow.com/questions/59690934/react-hook-usestate-not-updating-ui
        ref_setupState.current.selectedTwitterUser.push(newUser)
        fireEvent_NewState()
    }

    //passed to chat 
    const onNewChatMessage = (newMsg:Setup_ChatMsg) => {
        console.log('new chat msg received: ' + newMsg.message)
        newMsg.name = userName //chat component does not know/set user name
        ref_setupState.current.chat.push(newMsg)
        fireEvent_NewState()
    }

    /*
    ##################################
    ##################################
            Handlers
    ##################################
    ##################################
    */
    const userNameChanged = (name: string) => {
        setUserName(name)

        //check empty or only spaces
        if (name.length === 0 || !name.trim()) {
            setJoinEnabled(false)
        }
        else {
            setJoinEnabled(true)
        }
    }

    const keyPressed = (event: any) => {
        if (event.key === 'Enter' && userName !== "") {
            joinGame()
        }
    }

  return (
    <div className={st.Content_Con}>
        <div className={st.Left_Panel}>
            {Search(onNewTwitterUserAdded, ref_setupState.current.selectedTwitterUser)}
        </div>
        {joined && 
            <div className={st.Center_Panel}>
                {ref_setupState.current.selectedTwitterUser.length}
            </div>
        }
        <div className={st.Right_Panel}>
            <div className={st.Interaction_Con}>
                {!joined &&
                    <input  className={st.Input}
                            type="search" 
                            autoComplete="off" 
                            placeholder="Enter a name"
                            onChange={e => userNameChanged(e.target.value)} 
                            onKeyUp={e => keyPressed(e)}/>
                }
                {joinEnabled && !joined &&
                    <button className={st.Button_Join} onClick={() => joinGame()}>
                        Join
                    </button>
                }
                {joined && 
                    <button className={st.Button_Leave} onClick={() => leaveGame()}>
                        Leave
                    </button>
                }
                {loading && 
                    <CircularProgress/>
                }
            </div>
            {Players(ref_setupState.current.players)}
            {joined && 
                <Chat 
                    data={ref_setupState.current.chat}
                    onNewMsg={onNewChatMessage}
                />
            }
        </div>
    </div>
  );
}

//{pusherConState}







/*
    //check if already subscribed
    let _channel = pusherClient.channel(channelName)
    if (_channel !== undefined) {
        if (_channel.subscribed) {
            return
        }
    }
*/





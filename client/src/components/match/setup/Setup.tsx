/* eslint-disable react/jsx-pascal-case */
import { useState, useEffect, useRef, useReducer } from 'react';
import st from './Setup.module.scss'
//import { useParams } from 'react-router-dom';

import CircularProgress from '@material-ui/core/CircularProgress';

import Search from './search/Search'
import Players from './players/Players'
import Chat from './chat/Chat'

import {Twitter_User} from 'components/Interfaces'

//import {Setup_State} from 'components/Interfaces'
import {Setup_Player} from 'components/Interfaces'
import {Setup_ChatMsg} from 'components/Interfaces'

enum PusherConState {
    initialized = 'initialized',
    connecting = 'connecting',
    connected = 'connected',
    unavailable = 'unavailable',
    failed = 'failed',
    disconnected = 'disconnected',
}

//TEST CHAT
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

const stateInitArray:Twitter_User[] = []
const playersInitArr:Setup_Player[] = []

const Pusher = require('pusher-js');
let pusherClient:any = null

export default function Setup() {
    //state hook

    //CENTER PANEL
    const [addedUsers, setAddedUsers] = useState(stateInitArray);

    //RIGHT PANEL
    const [userName, setUserName] = useState("");
    const [joinEnabled, setJoinEnabled] = useState(false);
    const [joined, setJoined] = useState(false);
    const [loading, setLoading] = useState(false)
    const [pusherConState, setPusherConState] = useState(PusherConState.initialized)

    const ref_currentPlayers = useRef(playersInitArr);
    const [,forceUpdate] = useReducer(x => x + 1, 0);
    

    const channelName = 'Game1'
    const event_NewPlayerJoined = 'Setup_players'

    //params hook
    //const { id } = useParams<Record<string, string | undefined>>()

    useEffect(() => {

    });

    const createPlayerObject = (name: string) => {
        let newPlayer:Setup_Player = {
            name: name
        }
        return newPlayer
    }

    //pass to chat 
    const fireNewChatMessage = (newMsg:Setup_ChatMsg) => {
        console.log('new chat msg received: ' + newMsg.message)


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
                //bind event 'new player joined'
                channel.bind(event_NewPlayerJoined, (data:any) => 
                    handleEvent_NewPlayerJoined(data)
                )

                //tell others you're here
                let newUser = createPlayerObject(userName)
                fireEvent_NewPlayerJoined(channelName, event_NewPlayerJoined, [newUser])
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
            for (let i = 0; ref_currentPlayers.current.length;i++) {
                let user = ref_currentPlayers.current[i]
                if (user.name === userName) {
                    console.log('removing player: ' + user.name)
                    ref_currentPlayers.current.splice(i,1);
                    break
                }
            }
            fireEvent_NewPlayerJoined(channelName, event_NewPlayerJoined, ref_currentPlayers.current)
            ref_currentPlayers.current = []

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
        EVENT: NewPlayerJoined
    ##################################
    ##################################
    */
    const handleEvent_NewPlayerJoined = (data:any) => {
        let str = JSON.stringify(data, null, 4);
        console.log(str)

        //read new data
        let newPlayers:Setup_Player[] = data.state
        let newPlayer:Setup_Player = newPlayers[0]
        /*
            one entry 
            && same as your username 
            ->  you are the only person in the room
        */
        if (newPlayers.length===1 && newPlayer.name === userName) {
            let newUser = createPlayerObject(newPlayer.name)
            ref_currentPlayers.current = [newUser]
            forceUpdate()
        }
        /*
            one entry 
            && NOT same as your username 
            ->  reply current state with attached new user
        */
        else if (newPlayers.length===1 && newPlayer.name !== userName) {
            //attach new player
            let newUser = createPlayerObject(newPlayer.name)
            ref_currentPlayers.current.push(newUser)
            //only first in current list gives reply -> reduce number of events triggered
            if (userName === ref_currentPlayers.current[0].name) {
                fireEvent_NewPlayerJoined(channelName, event_NewPlayerJoined, ref_currentPlayers.current)
            }
        }

        /*
            >= two entries 
            ->  current state of users, set in UI
        */
        else if (newPlayers.length >= 2) {
            ref_currentPlayers.current = newPlayers
            forceUpdate()
        }
    }

    const fireEvent_NewPlayerJoined = async (channelName:string, eventName: string, state:Setup_Player[]) => {

        console.log('fireEvent_NewPlayerJoined: ' + userName)
        let socketID = pusherClient.connection.socket_id;

        const response = await fetch('/api/pusher/setup/players', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'pusherChannel': channelName,
            'pusherEvent': eventName,
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

    //function passed to search component
    const addUserFromSearch = (newUser: Twitter_User):void => {
        //you have to put a new object entirely
        //-> see https://stackoverflow.com/questions/59690934/react-hook-usestate-not-updating-ui
        let arr:Twitter_User[] = []
        for(let i = 0;i<addedUsers.length;i++) {
            arr.push(addedUsers[i])
        }
        arr.push(newUser)
        setAddedUsers(arr)
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
            {Search(addUserFromSearch, addedUsers)}
        </div>
        <div className={st.Center_Panel}>
            {addedUsers.length}
        </div>
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
                {pusherConState}
            </div>
            {Players(ref_currentPlayers.current)}
            {joined && 
                <Chat 
                    data={testChat}
                    onNewMsg={fireNewChatMessage}
                />
            }
        </div>
    </div>
  );
}








/*
    //check if already subscribed
    let _channel = pusherClient.channel(channelName)
    if (_channel !== undefined) {
        if (_channel.subscribed) {
            return
        }
    }
*/





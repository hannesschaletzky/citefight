import { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import st from './Setup.module.scss'
//import { useParams } from 'react-router-dom';

import CircularProgress from '@material-ui/core/CircularProgress';

import Search from './search/Search'
import Players from './players/Players'
import Chat from './chat/Chat'

import {Twitter_User} from 'components/Interfaces'
import {Setup_Player} from 'components/Interfaces'

enum PusherConState {
    initialized = 'initialized',
    connecting = 'connecting',
    connected = 'connected',
    unavailable = 'unavailable',
    failed = 'failed',
    disconnected = 'disconnected',
}

//let testPlayers = ["Leo","John","Adam"]

const stateInitArray:Twitter_User[] = []

const Pusher = require('pusher-js');
const testPusherObj:Setup_Player = {
    name: 'testUser',
    connected: true
}
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
        const [currentPlayers, setCurrentPlayers] = useState([testPusherObj])
        const stateRef = useRef(currentPlayers);
        const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

        const setNewCurrentPlayers = useCallback((newPlayers: Setup_Player[]) => {
            setCurrentPlayers(newPlayers)
        }, []);

        const getCurrentPlayers = useCallback(() => {
            return currentPlayers;
        }, [currentPlayers]);
    
    //params hook
    //const { id } = useParams<Record<string, string | undefined>>()

    useEffect(() => {
        
    });


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
            const channelName = 'Game1'
            const event_NewPlayerJoined = 'Setup_players'

            const channel = pusherClient.subscribe(channelName)
            //bind sub success
            channel.bind('pusher:subscription_succeeded', () => {
                console.log('subscribed to channel: ' + channelName)
                //bind event 'new player joined'
                channel.bind(event_NewPlayerJoined, (data:any) => {
                    let str = JSON.stringify(data, null, 4);
                    console.log(str)

                    let newPlayers:Setup_Player[] = data.state
                    let newPlayer:Setup_Player = newPlayers[0]
                    /*
                        one entry 
                        && same as your username 
                        ->  you are the only person in the room
                    */
                    if (newPlayers.length===1 && newPlayer.name === userName) {
                        let newUser:Setup_Player = {
                            name: newPlayer.name,
                            connected: true
                        }
                        let currentState:Setup_Player[] = [newUser]
                        stateRef.current = currentState
                        //setNewCurrentPlayers(currentState)
                        //setCurrentPlayers(currentState)
                        forceUpdate()
                    }
                    /*
                        one entry 
                        && NOT same as your username 
                        ->  reply current state with attached new user
                    */
                    else if (newPlayers.length===1 && newPlayer.name !== userName) {

                        //attach new player
                        let currentState:Setup_Player[] = stateRef.current
                        let newUser:Setup_Player = {
                            name: newPlayer.name,
                            connected: true
                        }
                        currentState.push(newUser)
                        //only first in current list gives reply -> reduce number of events triggered
                        if (userName === currentState[0].name) {
                            fireEvent_NewPlayerJoined(channelName, event_NewPlayerJoined, currentState)
                        }
                    }

                    /*
                        >= two entries 
                        ->  current state of users, set in UI
                    */
                    else if (newPlayers.length >= 2) {
                        //setCurrentPlayers(newPlayers)
                        //setNewCurrentPlayers(newPlayers)
                        stateRef.current = newPlayers
                        forceUpdate()
                    }
                })

                //tell others that you're here and receive current list of users as answer
                let newUser:Setup_Player = {
                    name: userName,
                    connected: true
                }
                //setCurrentPlayers([newUser])
                //stateRef.current = [newUser]
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
            setJoinEnabled(false)
            setJoined(false)
            setLoading(false)
            pusherClient = null
            console.log('successfully disconnected')
        })

        pusherClient.disconnect()
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
        HANDLERS
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
            <div>
                {JSON.stringify(currentPlayers, null, 4)}
            </div>
            <div>
                {JSON.stringify(stateRef.current, null, 4)}
            </div>
            <div className={st.Interaction_Con}>
                {!joined &&
                    <input className={st.Input} type="search" autoComplete="off" placeholder="Enter a name" onChange={e => userNameChanged(e.target.value)} onKeyUp={e => keyPressed(e)}/>
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
            {Players(stateRef.current)}
            {joined && 
                Chat()
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





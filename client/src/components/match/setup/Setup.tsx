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
import {SysMsg} from 'components/Interfaces'

enum PusherConState {
    initialized = 'initialized',
    connecting = 'connecting',
    connected = 'connected',
    unavailable = 'unavailable',
    failed = 'failed',
    disconnected = 'disconnected',
}

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
let userName = ""

export default function Setup() {
    //setup state for entire setup page
    const ref_setupState = useRef(setupStateInit);
    const [,forceUpdate] = useReducer(x => x + 1, 0);

    //RIGHT PANEL
    //const [userName, setUserName] = useState("");
    const [joinEnabled, setJoinEnabled] = useState(false);
    const [joined, setJoined] = useState(false);
    const [loading, setLoading] = useState(false)
    const [pusherConState, setPusherConState] = useState(PusherConState.initialized)
    
    const channelName = 'Game1'
    const event_Setup = 'Setup'

    //params hook
    //const { id } = useParams<Record<string, string | undefined>>()

    useEffect(() => {
        window.addEventListener('beforeunload', alertUser)
        window.addEventListener('unload', handleTabClosing)
        return () => {
            window.removeEventListener('beforeunload', alertUser)
            window.removeEventListener('unload', handleTabClosing)
        }
    })

    const handleTabClosing = () => {
        if (pusherClient !== null) {
            removePlayerFromGame()
            //setTimeout('', 1000);
            pusherClient.disconnect()
        }
    }

    const alertUser = (event:any) => {
        event.preventDefault()
        event.returnValue = ''
    }

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

    const addSysMsg = (type:SysMsg, userName:string) => {

        //create msg
        let msg:Setup_ChatMsg = {
            name: 'sys',
            msg: '',
            type: type
        }

        //determine type 
        if (type === SysMsg.userJoined) {
            msg.msg = userName + ' joined'
        }
        else if (type === SysMsg.userLeft) {
            msg.msg = userName + ' left'
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

                //add yourself to state and tell others you're here
                let newUser = createPlayerObject(userName)
                ref_setupState.current.players.push(newUser)
                addSysMsg(SysMsg.userJoined, userName)
                fireEvent_NewSetupState()
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

            //remove players
            removePlayerFromGame()

            //reset vars
            setJoinEnabled(false)
            setJoined(false)
            setLoading(false)
            pusherClient = null //must be last 

            console.log('successfully disconnected')
        })

        pusherClient.disconnect()
    }

    const removePlayerFromGame = () => {
        //remove user from players, share new state
        for (let i = 0; ref_setupState.current.players.length;i++) {
            let user = ref_setupState.current.players[i]
            if (user.name === userName) {
                addSysMsg(SysMsg.userLeft, user.name)
                ref_setupState.current.players.splice(i,1);
                console.log('removed player: ' + user.name)
                break
            }
        }
        fireEvent_NewSetupState()
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
            addSysMsg(SysMsg.userJoined, newPlayer.name)
            ref_setupState.current.players.push(newUser)
            //only first user replies -> reduce number of events triggered
            if (userName === ref_setupState.current.players[0].name) {
                fireEvent_NewSetupState()
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

    const fireEvent_NewSetupState = async () => {

        console.log('Broadcast new state')
        let socketID = pusherClient.connection.socket_id;
        let state:Setup_State = ref_setupState.current

        //fire call with compressed body
        const response = await fetch('/api/pusher/setup/players', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pusherchannel': channelName,
                'pusherevent': event_Setup,
                'pushersocketid': socketID
            },
            body: JSON.stringify({state}), //msg
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
        fireEvent_NewSetupState()
    }

    //passed to chat 
    const onNewChatMessage = (newMsg:Setup_ChatMsg) => {
        console.log('new chat msg received: ' + newMsg.msg)
        newMsg.name = userName //chat component does not know/set user name
        ref_setupState.current.chat.push(newMsg)
        fireEvent_NewSetupState()
    }

    /*
    ##################################
    ##################################
            Handlers
    ##################################
    ##################################
    */
    const userNameChanged = (name: string) => {
        //setUserName(name)
        userName = name

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
            <div className={st.Players_Con}>
                {Players(ref_setupState.current.players)}
            </div>
            {joined && 
                <div className={st.Chat_Con}>
                    <Chat   data={ref_setupState.current.chat}
                            onNewMsg={onNewChatMessage}
                    />
                </div>
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


/*




    //synchronous compressing
        let state:any = null
        await compressBody(ref_setupState.current)
            .then((res) => {
                state = res
                console.log('success compressing')
            })
            .catch((err) => {
                console.log('Error compressing\n-> return')
                return
            })



    import {compress} from 'Extensions'
import {decompress} from 'Extensions'

    const compressBody = (body:any) => {

        var a = 'a very very long string to be squashed';
	    var b = compress(a, false); // 'a veryāăąlong striċ to bečquashed'
        console.log(b)

        let c = decompress(b)
        console.log(c)

        console.log(Buffer.from(a).byteLength)
        console.log(Buffer.from(b).byteLength)

        var zlib = require('zlib');

        //convert data to string and create init buffer
        let str = JSON.stringify(body) 
        var initBuffer:Buffer = Buffer.from(str)
        console.log("Init Buffer: " + initBuffer.byteLength);

        return new Promise( function( resolve, reject ) {
            zlib.deflate(initBuffer, function(err:any, buf:Buffer) {
                if(err){
                    console.log("Error Zipping\n" + err);
                    reject(err);
                }
                console.log("Zipped to: " + buf.byteLength);
                resolve(buf);

                
                zlib.inflate(buf, function(err:any, buf:any) {
                        console.log("in the inflate callback:", buf);
                        console.log("to string:", buf.toString("utf8") );
                });
                
            });
        });
    }



*/





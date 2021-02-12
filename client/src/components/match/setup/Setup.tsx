/* eslint-disable react/jsx-pascal-case */
import { useState, useEffect, useRef, useReducer } from 'react';
import st from './Setup.module.scss'
//import { useParams } from 'react-router-dom';

import CircularProgress from '@material-ui/core/CircularProgress';

import Search from './search/Search'
import Players from './players/Players'
import Chat from './chat/Chat'


import {Setup_Event} from 'components/Interfaces'
import {Setup_Player} from 'components/Interfaces'
import {Setup_ChatMsg} from 'components/Interfaces'
import {Twitter_User} from 'components/Interfaces'
import {SysMsg} from 'components/Interfaces'
import {EventType} from 'components/Interfaces'


enum PusherConState {
    initialized = 'initialized',
    connecting = 'connecting',
    connected = 'connected',
    unavailable = 'unavailable',
    failed = 'failed',
    disconnected = 'disconnected',
}

const twitterUserInit:Twitter_User[] = []
const playersInit:Setup_Player[] = []
const chatInit:Setup_ChatMsg[] = []

const Pusher = require('pusher-js');
let pusherClient:any = null
let userName = ""

export default function Setup() {
    //setup state for entire setup page
    const ref_twitterUser = useRef(twitterUserInit);
    const ref_player = useRef(playersInit);
    const ref_chat = useRef(chatInit);
    const [,forceUpdate] = useReducer(x => x + 1, 0);

    //RIGHT PANEL
    //const [userName, setUserName] = useState("");
    const [joinEnabled, setJoinEnabled] = useState(false);
    const [joined, setJoined] = useState(false);
    const [loading, setLoading] = useState(false)
    const [pusherConState, setPusherConState] = useState(PusherConState.initialized)
    
    const channelName = 'Game1'
    const event_Setup_Init = 'Setup_Init'
    const event_Setup_Player = 'Setup_Player'
    const event_Setup_Chat = 'Setup_Chat'

    //params hook
    //const { id } = useParams<Record<string, string | undefined>>()

    /*
    ##################################
    ##################################
        DETECT TAB CLOSING
    ##################################
    ##################################
    */

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
        ref_chat.current.push(msg)
        //fireEvent_NewChat()
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
            
            //sub channel
            const channel = _pusherClient.subscribe(channelName)
            // -> success
            channel.bind('pusher:subscription_succeeded', () => {
                console.log('subscribed to channel: ' + channelName)

                //set vars
                pusherClient = _pusherClient 
                setJoined(true)
                setLoading(false)

                //bind to all events
                channel.bind(event_Setup_Init, (data:any) => 
                    handleEvent_Init(data)
                )
                channel.bind(event_Setup_Player, (data:any) => 
                    handleEvent_Player(data)
                )
                channel.bind(event_Setup_Chat, (data:any) => 
                    handleEvent_Chat(data)
                )

                //request current state from lobby
                fireEvent_Init()
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
        for (let i = 0; ref_player.current.length;i++) {
            let user = ref_player.current[i]
            if (user.name === userName) {
                ref_player.current.splice(i,1);
                console.log('removed player: ' + user.name)
                break
            }
        }
        addSysMsg(SysMsg.userLeft, userName)
        fireEvent_Player()
    }

        /*
    ##################################
    ##################################
        EVENT: INIT
    ##################################
    ##################################
    */
    const handleEvent_Init = (event:any) => {

        if (event.type === EventType.init) {
            let newJoined = event.data
            
            //you are the only person in the room
            if (ref_player.current.length === 0) {
                let newUser = createPlayerObject(newJoined)
                ref_player.current.push(newUser)
                addSysMsg(SysMsg.userJoined, newJoined)
                forceUpdate()
            }

            //reply current state to user
            else {
                //only first user replies -> reduce number of events triggered
                if (userName === ref_player.current[0].name) {
                    //attach new player
                    let newUser = createPlayerObject(newJoined)
                    ref_player.current.push(newUser)
                    //insert new message
                    addSysMsg(SysMsg.userJoined, newJoined)
                    //broadcast new changes
                    fireEvent_Player()
                    fireEvent_Chat()
                }
            }
        }
        
    }

    const fireEvent_Init = async () => {

        console.log('asking for inital state')
        //prepare
        let event:Setup_Event = {
            type: EventType.init,
            data: userName
        }

        //exectue
        const response = await fetch('/api/pusher/setup/trigger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pusherchannel': channelName,
                'pusherevent': event_Setup_Init
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
        EVENT: Chat
    ##################################
    ##################################
    */
    const handleEvent_Chat = (event:any) => {

        if (event.type === EventType.chat) {
            let newChat:Setup_ChatMsg[] = event.data
            console.log(newChat.length + ' msgs retr.')
            ref_chat.current = newChat
            forceUpdate()
        }
        
    }

    const fireEvent_Chat = async () => {

        console.log('broadcast new chat')
        //prepare
        let event:Setup_Event = {
            type: EventType.chat,
            data: ref_chat.current
        }

        //CHECK SIZE
        //@@@TODO

        //execute
        const response = await fetch('/api/pusher/setup/trigger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pusherchannel': channelName,
                'pusherevent': event_Setup_Chat
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

        /*
        let str = JSON.stringify(event.data, null, 4);
        console.log(str)
        */

        if (event.type === EventType.player) {
            let newPlayers:Setup_Player[] = event.data
            console.log(newPlayers.length + ' total players')
            ref_player.current = newPlayers
            forceUpdate()
        }
        
    }

    const fireEvent_Player = async () => {

        console.log('broadcast new players')
        //prepare
        let event:Setup_Event = {
            type: EventType.player,
            data: ref_player.current
        }

        //execute
        const response = await fetch('/api/pusher/setup/trigger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pusherchannel': channelName,
                'pusherevent': event_Setup_Player
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
        Functions to child components
    ##################################
    ##################################
    */

    //passed to search component
    const onNewTwitterUserAdded = (newUser: Twitter_User):void => {
        console.log('new twitter user added: ' + newUser.screen_name)
        ref_twitterUser.current.push(newUser)
        //@@TODO FIRE EVENT
    }

    //passed to chat 
    const onNewChatMessage = (newMsg:Setup_ChatMsg) => {
        console.log('new chat msg received: ' + newMsg.msg)
        newMsg.name = userName //chat component does not know/set user name
        ref_chat.current.push(newMsg)
        fireEvent_Chat()
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
            {Search(onNewTwitterUserAdded, ref_twitterUser.current)}
        </div>
        {joined && 
            <div className={st.Center_Panel}>
                {ref_twitterUser.current.length}
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
                {Players(ref_player.current)}
            </div>
            {joined && 
                <div className={st.Chat_Con}>
                    <Chat   data={ref_chat.current}
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





/* eslint-disable react/jsx-pascal-case */
import { useState, useEffect, useRef, useReducer } from 'react';
import st from './Setup.module.scss'
//import { useParams } from 'react-router-dom';

import {Setup_Event} from 'components/Interfaces'
import {Setup_Player} from 'components/Interfaces'
import {Setup_ChatMsg} from 'components/Interfaces'
import {Twitter_User} from 'components/Interfaces'
import {SysMsg} from 'components/Interfaces'
import {SetupEventType} from 'components/Interfaces'
import {AdminType} from 'components/Interfaces'

import Search from './search/Search'
import Players from './players/Players'
import Chat from './chat/Chat'

import CircularProgress from '@material-ui/core/CircularProgress';


const Pusher = require('pusher-js');

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

let pusherClient:any = null
let pusherChannel:any = null
let userName = ""

export default function Setup() {
    //states
    const ref_twitterUsers = useRef(twitterUserInit);
    const ref_players = useRef(playersInit);
    const ref_chat = useRef(chatInit);
    const [,forceUpdate] = useReducer(x => x + 1, 0);

    //RIGHT PANEL
    //const [userName, setUserName] = useState("");
    const [joinEnabled, setJoinEnabled] = useState(false);
    const [joined, setJoined] = useState(false);
    const [loading, setLoading] = useState(false)
    const [pusherConState, setPusherConState] = useState(PusherConState.initialized)
    
    const channelName = 'Game1'

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
            setTimeout(function(){}, 1000);
            pusherClient.disconnect()
        }
    }

    const alertUser = (event:any) => {
        setTimeout(function(){}, 1000);
            pusherClient.disconnect()
        //event.preventDefault()
        //event.returnValue = ''
    }

    /*
    ##################################
    ##################################
        GENERAL FUNCTIONS
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
            name: '',
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
    }



    /*
    ##################################
    ##################################
            JOIN && LEAVE 
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

        if (loading) {
            console.log('already trying to join')
            return
        } 

        setLoading(true)

        //init pusher client
        let appKey = process.env.REACT_APP_PUSHER_KEY
        let cluster = process.env.REACT_APP_PUSHER_CLUSTER
        let _pusherClient = new Pusher(appKey, {
          cluster: cluster,
          encrypted: true,
          //authEndpoint: '/api/pusher/auth'
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
        _pusherClient.connection.bind('connected', async () => {
            console.log('pusher is connected')

            //sub channel
            const channel = _pusherClient.subscribe(channelName)
            // -> success
            channel.bind('pusher:subscription_succeeded', () => {
                console.log('subscribed to channel: ' + channelName)
                
                //set vars
                pusherClient = _pusherClient 
                pusherChannel = channel
                setJoined(true)
                setLoading(false)

                //bind to all events
                channel.bind(SetupEventType.Admin, 
                    (data:any) => handleEvent_Admin(data)
                )
                channel.bind(SetupEventType.Player, 
                    (data:any) => handleEvent_Player(data)
                )
                channel.bind(SetupEventType.Chat, 
                    (data:any) => handleEvent_Chat(data)
                )

                //request current state from lobby
                fireEvent_Admin(AdminType.join)
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

        //check if connected
        if (pusherClient === null) {
            console.log('no client to disconnect')
            return
        }
        if (pusherChannel === null) {
            console.log('no channel to disconnect')
            return
        }

        //unbind channels & disconnect
        pusherChannel.unbind()
        pusherClient.disconnect()
        pusherChannel = null
        pusherClient = null 

        //reset refs
        ref_twitterUsers.current = []
        ref_chat.current = []
        ref_players.current = []

        //reset vars
        setJoinEnabled(false)
        setJoined(false)
        setLoading(false)

        //fire event to admin 
        fireEvent_Admin(AdminType.leave)
        
        console.log('successfully disconnected')
    }

    /*
    ##################################
    ##################################
        EVENT: Admin
    ##################################
    ##################################
    */
    const handleEvent_Admin = (event:any) => {

        /*
            ONLY FIRST AND SECOND PERSON IN PLAYERS LIST ARE ADMIN AND HANDLE EVENTS
        */

        /*
        let str = JSON.stringify(event.data, null, 4);
        console.log(str)
        */

        //security
        if (event.type !== SetupEventType.Admin) {
            console.log('EventType mismatch in handleEvent_Admin:\n\n' + event)
            return
        }
        let triggerUser = event.data

        //JOIN
        if (event.adminType === AdminType.join) {
            
            //encapsulated join
            const joinPlayer = (name:string) => {
                let newUser = createPlayerObject(name)
                ref_players.current.push(newUser)
                addSysMsg(SysMsg.userJoined, name)
            }

            if (ref_players.current.length === 0 && triggerUser === userName) {
                /*
                    you are the only one in the game
                    -> dont send out event, add youself manually
                */
                console.log('you are the only person in the room')
                joinPlayer(triggerUser)
                forceUpdate()
                return
            }

            if (ref_players.current[0].name === userName) {
                /*
                    you are first admin, so you handle
                    -> attach new user 
                    -> broadcast current state
                */
                console.log('BROADCAST join for: ' + triggerUser)
                joinPlayer(triggerUser)
                fireEvent_Chat()
                fireEvent_Player()
            }
        }

        //LEAVE
        else if (event.adminType === AdminType.leave) {

            //first admin
            if (ref_players.current[0].name === userName) {
                if (triggerUser === userName) {
                    /*
                        not let first admin handle if he leaves the game
                        -> let second admin handle
                    */
                    return
                }
            }
            //second admin
            if (ref_players.current[1].name === userName)  {
                if (triggerUser !== ref_players.current[0].name) {
                    /*
                        only handle the request if the first player (first admin) wants to leave
                    */
                   return
                }
            }

            //remove user
            for (let i=0; ref_players.current.length;i++) {
                let user = ref_players.current[i]
                if (user.name === triggerUser) {
                    ref_players.current.splice(i,1);
                    break
                }
            }
            //insert message
            addSysMsg(SysMsg.userLeft, triggerUser)
            //broadcast state
            console.log('BROADCAST leave for: ' + triggerUser)
            fireEvent_Chat()
            fireEvent_Player()
        }
        
    }

    const fireEvent_Admin = async (adminType: AdminType) => {

        if (adminType===AdminType.join) {
            console.log('Joining... \nasking for current state')
        }

        //prepare
        let event:Setup_Event = {
            type: SetupEventType.Admin,
            adminType: adminType,
            data: userName
        }

        //exectue
        const response = await fetch('/api/pusher/setup/trigger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'pusherchannel': channelName,
                'pusherevent': SetupEventType.Admin
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

        console.log('broadcast new chat')
        //prepare
        let event:Setup_Event = {
            type: SetupEventType.Chat,
            adminType: AdminType.none,
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

        //security
        if (event.type !== SetupEventType.Player) {
            console.log('EventType mismatch in handleEvent_Player:\n\n' + event)
            return
        }

        //set new state
        let newPlayers:Setup_Player[] = event.data
        console.log(newPlayers.length + ' total players')
        ref_players.current = newPlayers
        forceUpdate()

        /*
            Only first and second player handle admin events
            unbind all 
            and then only bind first and second player
        */
        pusherChannel.unbind(SetupEventType.Admin);
        if (ref_players.current[0].name === userName ||
            ref_players.current[1].name === userName) {
            //bind
            pusherChannel.bind(SetupEventType.Admin, 
                (data:any) => handleEvent_Admin(data)
            )
            console.log('Bound admin events')
        }
    }

    const fireEvent_Player = async () => {

        console.log('broadcast new players')
        //prepare
        let event:Setup_Event = {
            type: SetupEventType.Player,
            adminType: AdminType.none,
            data: ref_players.current
        }

        //execute
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
            {Search(onNewTwitterUserAdded, ref_twitterUsers.current)}
        </div>
        {joined && 
            <div className={st.Center_Panel}>
                {ref_twitterUsers.current.length}
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
                {Players(ref_players.current)}
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



/*
            //GET AUTH TOKEN FOR USER
            let socketId = _pusherClient.connection.socket_id;
            const response = await fetch('/api/pusher/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'pusherchannel': channelName,
                    'socketid': socketId
                },
                body: '', 
            });
            const body = await response.text();
            //parse to object
            let obj = JSON.parse(body);
            let auth = obj.auth
            console.log('auth: ' + auth)
            */





/* eslint-disable react/jsx-pascal-case */
import { useEffect, useRef, useReducer } from 'react';
import st from './Setup.module.scss'
//import { useParams } from 'react-router-dom';

import {Setup_Event} from 'components/Interfaces'
import {Setup_Player} from 'components/Interfaces'
import {Setup_ChatMsg} from 'components/Interfaces'
import {Twitter_User} from 'components/Interfaces'
import {SysMsgType} from 'components/Interfaces'
import {SetupEventType} from 'components/Interfaces'
import {SetupJoinStatus} from 'components/Interfaces'
//import {PusherConState} from 'components/Interfaces'

import Search from './search/Search'
import SearchTestComp from './search/SearchTestComp'
import Interaction from './interaction/Interaction'
import Players from './players/Players'
import Chat from './chat/Chat'

const Pusher = require('pusher-js');

const init_twitterUser:Twitter_User[] = []
const init_players:Setup_Player[] = []
const init_chat:Setup_ChatMsg[] = []

let pusherClient:any = null
let pusherChannel:any = null
let userName = ""

export default function Setup() {
    //states
    const ref_twitterUsers = useRef(init_twitterUser);
    const ref_players = useRef(init_players);
    const ref_chat = useRef(init_chat);
    const ref_joinStatus = useRef(SetupJoinStatus.NotJoined)
    const [,forceUpdate] = useReducer(x => x + 1, 0);

    //const [pusherConState, setPusherConState] = useState(PusherConState.initialized)
    
    const channelName = 'presence-Game1'

    //params hook
    //const { id } = useParams<Record<string, string | undefined>>()

    
    useEffect(() => {

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
        return -1
    }

    const setJoinStatus = (status:SetupJoinStatus) => {
        console.log('set status to: ' + status)
        ref_joinStatus.current = status
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



    /*
    ##################################
    ##################################
            JOIN && LEAVE 
    ##################################
    ##################################
    */
    const joinGame = () => {

        //has already joined
        if (ref_joinStatus.current === SetupJoinStatus.Joined) {
            console.log('already joined')
            return
        }
        
        setJoinStatus(SetupJoinStatus.Connecting)

        //init pusher client
        let appKey = process.env.REACT_APP_PUSHER_KEY
        let cluster = process.env.REACT_APP_PUSHER_CLUSTER
        let _pusherClient = new Pusher(appKey, {
          cluster: cluster,
          encrypted: true,
          authEndpoint: '/api/pusher/auth?id=' + userName
        })

        //bind to all events
        //see: https://pusher.com/docs/channels/using_channels/connection#available-states
        _pusherClient.connection.bind('state_change', (states:any) => {
            //states = {previous: 'oldState', current: 'newState'}
            console.log('new con state: ' + states.current)
            //setPusherConState(states.current) //-> also see enum PusherConState
        });

        //bind error event
        _pusherClient.connection.bind('error', (err:any) => {
            setJoinStatus(SetupJoinStatus.Failed)
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

                //bind to events
                pusherChannel.bind(SetupEventType.Join, 
                    (data:any) => handleEvent_Join(data)
                )
                pusherChannel.bind(SetupEventType.Player, 
                    (data:any) => handleEvent_Player(data)
                )
                pusherChannel.bind(SetupEventType.Chat, 
                    (data:any) => handleEvent_Chat(data)
                )
                pusherChannel.bind('pusher:member_removed', (member:any) => {
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
        setJoinStatus(SetupJoinStatus.NotJoined)
        
        console.log('successfully disconnected')
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

        if (ref_players.current.length === 0 && triggerUser === userName) {
            /*
                you are the only one in the game
                -> dont send out event, add youself manually
            */
            console.log('you are the only person in the room')
            //insert welcome first
            let currentUrl = window.location.href
            addSysMsg(SysMsgType.welcome,   '🎉 Welcome to your matchroom!') 
            addSysMsg(SysMsgType.welcome,   '🎉 Invite the people you wanna play by sending them the match-link.' +
                                            ' Copy the URL from the top-button or the link below.') 
            addSysMsg(SysMsgType.welcome,   currentUrl) 
            joinPlayer(triggerUser)
            setJoinStatus(SetupJoinStatus.Joined)
            forceUpdate()
            return
        }

        if (ref_players.current[0].name === userName) {
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
            data: userName
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
            pusherChannel.unbind(SetupEventType.Join);
            if (ref_players.current[0].name === userName) {
                //bind
                pusherChannel.bind(SetupEventType.Join,
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
        setJoinStatus(SetupJoinStatus.Joined)
        forceUpdate()

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
        let i = getIndexOfUser(userName)
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
        newMsg.n = userName //chat component does not know/set user name
        ref_chat.current.push(newMsg)
        fireEvent_Chat()
    }

    const onJoinTriggered = (name:string) => {
        userName = name
        joinGame()
    }

    const onLeaveTriggered = () => {
        leaveGame()
    }

    const onToogleReady = (ready:boolean) => {
        toogleReady(ready)
    } 

    const addInfoMsg = (msg:string) => {
        addSysMsg(SysMsgType.info, msg)
        forceUpdate()
    }

    /*
    ##################################
    ##################################
            Handlers
    ##################################
    ##################################
    */
    

  return (
    <div className={st.Content_Con}>
        {Search(
            ref_joinStatus.current, //pass status bc. you cant do && with functional comp.
            ref_twitterUsers.current,
            st.Left_Panel,
            onNewTwitterUserAdded
            )
        }
        {(ref_joinStatus.current === SetupJoinStatus.Joined) && 
            <div className={st.Center_Panel}>
                {ref_twitterUsers.current.length}
            </div>
        }
        <div className={st.Right_Panel}>
            <div className={st.Interaction_Con}>
                <Interaction
                    status={ref_joinStatus.current}
                    user={ref_players.current[getIndexOfUser(userName)]}
                    onJoinClick={onJoinTriggered}
                    onLeaveClick={onLeaveTriggered}
                    onToogleReadyClick={onToogleReady}
                    addInfoMsg={addInfoMsg}
                />
            </div>
            {(ref_joinStatus.current === SetupJoinStatus.Joined) && 
                <div className={st.Players_Con}>
                    <Players   
                        data={ref_players.current}
                        currentUser={userName}
                    />
                </div>
            }
            {(ref_joinStatus.current === SetupJoinStatus.Joined) && 
                <div className={st.Chat_Con}>
                    <Chat   
                        data={ref_chat.current}
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





            /*
    ##################################
    ##################################
        EVENT: Admin
    ##################################
    ##################################
    */
   /*
    const handleEvent_Admin = (event:any) => {

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
                
                console.log('you are the only person in the room')
                joinPlayer(triggerUser)
                forceUpdate()
                return
            }

            if (ref_players.current[0].name === userName) {
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
                    return
                }
            }
            //second admin
            if (ref_players.current[1].name === userName)  {
                if (triggerUser !== ref_players.current[0].name) {
                   return
                }
            }

            //remove user
            for (let i=0; i<ref_players.current.length;i++) {
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
    */
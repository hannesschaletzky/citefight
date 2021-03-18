import {log} from 'components/Logic'
const Pusher = require('pusher-js');

//EVENTS
export interface Event {
    type: EventType;
    data: any;
}
export enum EventType {
    Join = 'Join',
    Chat = 'Chat',
    Player = 'Player',
    Profile = 'Profile',
    Settings = 'Settings',
    Tweets = 'Tweets',
    Match_State = 'Match_State',
    Matrix = 'Matrix'
}

//according to: https://pusher.com/docs/channels/using_channels/connection#available-states
export enum State {
    init = 'init',
    connecting = 'connecting',
    connected = 'connected',
    unavailable = 'unavailable',
    disconnected = 'disconnected',
    failed = 'failed'
}
//init objects for refs
export const init_pusherCient:any = null
export const init_pusherChannel:any = null
//string constants
export const Event_Ping_Name = "Join-Ping"
export const Event_Pong_Name = "Join-Pong"
export const Channel_Lobby = "presence-lobby-"
export const Channel_Match = "presence-match-"
export const Channel_Sub_Success = 'pusher:subscription_succeeded'
export const Channel_Sub_Fail = 'pusher:subscription_error'
export const Channel_Member_Removed = 'pusher:member_removed'
export const Channel_Member_Added = 'pusher:member_added'
export const Conn_State_Change = 'state_change'


//export const getPusherClient = (channelName:string) => { -> with input parameters
export const getNewPusherClient = () => {
    return new Promise((resolve, reject) => {

        //create random userid
        let rndID = new Date().toISOString()
        rndID += Math.floor(Math.random() * Math.floor(10))
        
        //init pusher client
        let appKey = process.env.REACT_APP_PUSHER_KEY
        let cluster = process.env.REACT_APP_PUSHER_CLUSTER
        let _pusherClient = new Pusher(appKey, {
            cluster: cluster,
            encrypted: true,
            authEndpoint: '/api/pusher/auth?id=' + rndID
        })

        //bind error event
        _pusherClient.connection.bind('error', (err:any) => {
            log('error connecting')
            log(err)
            reject(Error("It broke"))
        })

        //bind connected
        _pusherClient.connection.bind('connected', async () => {
            log('pusher is connected')
            resolve(_pusherClient)
            return
        })
    })
}

//TRIGGER EVENT IN PUSHER
type GenericObject = { [key: string]: any }
export const triggerEvent = async (channelName:string, eventName:string, event:GenericObject = {data: null}) => {
    
    //exectue
    const response = await fetch('/api/pusher/setup/trigger', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'pusherchannel': channelName,
            'pusherevent': eventName
        },
        body: JSON.stringify(event), 
    });

    //read response -> print if error
    const body = await response.text()
    let resp:any = JSON.parse(body)
    if (resp.status !== "200") {
        log('ERROR TRIGGERING PUSHER EVENT:')
        log(body)
    }
}




import { useState, useEffect } from 'react';
import st from './Setup.module.scss'
//import { useParams } from 'react-router-dom';

import CircularProgress from '@material-ui/core/CircularProgress';

import Search from './search/Search'
import Players from './players/Players'
import Chat from './chat/Chat'

import {Twitter_User} from 'components/Interfaces'
import {Pusher_Object} from 'components/Interfaces'

const stateInitArray:Twitter_User[] = []

const Pusher = require('pusher-js');
const testPusherObj = {
    userName: 'testUser',
    message: 'this is a test object message'
}
const initArray:Pusher_Object[] = [testPusherObj]
let pusherClient:any = null

export default function Setup() {
    //state hook
    const [addedUsers, setAddedUsers] = useState(stateInitArray);
    const [searchInput, setSearchInput] = useState("");
    const [joinEnabled, setJoinEnabled] = useState(false);
    const [joined, setJoined] = useState(false);
    const [loading, setLoading] = useState(false)

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

            //sub to channel
            const channelName = 'players'

            //check if already subscribed
            let _channel = pusherClient.channel(channelName)
            if (_channel !== undefined) {
                if (_channel.subscribed) {
                    return
                }
            }

            const channel = pusherClient.subscribe(channelName)
            //bind sub success
            channel.bind('pusher:subscription_succeeded', () => {
                console.log('subscribed to channel: ' + channelName)
                //bind to event
                channel.bind('message', (data:any) => {
                    console.log('new: ' + data)
                    //set new state
                    //let newObj:Pusher_Object = data
                    //setStateData([newObj])
                })
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
        setSearchInput(name)

        //check empty or only spaces
        if (name.length === 0 || !name.trim()) {
            setJoinEnabled(false)
        }
        else {
            setJoinEnabled(true)
        }
    }

    const keyPressed = (event: any) => {
        if (event.key === 'Enter' && searchInput !== "") {
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
            </div>
            {Players()}
            {joined && 
                Chat()
            }
        </div>
    </div>
  );
}











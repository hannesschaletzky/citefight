import React, { useState, useEffect } from 'react';
import st from './Players.module.scss'

const Pusher = require('pusher-js');

export default function Players() {
    //state hook
    const [stateData, setStateData] = useState("")

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {

    });

    const joinGame = () => {
        let appKey = process.env.REACT_APP_PUSHER_KEY
        let cluster = process.env.REACT_APP_PUSHER_CLUSTER

        const pusher = new Pusher(appKey, {
          cluster: cluster,
          encrypted: true
        })
        const channel = pusher.subscribe('chat');
        channel.bind('message', (data:any) => {
            console.log('new msg: ' + data)
            
            //set new state
            let newString = data.username + ': ' + data.message
            setStateData(newString)
        })
        console.log('success subscribing???')
    }

    const sendMessageAsync = async () => {
        
        const response = await fetch('/api/pusher', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testItem: 'testvalue' }),
        });
        const body = await response.text();
        console.log(body)
    }

  return (
    <div className={st.Con}>
        <button onClick={() => joinGame()}>
            JOIN
        </button>
        <button onClick={() => sendMessageAsync()}>
            SEND MESSAGE
        </button>
        <div>
            Joined Players: and {stateData}
        </div>
    </div>
  );
}

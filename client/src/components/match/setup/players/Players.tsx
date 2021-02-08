import { useState, useEffect } from 'react';
import st from './Players.module.scss'

const Pusher = require('pusher-js');

export default function Players() {
    //state hook
    const [players, setPlayers] = useState([])
    const [stateData, setStateData] = useState("")

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {

    });

    const joinGame = () => {
        let appKey = process.env.REACT_APP_PUSHER_KEY
        let cluster = process.env.REACT_APP_PUSHER_CLUSTER

        //console.log(appKey)
        //console.log(cluster)

        const pusher = new Pusher(appKey, {
          cluster: cluster,
          encrypted: true
        })
        const channel = pusher.subscribe('chat');
        channel.bind('message', (data:any) => {
            console.log('new msg: ' + data)
            setStateData(data)
        })
        console.log('success subscribing???')
    }

    const sendMessage = async () => {
        var requestOptions = {
            method: 'POST'
        };
        let request = new Request('/api/pusher/message', requestOptions)
        const response = await fetch(request);
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        
        console.log(body)
        setStateData(body)
        //return body;
    }

  return (

    <div className={st.Con}>
        <button onClick={() => joinGame()}>
            JOIN
        </button>
        <button onClick={() => sendMessage()}>
            SEND MESSAGE
        </button>
        <div>
            Joined Players: {players.length} and {stateData}
        </div>
    </div>
  );
}

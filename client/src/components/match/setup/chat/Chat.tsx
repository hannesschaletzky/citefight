//import { } from 'react';
import st from './Chat.module.scss'


export default function Chat() {
    //state hook


    /*
    const sendMessageAsync = async () => {

        //check for active connection
        if (pusherClient === null) {
            console.log('not connected to pusher')
            return
        }

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
    */

  return (

    <div className={st.Con}>
        CHAT
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import st from './Chat.module.scss';

import {Setup_ChatMsg} from 'components/Interfaces'
import {SysMsgType} from 'components/Interfaces'

import {didUserExceedLimit} from 'components/Logic'

import WarningIcon from 'assets/setup/Warning_Icon.png'
import SendIcon from 'assets/setup/Send_Icon.png'

enum SetupChatStatus {
    enabled = 'enabled',
    disabled = 'disabled',
    inputTooLong = 'inputTooLong',
    sentTooMuch = 'sentTooMuch',
}
let messageTimestamps:string[] = []
let inputSizeMax = 100

export default function Chat(inputMessages:Setup_ChatMsg[],
                             onNewMsg:(msg:Setup_ChatMsg) => void) {
    
    //state
    const [userMsg,setUserMsg] = useState('')
    const [status,setStatus] = useState(SetupChatStatus.disabled)
    
    //scroll to bottom when new msg arrive
    useEffect(() => {
        scrollToBottom() 
    })
    const ChatEndRef = useRef<null | HTMLDivElement>(null)
    const scrollToBottom = () => {
        if (ChatEndRef.current !== null) { 
            ChatEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }

    //empty input after sending
    const InputRef = useRef<null | HTMLInputElement>(null)
    

    const sendMessage = () => {
        
        if (status !== SetupChatStatus.enabled) {
            return
        }

        let newMsg:Setup_ChatMsg = {
            n: '',
            m: userMsg,
            t: SysMsgType.none
        }

        onNewMsg(newMsg) //fire event in parent
        messageTimestamps.push(new Date().toISOString())
        resetInput()
        setStatus(SetupChatStatus.disabled)
    }

    const resetInput = () => {
        if (InputRef.current !== null) {
            InputRef.current.value = ""
        }
    }

    /*
    ##################################
    ##################################
            Handlers
    ##################################
    ##################################
    */
    const onChange = (event:any) => {

        const text = event.target.value;

        //check empty or only spaces
        if (text.length === 0 || !text.trim()) {
            setStatus(SetupChatStatus.disabled)
        }
        else if (text.length > inputSizeMax) {
            setStatus(SetupChatStatus.inputTooLong)
        }
        else if (didUserExceedLimit(messageTimestamps, 8)) {
            setStatus(SetupChatStatus.sentTooMuch)
        }
        else {
            setUserMsg(text)
            setStatus(SetupChatStatus.enabled)
        }
    }

    const keyPressed = (event: any) => {
        //trigger send msg on return
        if (event.code === 'Enter' && userMsg !== "") {
            sendMessage()
        }
    }

    const getContent = () => {

        let cards = []
        for(let i=0;i<inputMessages.length;i++) {
            let item:Setup_ChatMsg = inputMessages[i]
            let card = 
                <div className={st.Message_Con} key={i}>
                    {item.t === SysMsgType.welcome &&
                        <div className={st.SysMessage_Welcome}>
                            {item.m}
                        </div>
                    }
                    {item.t === SysMsgType.userJoined &&
                        <div className={st.SysMessage_Joined}>
                            {item.m}
                        </div>
                    }
                    {item.t === SysMsgType.userLeft &&
                        <div className={st.SysMessage_Left}>
                            {item.m}
                        </div>
                    }
                    {item.t === SysMsgType.startInfo &&
                        <div className={st.SysMessage_Info}>
                            {item.m}
                        </div>
                    }
                    {item.t === SysMsgType.none &&
                        <div className={st.SysMessage_None}>
                            <div className={st.Sender}>
                                {item.n}:
                            </div>
                            <div className={st.Content}>
                                {item.m}
                            </div>
                        </div>  
                    }
                </div>
            cards.push(card)
        }

        let content = 
            <div className={st.Con}>
                <div className={st.Messages_Con}>
                    {cards}
                    <div ref={ChatEndRef}/>
                </div>
                {status === SetupChatStatus.enabled &&
                    <div className={st.Info_Con_Send}>
                        <img className={st.Info_Icon} src={SendIcon} alt="Info"/>
                        <div>
                            Send with return
                        </div>
                    </div>
                }
                {status === SetupChatStatus.inputTooLong &&
                    <div className={st.Info_Con_TooLong}>
                        <img className={st.Info_Icon} src={WarningIcon} alt="Warning"/>
                        <div>
                            Exceeded {inputSizeMax} letters
                        </div>
                    </div>
                }
                {status === SetupChatStatus.sentTooMuch &&
                    <div className={st.Info_Con_TooMuch}>
                        <img className={st.Info_Icon} src={WarningIcon} alt="Warning"/>
                        <div>
                            Easy boy... many messages
                        </div>
                    </div>
                }
                <div>
                    <input  className={st.Input} 
                            ref={InputRef}
                            type="search" 
                            autoComplete="off" 
                            placeholder="Type..." 
                            //value={userMsg}
                            onChange={(e) => onChange(e)}
                            onKeyUp={(e) => keyPressed(e)}/>
                </div>
            </div>

        return content
    }

    return (
        getContent()
    );
}








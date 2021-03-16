import React, { useEffect, useRef, useState } from 'react';
import st from './Chat.module.scss';
import {log} from 'components/Logic'

import {ChatMsg, SysMsgType} from 'components/Interfaces'

import {didUserExceedLimit} from 'components/Logic'

import WarningIcon from 'assets/setup/Warning_Icon.png'
import SendIcon from 'assets/setup/Send_Icon.png'

/*
##################################
            EXPORT
##################################
*/
interface Props {
    inputMessages: ChatMsg[]
    onNewMessage: (newMsg:ChatMsg) => void
}
export const getComponent = (inputMessages:ChatMsg[], onNewMessage:(newMsg:ChatMsg) => void) => {
    let props:Props = {
        inputMessages: inputMessages,
        onNewMessage: onNewMessage
    }
    return React.createElement(Chat, props)
}

/*
##################################
        SHARED METHODS
##################################
*/
export const addSysMsg = (type:SysMsgType, inputMsg:string, ref:React.MutableRefObject<ChatMsg[]>) => {
    //create msg
    let msg:ChatMsg = {
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
    else if (type === SysMsgType.startInfo) {
        msg.m = '📢 ' + inputMsg
    }
    //add
    ref.current.push(msg)
}

//Pusher event size is 10KB -> remove older messages if exceeded
export const cutToSizeLimit = (messages:ChatMsg[]):ChatMsg[] => {
    let chatString = JSON.stringify(messages)
    while (chatString.length > 10000) {
        log(chatString.length + ' - Chat too long\n -> removing first message')
        //find first non welcome message to remove
        for(let i=0;i<messages.length;i++) {
            if (messages[i].t !== SysMsgType.welcome) {
                messages.splice(i,1)
                break
            }
        }
        chatString = JSON.stringify(messages)
    }
    return messages
}

/*
##################################
            LOGIC
##################################
*/
enum SetupChatStatus {
    enabled = 'enabled',
    disabled = 'disabled',
    inputTooLong = 'inputTooLong',
    sentTooMuch = 'sentTooMuch',
}
let messageTimestamps:string[] = []
let inputSizeMax = 100

function Chat(props:Props) {
    
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
    

    /*
    ##################################
    ##################################
                GENERAL
    ##################################
    ##################################
    */
    const sendMessage = () => {
        
        if (status !== SetupChatStatus.enabled) {
            return
        }

        let newMsg:ChatMsg = {
            n: '',
            m: userMsg,
            t: SysMsgType.none
        }

        props.onNewMessage(newMsg) //fire event in parent
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
        for(let i=0;i<props.inputMessages.length;i++) {
            let item:ChatMsg = props.inputMessages[i]
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








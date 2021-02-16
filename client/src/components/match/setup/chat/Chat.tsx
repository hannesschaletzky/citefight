import React, { Component } from 'react';
import st from './Chat.module.scss'

import {Setup_ChatMsg} from 'components/Interfaces'
import {SysMsgType} from 'components/Interfaces'
import {SetupChatStatus} from 'components/Interfaces'

import WarningIcon from 'assets/setup/Warning_Icon.png'
import SendIcon from 'assets/setup/Send_Icon.png'

class Chat extends Component <any, any> {

    //array to store timestamps of sent messages
    messageTimestamps:string[] = []

    constructor(props: any) {
        super(props);
        this.state = {
            userMsg: '',
            status: SetupChatStatus.disabled
        };
    }

    componentWillUnmount() {
        /*
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state,callback)=>{
            return;
        }
        */
    }

    componentDidUpdate() {
        //scroll to bottom when new message was added
        this.scrollToBottom() 
    }
    private scrollTarget = React.createRef<HTMLDivElement>();
    scrollToBottom = () => {
        const node: HTMLDivElement | null = this.scrollTarget.current; //get the element via ref
        if (node) { //current ref can be null, so we have to check
            node.scrollIntoView({behavior: 'smooth'}); //scroll to the targeted element
        }
    };

    sendMessage() {
        
        if (this.state.status !== SetupChatStatus.enabled) {
            return
        }

        let newMsg:Setup_ChatMsg = {
            n: '',
            m: this.state.userMsg,
            t: SysMsgType.none
        }

        this.props.onNewMsg(newMsg) //fire event in parent
        this.messageTimestamps.push(new Date().toISOString())
        this.setState({userMsg: ''})
        this.setChatStatus(SetupChatStatus.disabled)
    }

    setChatStatus(_status:SetupChatStatus) {
        this.setState({status: _status})
    }

    didUserExceedLimit():boolean {
        //if user wants to send more than 5 messages within 15 seconds -> return true
        //check only as soon as five messages were sent
        let count = this.messageTimestamps.length - 1;
        if (count < 4) {
            return false
        }
        //calc time difference in milliseconds
        let ref = new Date(this.messageTimestamps[count - 4])
        let now = new Date()
        let diff = now.getTime() - ref.getTime(); 
        if (diff < 15000) {
            return true
        }
        return false
    }

    /*
    ##################################
    ##################################
            Handlers
    ##################################
    ##################################
    */
    onChange(event:any) {

        //set new text
        const value = event.target.value;
        this.setState({userMsg: value})

        //check empty or only spaces
        if (value.length === 0 || !value.trim()) {
            this.setChatStatus(SetupChatStatus.disabled)
        }
        else if (value.length > 50) {
            this.setChatStatus(SetupChatStatus.inputTooLong)
        }
        else if (this.didUserExceedLimit()) {
            this.setChatStatus(SetupChatStatus.sentTooMuch)
        }
        else {
            this.setChatStatus(SetupChatStatus.enabled)
        }
    }

    keyPressed(event: any) {
        //trigger send msg on return
        if (event.code === 'Enter' && this.state.userMsg !== "") {
            this.sendMessage()
        }
    }

    render() { 

        let inputMessages:Setup_ChatMsg[] = this.props.data

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
                    {item.t === SysMsgType.info &&
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

        return ( 
            <div className={st.Con}>
                <div className={st.Messages_Con}>
                    {cards}
                    <div ref={this.scrollTarget} data-explanation="This is where we scroll to"></div>
                </div>
                {this.state.status === SetupChatStatus.enabled &&
                    <div className={st.Info_Con_Send}>
                        <img className={st.Info_Icon} src={SendIcon} alt="Info"/>
                        <div>
                            Send with return
                        </div>
                    </div>
                }
                {this.state.status === SetupChatStatus.inputTooLong &&
                    <div className={st.Info_Con_TooLong}>
                        <img className={st.Info_Icon} src={WarningIcon} alt="Warning"/>
                        <div>
                            Exceeded 50 letters
                        </div>
                    </div>
                }
                {this.state.status === SetupChatStatus.sentTooMuch &&
                    <div className={st.Info_Con_TooMuch}>
                        <img className={st.Info_Icon} src={WarningIcon} alt="Warning"/>
                        <div>
                            Easy Boy...
                        </div>
                    </div>
                }
                <div>
                    <input  className={st.Input} 
                            type="search" 
                            autoComplete="off" 
                            placeholder="Type..." 
                            value={this.state.userMsg}
                            onChange={(e) => this.onChange(e)}
                            onKeyUp={(e) => this.keyPressed(e)}/>
                </div>
            </div>
        );
    }

}
export default Chat;





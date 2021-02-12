import React, { Component } from 'react';
import st from './Chat.module.scss'

import {Setup_ChatMsg} from 'components/Interfaces'
import {SysMsg} from 'components/Interfaces'

class Chat extends Component <any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            userMsg: '',
            sendEnabled: false 
        };
    }

    private scrollTarget = React.createRef<HTMLDivElement>();
    scrollToBottom = () => {
        const node: HTMLDivElement | null = this.scrollTarget.current; //get the element via ref

        if (node) { //current ref can be null, so we have to check
            node.scrollIntoView({behavior: 'smooth'}); //scroll to the targeted element
        }
    };

    componentWillUnmount() {
        /*
        // fix Warning: Can't perform a React state update on an unmounted component
        this.setState = (state,callback)=>{
            return;
        }
        */
    }

    componentDidUpdate() {
        this.scrollToBottom();//scroll to bottom when new message was added
    }

    sendMessage() {
        
        if (!this.state.sendEnabled) {
            return
        }

        let newMsg:Setup_ChatMsg = {
            name: '',
            msg: this.state.userMsg,
            type: SysMsg.none
        }

        this.props.onNewMsg(newMsg) //fire event in parent
        this.setState({userMsg: ''})
        this.setState({sendEnabled: false})
        
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
            this.setState({sendEnabled: false})
        }
        else if (value.length > 500000) {
            this.setState({sendEnabled: false})
        }
        else {
            this.setState({sendEnabled: true})
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
                    {item.type === SysMsg.userJoined &&
                        <div className={st.SysMessage_Joined}>
                            {item.msg}
                        </div>
                    }
                    {item.type === SysMsg.userLeft &&
                        <div className={st.SysMessage_Left}>
                            {item.msg}
                        </div>
                    }
                    {item.type === SysMsg.none &&
                        <div className={st.SysMessage_None}>
                            <div className={st.Sender}>
                                {item.name}:
                            </div>
                            <div className={st.Content}>
                                {item.msg}
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
                <div className={st.Bottom_Con}>
                    <input  className={st.Input} 
                            type="search" 
                            autoComplete="off" 
                            placeholder="Type..." 
                            value={this.state.userMsg}
                            onChange={(e) => this.onChange(e)}
                            onKeyUp={(e) => this.keyPressed(e)}/>
                    {this.state.sendEnabled &&
                        <button className={st.SendBtn} 
                                onClick={() => this.sendMessage()}>
                            Send
                        </button>
                    }
                </div>
            </div>
        );
    }

}
export default Chat;





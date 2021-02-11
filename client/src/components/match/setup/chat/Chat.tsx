import React, { Component } from 'react';
import st from './Chat.module.scss'

import {Setup_ChatMsg} from 'components/Interfaces'

class Chat extends Component <any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            userMsg: '',
            sendEnabled: false 
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

    sendMessage() {
        
        if (!this.state.sendEnabled) {
            return
        }

        let newMsg:Setup_ChatMsg = {
            name: '',
            message: this.state.userMsg
        }

        this.props.onNewMsg(newMsg) //fire event in parent
        this.setState({userMsg: ''})
        
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
            let msg:Setup_ChatMsg = inputMessages[i]
            let card = 
                <div key={i}>
                    {msg.name}: {msg.message}
                </div>
            cards.push(card)
        }

        return ( 
            <div className={st.Con}>
                {cards}
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





import React, { Component } from 'react';
import st from './Interaction.module.scss'

import {SetupJoinStatus} from 'components/Interfaces'
import {Setup_Player} from 'components/Interfaces'

import {didUserExceedLimit} from 'components/Logic'

import CopyIcon from 'assets/setup/Copy_Icon.png'
import QRCodeIcon from 'assets/setup/QR_Code_Icon.png'

import CircularProgress from '@material-ui/core/CircularProgress';
//https://www.npmjs.com/package/react-qr-code -> FOR CREDITS
import QRCode from "react-qr-code";

class Interaction extends Component <any, any> {

    //array to store timestamps of user actions
    actionTimestamps:string[] = []
    exceededMsgSent = false
    maxNameChars = 25
    currentUrl = window.location.href

    constructor(props: any) {
        super(props);
        this.state = {
            userName: '',
            joinEnabled: false,
            userNameInfo: '',
            showQRCode: false
        };
    }

    onJoinClick() {
        //check enabled
        if (!this.state.joinEnabled) {
            return
        }
        //is trying
        if (this.props.status === SetupJoinStatus.Connecting || 
            this.props.status === SetupJoinStatus.Joined) {
            console.log('already trying or already joined')
            return
        }
        
        //fire event in parent
        this.props.onJoinClick(this.state.userName) 
        this.setState({joinEnabled: false})
    }

    onLeaveClick() {   
        //reset vars
        this.exceededMsgSent = false
        this.actionTimestamps = []
        //fire event in parent
        this.props.onLeaveClick() 
    }

    onToogleReady(ready:boolean) {
        if (didUserExceedLimit(this.actionTimestamps, 5)) {
            this.sendExceedingLimitMsg()
            return
        }
        this.addTimestamp()
        this.props.onToogleReadyClick(ready)
    }

    onCopyClicked() {
        if (didUserExceedLimit(this.actionTimestamps, 5)) {
            this.sendExceedingLimitMsg()
            return
        }
        navigator.clipboard.writeText(this.currentUrl)
        this.addTimestamp()
        this.props.addInfoMsg('copied matchlink')
    }

    addTimestamp() {
        this.exceededMsgSent = false
        this.actionTimestamps.push(new Date().toISOString())
    }

    sendExceedingLimitMsg() {
        if (!this.exceededMsgSent) {
            this.props.addInfoMsg('easy boy... too many actions')
            this.exceededMsgSent = true
        }
    }

    onQRCodeClick(show:boolean) {
        this.setState({showQRCode: show})
        if (show) {
            console.log('QR Code for: ' + this.currentUrl)
        }
    }


    /*
    ##################################
    ##################################
            Handlers
    ##################################
    ##################################
    */
    userNameChanged(name: string) {

        //check empty or only spaces
        if (name.length === 0) {
            this.setState({joinEnabled: false})
        }
        else if (name.length > this.maxNameChars) {
            this.setState({joinEnabled: false})
            this.setState({userNameInfo: this.maxNameChars + ' characters maximum'})
        }
        else if (!this.checkUserNameContent(name)) {
            this.setState({joinEnabled: false})
            this.setState({userNameInfo: 'Letters, numbers and "_" are allowed'})
        }
        else {
            this.setState({userNameInfo: ''})
            this.setState({userName: name})
            this.setState({joinEnabled: true})
        }
    }

    keyPressed(event: any) {
        if (event.key === 'Enter' && this.state.userName !== "") {
            this.onJoinClick()
        }
    }

    checkUserNameContent(name:string):boolean {
        return (/^[a-zA-Z0-9_]+$/.test(name))
    }

    render() { 

        let user:Setup_Player = this.props.user
        //as soon as user has joined, there has to be a user object
        if (user === undefined && this.props.status === SetupJoinStatus.Joined) {
            console.log('Interaction.tsx ERROR: no user object given')
            return <div> CIRITCAL ERROR: no user object given</div>
        }
        
        return ( 
            <div>
                {(this.props.status === SetupJoinStatus.NotJoined || 
                this.props.status === SetupJoinStatus.Failed) &&
                    <div className={st.Header_Con}>
                        Type your name and join the room! 
                    </div>
                }
                {(this.state.userNameInfo !== '') &&
                    <div className={st.Error_Con}>
                        {this.state.userNameInfo}
                    </div>
                }
                <div className={st.Con}>
                    {(this.props.status === SetupJoinStatus.NotJoined || 
                    this.props.status === SetupJoinStatus.Failed) &&
                        <input  className={st.Input}
                                type="search" 
                                autoComplete="off" 
                                placeholder="Enter a name"
                                onChange={e => this.userNameChanged(e.target.value)} 
                                onKeyUp={e => this.keyPressed(e)}/>
                    }
                    {this.state.joinEnabled && 
                    (this.props.status === SetupJoinStatus.NotJoined || 
                    this.props.status === SetupJoinStatus.Failed) &&
                        <button className={st.Button_Join} onClick={() => this.onJoinClick()}>
                            Join
                        </button>
                    }
                    {(this.props.status === SetupJoinStatus.Joined) && 
                        <div className={st.Joined_Con}>
                            <button className={st.Button_Leave} onClick={() => this.onLeaveClick()}>
                                Leave
                            </button>
                            {!user.ready && 
                                <button className={st.Button_Ready} onClick={() => this.onToogleReady(true)}>
                                    Ready
                                </button>
                            }
                            {user.ready && 
                                <button className={st.Button_Unready} onClick={() => this.onToogleReady(false)}>
                                    Unready
                                </button>
                            }
                            <div className={st.Share_Con} title="Click to copy matchlink" onClick={() => this.onCopyClicked()}>
                                <img className={st.Copy_Icon} src={CopyIcon} alt="Copy"/>
                            </div>
                            <div className={st.Share_Con} title="Click to create QR code" onClick={() => this.onQRCodeClick(!this.state.showQRCode)}>
                                <img className={st.Copy_Icon} src={QRCodeIcon} alt="QR_Code"/>
                            </div>
                        </div>
                    }
                    {(this.props.status === SetupJoinStatus.Connecting) && 
                        <CircularProgress/>
                    }
                </div>
                {this.state.showQRCode &&
                    <div className={st.QR_Code_Con} onClick={() => this.onQRCodeClick(!this.state.showQRCode)}>
                        <QRCode value={this.currentUrl}/>
                        <button className={st.closeQRCode} >
                            Close QR Code
                        </button>
                    </div>
                }
            </div>
            
        );
    }
}
export default Interaction;







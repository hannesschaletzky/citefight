import React, { Component } from 'react';
import st from './Interaction.module.scss'

import {SetupJoinStatus} from 'components/Interfaces'
import {Setup_Player} from 'components/Interfaces'
import {NotificationType} from 'components/Interfaces'

import {didUserExceedLimit} from 'components/Logic'

import CopyIcon from 'assets/setup/Copy_Icon.png'
import QRCodeIcon from 'assets/setup/QR_Code_Icon.png'

import CircularProgress from '@material-ui/core/CircularProgress';
//https://www.npmjs.com/package/react-qr-code -> FOR CREDITS
import QRCode from "react-qr-code";

class Interaction extends Component <any, any> {

    //array to store timestamps of user actions
    actionTimestamps:string[] = []
    maxNameChars = 25
    currentUrl = window.location.href

    constructor(props: any) {
        super(props);
        this.state = {
            userName: '',
            joinEnabled: false,
            userNameError: '',
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
        this.actionTimestamps = []
        //fire event in parent
        this.props.onLeaveClick() 
    }

    onToogleReady(ready:boolean) {
        if (this.actionsExceeded()) {
            return
        }
        this.props.onToogleReadyClick(ready)
    }

    onCopyClicked() {
        if (this.actionsExceeded()) {
            return
        }
        navigator.clipboard.writeText(this.currentUrl)
        this.props.addNotification('copied matchlink', NotificationType.Not_Success)
    }

    onQRCodeClick(show:boolean) {
        if (show) {
            //only count when user wants to show
            if (this.actionsExceeded()) {
                return
            }
            //console.log('QR Code for: ' + this.currentUrl)
        }
        this.setState({showQRCode: show})
    }



    //ACTIONS EXCEEDED
    actionsExceeded():boolean {
        if (didUserExceedLimit(this.actionTimestamps, 7)) {
            //actions exceeded
            this.props.addNotification('easy boy... small cooldown - too many actions', NotificationType.Not_Warning)
            return true
        }
        //not exceeded -> add timestamp
        this.actionTimestamps.push(new Date().toISOString())
        return false
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
            this.setState({userNameError: this.maxNameChars + ' characters maximum'})
        }
        else if (!this.checkUserNameContent(name)) {
            this.setState({joinEnabled: false})
            this.setState({userNameError: 'Letters, numbers and "_" are allowed'})
        }
        else {
            this.setState({userNameError: ''})
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

        //as soon as user has joined, there has to be a user object
        let user:Setup_Player = this.props.user
        if (user === undefined && this.props.status === SetupJoinStatus.Joined) {
            console.log('Interaction.tsx ERROR: no user object given')
            return <div> CIRITCAL ERROR: no user object given</div>
        }

        //specify content to return
        let content = <div></div>
        if (this.props.status === SetupJoinStatus.NotJoined || 
            this.props.status === SetupJoinStatus.Failed) {
            //BEFORE JOIN
            content = 
            <div className={st.BeforeJoin_Con}>
                <div className={st.Caption}>
                    Type your name and join in! 
                </div>
                <input  className={st.Input}
                            type="search" 
                            autoComplete="off" 
                            placeholder="Enter a name"
                            onChange={e => this.userNameChanged(e.target.value)} 
                            onKeyUp={e => this.keyPressed(e)}/>
                {(this.state.userNameError !== '') &&
                    <div className={st.Error_Con}>
                        {this.state.userNameError}
                    </div>
                }
                {this.state.joinEnabled && 
                    <button className={st.Button_Join} onClick={() => this.onJoinClick()}>
                        Join
                    </button>
                }
            </div>
        }
        else if (this.props.status === SetupJoinStatus.Connecting) {
            //DURING JOIN
            content = 
            <div className={st.DuringJoin_Con}>
                <CircularProgress/>
            </div>
        }
        else if (this.props.status === SetupJoinStatus.Joined) {
            //JOINED
            content = 
            <div className={st.AfterJoin_Con}>
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
                <div className={st.Icon_Con} title="Click to copy matchlink" onClick={() => this.onCopyClicked()}>
                    <img className={st.Icon} src={CopyIcon} alt="Copy"/>
                </div>
                <div className={st.Icon_Con} title="Click to create QR code" onClick={() => this.onQRCodeClick(!this.state.showQRCode)}>
                    <img className={st.Icon} src={QRCodeIcon} alt="QR_Code"/>
                </div>
            </div>

        }
        
        return ( 
            <div>
                {content}
                {this.state.showQRCode &&
                    <div className={st.QR_Code_Con} onClick={() => this.onQRCodeClick(!this.state.showQRCode)}>
                        <QRCode value={this.currentUrl}/>
                        <button className={st.closeQRCode}>
                            Close QR Code
                        </button>
                    </div>
                }
            </div> 
        );
    }
}

export default Interaction;







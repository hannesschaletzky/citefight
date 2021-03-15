import React, { Component } from 'react';
import st from './Interaction.module.scss'

import {Player} from 'components/Interfaces'
import * as Not from 'components/00_shared/notification/Notification'

import {didUserExceedLimit} from 'components/Logic'

import CopyIcon from 'assets/setup/Copy_Icon.png'
import QRCodeIcon from 'assets/setup/QR_Code_Icon.png'

//https://www.npmjs.com/package/react-qr-code -> FOR CREDITS
import QRCode from "react-qr-code";

class Interaction extends Component <any, any> {

    //array to store timestamps of user actions
    actionTimestamps:string[] = []
    currentUrl = window.location.href

    constructor(props: any) {
        super(props);
        this.state = {
            lastUserName: this.props.lastUserName,
            userName: '',
            joinEnabled: false,
            userNameError: '',
            showQRCode: false
        };
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
        this.props.addNotification('copied matchlink', Not.Type.Success)
    }

    onQRCodeClick(show:boolean) {
        if (show) {
            //only count when user wants to show
            if (this.actionsExceeded()) {
                return
            }
            //log('QR Code for: ' + this.currentUrl)
        }
        this.setState({showQRCode: show})
    }



    //ACTIONS EXCEEDED
    actionsExceeded():boolean {
        if (didUserExceedLimit(this.actionTimestamps, 7)) {
            //actions exceeded
            this.props.addNotification('easy boy... small cooldown - too many actions', Not.Type.Warning)
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
    
    render() { 

        //as soon as user has joined, there has to be a user object
        let user:Player = this.props.user
        if (user === undefined) {
            //log('Interaction.tsx ERROR: no user object given')
            return <div> CIRITCAL ERROR: no user object given</div>
        }

        let content = 
        <div className={st.Con}>
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







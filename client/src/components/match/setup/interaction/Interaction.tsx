import React, { Component } from 'react';
import st from './Interaction.module.scss'

import {SetupJoinStatus} from 'components/Interfaces'
import {Setup_Player} from 'components/Interfaces'

import CopyIcon from 'assets/setup/Copy_Icon.png'

import CircularProgress from '@material-ui/core/CircularProgress';

class Interaction extends Component <any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            userName: '',
            joinEnabled: false
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
        //fire event in parent
        this.props.onLeaveClick() 
    }

    onToogleReady(ready:boolean) {
        this.props.onToogleReadyClick(ready)
    }


    /*
    ##################################
    ##################################
            Handlers
    ##################################
    ##################################
    */
    userNameChanged(name: string) {
        //setUserName(name)
        this.setState({userName: name})

        //check empty or only spaces
        if (name.length === 0 || !name.trim()) {
            this.setState({joinEnabled: false})
        }
        else {
            this.setState({joinEnabled: true})
        }
    }

    keyPressed(event: any) {
        if (event.key === 'Enter' && this.state.userName !== "") {
            this.onJoinClick()
        }
    }

    
    copyClicked() {
        let currentUrl = window.location.href
        navigator.clipboard.writeText(currentUrl)
        this.props.onCopyClick()
    }

    render() { 

        let user:Setup_Player = this.props.user

        return ( 
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
                        <div className={st.Share_Con} title="Click to copy matchlink" onClick={() => this.copyClicked()}>
                            <img className={st.Copy_Icon} src={CopyIcon} alt="Copy"/>
                        </div>
                    </div>
                }
                {(this.props.status === SetupJoinStatus.Connecting) && 
                    <CircularProgress/>
                }
            </div>
        );
    }
}
export default Interaction;







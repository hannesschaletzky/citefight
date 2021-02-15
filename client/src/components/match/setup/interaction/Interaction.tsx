import React, { Component } from 'react';
import st from './Interaction.module.scss'

import {SetupJoinStatus} from 'components/Interfaces'

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

    render() { 

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
                    <button className={st.Button_Leave} onClick={() => this.onLeaveClick()}>
                        Leave
                    </button>
                }
                {(this.props.status === SetupJoinStatus.Connecting) && 
                    <CircularProgress/>
                }
            </div>
        );
    }
}
export default Interaction;






import React, { Component } from 'react';
import st from './Players.module.scss'

import {Setup_Player} from 'components/Interfaces'

import ArrowIcon from 'assets/setup/Arrow_Icon.png'
import PersonIcon from 'assets/setup/Person_Icon.png'

class Players extends Component <any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    render() { 

        let players:Setup_Player[] = this.props.data
        let currentUser = this.props.currentUser

        let cards = []
        for(let i=0;i<players.length;i++) {
            let item:Setup_Player = players[i]
            let card = 
            <div className={st.PlayerCard} key={i}>
                <div className={st.Name_Con}>
                    {item.name}
                </div>
                <div className={st.IsYou_Con}>
                    {(currentUser === item.name) &&
                        <img className={st.Icon} src={PersonIcon} alt="IsYou"/>
                    }
                </div>
                <div className={st.Ready_Con}>
                    {item.ready &&
                        <img className={st.Icon} src={ArrowIcon} alt="Ready"/>
                    }
                </div>
                
            </div>
            cards.push(card)
        }

        return ( 
            <div>
                {cards}
            </div>
        );
    }
}
export default Players;








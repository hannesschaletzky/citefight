import React, { useEffect } from 'react';
import st from './Players.module.scss'

import {Setup_Player} from 'components/Interfaces'

export default function Players(players:Setup_Player[]) {
    //state hook

    useEffect(() => {

    });

    const getPlayerCards = () => {
        let cards = []
        for(let i=0;i<players.length;i++) {
            let card = 
            <div className={st.PlayerCard} key={i}>
                {players[i].name}
            </div>
            cards.push(card)
        }
        return cards
    }

    return (
        <div>
            {getPlayerCards()}
        </div>
    );
}

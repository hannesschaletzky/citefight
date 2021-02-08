import React, { Component } from 'react';
import styled from 'styled-components';
import st from './Nav_Answers.module.scss'

import VerifiedIcon from 'assets/tweet/VerifiedIcon.png'

import {Answer} from 'components/Interfaces'; //object type

class Nav_Answers extends Component <any, any> {

    active = 'active'
    inactive = 'inactive'

    Answer_Con = styled.div`
        height: 40px;
        display: flex;

        padding: 8px;
        margin-bottom: 8px;

        //border
        border: 1.7px solid;
        border-color: rgba(194, 192, 192, 0.75);
        border-radius: 8px;

        &.${this.active} {
            background-color: rgba(214, 235, 28, 1) !important; //overrides hover color
        }

        &.${this.inactive} {
            background-color: transparent;
        }

        &:hover {
            background-color: rgb(243, 243, 243);
        }
    `;

    constructor(props: any) {
        super(props);
        this.state = {
            currentCon: this.props.initialCon //reload previous selected con
        };
    }

    toogleCurrentCon(conClicked:string) {
        if (this.state.currentCon === conClicked) {
            //deselect
            this.setState({currentCon: ''})
            this.props.onSelectAnswer('') //remove con from parent 
        }
        else {
            //select
            this.setState({currentCon: conClicked})
            this.props.onSelectAnswer(conClicked) //add con to parent 
        }
    }

    checkActive(name:string) {
        //if con is in selected state
        if (this.state.currentCon === name) {
            return this.active
        }
        return this.inactive
    }

    render() { 

        //loop array & add each answer option as new card
        let answers:Answer[] = this.props.data
        let cards=[];
        for(let i=0;i<answers.length;i++){

            //get item
            var item:Answer = answers[i]

            //read values
            let picURL = item.picURL
            let name = item.name
            let tag = item.tag
            let isVerified = item.isVerified

            //name for active/inactive state
            let conName:string = 'answer' + i

            cards.push(
                <this.Answer_Con className={this.checkActive(conName)} onClick={() => this.toogleCurrentCon(conName)} key={tag}>
                    <img className={st.User_Pic} src={picURL} alt="User"/>
                    <div className={st.Name_Con}>
                        <div className={st.UserName}>
                            {name}
                        </div>
                        <div className={st.UserTag}>
                            @{tag}
                        </div>
                    </div>
                    {isVerified === 1 && <img className={st.Verified_Icon} src={VerifiedIcon} alt="Verified"/>}
                </this.Answer_Con>
            )
        }

        return (  
            <div className={st.Con}>
                {cards}
            </div>
        );
    }

}
export default Nav_Answers;




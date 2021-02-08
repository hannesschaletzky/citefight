import React, { Component } from 'react';
import styled from 'styled-components';
import st from './Nav.module.scss'


//https://freeicons.io/ 
import Answer from 'assets/nav/Answer.png'
import Ranking from 'assets/nav/Ranking.png'
import Chat from 'assets/nav/Chat.png'
import Settings from 'assets/nav/Settings.png'

import NavAnswers from './pages/Nav_Answers'
import NavRanking from './pages/Nav_Ranking'

class Nav extends Component <any, any> {

    //for explanation see here: 
    //https://styled-components.com/docs/basics#pseudoelements-pseudoselectors-and-nesting
    active = 'active'
    inactive = 'inactive'

    Icon_Con_New = styled.div`
        height: 50px;
        width: 50px;

        border: 1.7px transparent;
        border-radius: 20px;

        &.${this.active} {
            background-color: rgb(238, 235, 235) !important; //overrides hover color
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
            currentIndex: 0, //always start at answer when entering screen
            answerConName: ''
        };
    }

    setIndex(newIndex: number) {
        this.setState({currentIndex: newIndex})
    }

    checkActive(index:number) {
        //if div is selected index
        if (this.state.currentIndex === index) {
            return this.active
        }
        return this.inactive
    }

    setAnswerConName = (conName:string) => {
        this.setState({answerConName: conName});
    }

    render() { 

        let content = <div></div>
        if (this.state.currentIndex === 0) {
            content =  <NavAnswers  data={this.props.data.answers} 
                                    onSelectAnswer={this.setAnswerConName}
                                    initialCon={this.state.answerConName}
                        />
        }
        else if (this.state.currentIndex === 1) {
            content = <NavRanking data={this.props.data.ranking}/>
        }
        else if (this.state.currentIndex === 2) {
            content = <div>CONTENT 2</div>
        }
        else if (this.state.currentIndex === 3) {
            content = <div>CONTENT 3</div>
        }

        return (  
            <div>
                <div className={st.Nav_Bar}>
                    <this.Icon_Con_New className={this.checkActive(0)} onClick={() => this.setIndex(0)} >
                        <img className={st.Nav_Icon} src={Answer} alt="Answer" title="Answers"/>
                    </this.Icon_Con_New>
                    <this.Icon_Con_New className={this.checkActive(1)} onClick={() => this.setIndex(1)} >
                        <img className={st.Nav_Icon} src={Ranking} alt="Ranking" title="Ranking"/>
                    </this.Icon_Con_New>
                    <this.Icon_Con_New className={this.checkActive(2)} onClick={() => this.setIndex(2)} >
                        <img className={st.Nav_Icon} src={Chat} alt="Chat" title="Chat"/>
                    </this.Icon_Con_New>
                    <this.Icon_Con_New className={this.checkActive(3)} onClick={() => this.setIndex(3)} >
                        <img className={st.Nav_Icon} src={Settings} alt="Settings" title="Settings"/>
                    </this.Icon_Con_New>
                </div>
                <div>
                    {content}
                </div>
            </div>
        );
    }

}
export default Nav;





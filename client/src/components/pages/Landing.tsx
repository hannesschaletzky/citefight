import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import st from './Landing.module.scss'
import {log} from 'components/Logic'


class LandingPage extends Component {

    constructor(props: any) {
        super(props);
        this.state = {
        };
        
        this.findMatchroom = this.findMatchroom.bind(this); //bind function
    }

    render() { 
        return ( 
            <div>
                <div>
                    Welcome to citefight. This is a twitter guessing game.
                    You can either start playing right away or read the tutorial page.
                </div>
                <div className={st.top_con}>
                    <Link to="/matchroom/setup">Create Matchroom</Link>
                    <div className={st.findMatchroom_con}>
                        <input autoComplete="off" type="text"/>
                        <button className={st.linkfind} onClick={this.findMatchroom}>Find Matchroom</button>
                    </div>
                    <Link className={st.linkabout} to="/about">Read 'About' Page</Link>
                </div>
            </div>
        );
    }

    findMatchroom() {
        log('find matchroom was clicked.');
    }

}
export default LandingPage;





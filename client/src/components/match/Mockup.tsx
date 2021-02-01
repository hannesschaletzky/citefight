import React, { Component } from 'react';
import st from './Mockup.module.scss'

import TweetComponent from './tweet/Tweet'
import Navigation from './parts/Nav'

import {Mockdata} from '../Mockdata'
import {Tweet} from 'components/Interfaces'

class Mockup extends Component {

    //to get the mockdata
    private mockdata = new Mockdata();

    //passed to right panel
    rightPanData = {
        answers: this.mockdata.getAnswers(),
        ranking: this.mockdata.getRanking()
    }

    //passed to center panel -> tweet
    tweet: Tweet = this.mockdata.getTweet()

    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    render() { 

        return (  
            <div className={st.Content_Con}>
                <div className={st.Left_Panel}>
                    Ad Container
                </div>
                <div className={st.Center_Panel}>
                    <TweetComponent data={this.tweet}/>
                </div>
                <div className={st.Right_Panel}>
                    <div className={st.Game_Info_Panel}>
                        <div className={st.Playclock}>
                            22
                        </div>
                        <div className={st.RoundCount}>
                            8/15
                        </div>
                    </div>
                    
                    <div className={st.Navigation_Con}>
                        <Navigation data={this.rightPanData}/>
                    </div>
                </div>
                
            </div>
        );
    }

}

export default Mockup;



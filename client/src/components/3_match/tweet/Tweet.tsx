import React, { Component } from 'react';
import st from './Tweet.module.scss'

import TopPart from './parts/TopPart'
import Images from './parts/Images'
import BottomPart from './parts/BottomPart'

import {Tweet} from 'components/Interfaces'

class TweetComponent extends Component <any, any> { 

    constructor(props: any) {
        super(props)
        this.state = {
        };
    }

    tweet:Tweet = this.props.data //infert to type for safety

    render() { 

        return (  
            <div className ={st.Box} >
                <div className={st.Top_Con}>
                    <TopPart data={this.tweet.topPart}/>
                </div>
                <div className={st.Mid_Con}>
                    <div className={st.Text}>
                        {this.tweet.content.text}
                    </div>
                    <Images data={this.tweet.content}/>
                </div>
                <div className={st.Bottom_Con}>
                    <BottomPart data={this.tweet.bottomPart}/>
                </div>
            </div>
        );
    }

}

export default TweetComponent

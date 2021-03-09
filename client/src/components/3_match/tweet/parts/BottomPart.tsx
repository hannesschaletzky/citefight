import React, { Component } from 'react';
import st from './BottomPart.module.scss'

import ReplyIcon from 'assets/tweet/Reply.png'
import RetweetIcon from 'assets/tweet/Retweet.png'
import LikeIcon from 'assets/tweet/Like.png'

import {Tweet_BottomPart} from 'components/Interfaces' //object type


class BottomPart extends Component <any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    tweet_bottomPart: Tweet_BottomPart = this.props.data //parse to object type for safety

    render() { 

        return (  
            <div className={st.BottomPart_Con}>
                <div className={st.Reply_Con}>
                    <img className={st.Reply_Icon} src={ReplyIcon} alt="Reply" />
                    <div className={st.IconText}>{this.tweet_bottomPart.replyCount}</div>
                </div>
                <div className={st.Retweet_Con}>
                    <img className={st.Retweet_Icon} src={RetweetIcon} alt="Retweet" />
                    <div className={st.IconText}>{this.tweet_bottomPart.retweetCount}</div>
                </div>
                <div className={st.Like_Con}>
                    <img className={st.Like_Icon} src={LikeIcon} alt="Like" />
                    <div className={st.IconText}>{this.tweet_bottomPart.likeCount}</div>
                </div>
                <div className={st.Date}>
                    {this.tweet_bottomPart.date}
                </div>
            </div>
        );
    }
}

export default BottomPart;




import React, { Component } from 'react';
import st from './TopPart.module.scss'

import TwitterIcon from 'assets/tweet/Twitter_Icon.png'
import VerifiedIcon from 'assets/tweet/VerifiedIcon.png'

import {Tweet_TopPart} from 'components/Interfaces' //object type


class TopPart extends Component <any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    tweet_topPart: Tweet_TopPart = this.props.data //parse to object type for safety

    render() { 

        return (  
            <div className={st.TopPart_Con}>
                <a href={this.tweet_topPart.profileURL} target="_blank" rel="noreferrer">
                    <img className={st.User_Pic} src={this.tweet_topPart.userPicURL} alt="User"/>
                </a>
                <div className={st.Name_Con}>
                    <div className={st.UserName}>
                        {this.tweet_topPart.userName}
                    </div>
                    <a className = {st.UserTag_Link} href={this.tweet_topPart.profileURL} target="_blank" rel="noreferrer">
                        <div className={st.UserTag}>
                            @{this.tweet_topPart.userTag}
                        </div>
                    </a>
                </div>
                {this.tweet_topPart.userVerified && <img className={st.Verified_Icon} src={VerifiedIcon} alt="Verified" />}
                <a className = {st.Twitter_Icon_Link} href={this.tweet_topPart.tweetURL} target="_blank" rel="noreferrer">
                    <img className={st.Twitter_Icon} src={TwitterIcon} alt="Twitter"/>
                </a>
            </div>
        );
    }
}

export default TopPart;


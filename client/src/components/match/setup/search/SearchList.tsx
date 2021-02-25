import React, { Component } from 'react';
import st from './SearchList.module.scss'

import {Twitter_User} from 'components/Interfaces'
import {TwitterStatus} from 'components/Interfaces'

import VerifiedIcon from 'assets/tweet/VerifiedIcon.png'

enum ActionConType {
    init,
    add,
    follow
}

class Search_List extends Component <any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            activeCard: this.props.initialCon //reload previous selected con
        };
    }

    toogleActiveCard(newKey:string, profileProtected:boolean) {
        if (this.state.activeCard === newKey) {
            //deselect
            this.setState({activeCard: ''})
        }
        else {
            //select
            this.setState({activeCard: newKey})
        }
    }

    checkActive(key:string) {
        //if con is in selected state
        if (this.state.activeCard === key) {
            return st.actions_Con_Show
        }
        return st.actions_Con_Hidden
    }

    addUser(user: Twitter_User) {

        //retrieve only information that we need, not entire object
        let parsedUser:Twitter_User = {
            id: user.id,
            screen_name: user.screen_name,
            name: user.name,
            description: user.description,
            location: user.location,
            verified: user.verified,
            protected: user.protected,
            following: user.following,
            followers_count: user.followers_count,
            statuses_count: user.statuses_count,
            profile_image_url_https: user.profile_image_url_https,
        } 

        this.props.onAddUser(parsedUser)
        console.log('added user: ' + user.screen_name)
    }

    followUser(user: Twitter_User) {
        console.log('Trying to follow: ' + user.screen_name)
    }

    render() { 

        //loop array & add each answer option as new card
        let users:Twitter_User[] = this.props.data
        let cards=[];
        for(let i=0;i<users.length;i++){

            let user:Twitter_User = users[i]

            //construct twitter user url
            let profileUrl = "https://twitter.com/" + user.screen_name

            //protected profile settings
            let topClassName = st.userCard_Con
            let topTitle = user.description
            if (user.protected) {
                topClassName = st.userCard_Con_Disabled
                topTitle = 'This profile is not public, if youre logged in with your user, you can follow it'
            }

            //determine action con to display
            let actionCon:ActionConType = ActionConType.init
            if (!user.protected) {
                actionCon = ActionConType.add
            }
            else if (user.protected && !user.following) {
                actionCon = ActionConType.follow
            }

            //check if user already added
            let addedUsers:Twitter_User[] = this.props.addedUsers
            for(let i=0;i<addedUsers.length;i++) {
                let item = addedUsers[i]
                if (item.screen_name === user.screen_name) {
                    //user already added, no actions available
                    actionCon = ActionConType.init
                    break
                }
            }

            //determine if name contains emoji
            let userNameClass = st.UserName
            if (/\p{Extended_Pictographic}/u.test(user.name) ) {
                userNameClass = st.UserName_Emoji
            }

            cards.push(
                <div className={topClassName} key={user.screen_name} title={topTitle} onClick={() => this.toogleActiveCard(user.screen_name, user.protected)}>
                    <a href={profileUrl} target="_blank" rel="noreferrer" title="View twitter profile">
                        <img className={st.User_Pic} src={user.profile_image_url_https} alt="User"/>
                    </a>
                    <div className={st.UserCard_DataCon}>
                        <div className={st.Names_Con}>
                            <div className={st.UserName_Con}>
                                <div className={userNameClass} title={user.name}>
                                    {user.name}
                                </div>
                                {user.verified && <img className={st.Verified_Icon} src={VerifiedIcon} title="Verified User" alt="Verified"/>}
                            </div>
                            <div className={st.UserTag}>
                                @{user.screen_name}
                            </div>
                        </div>
                        <div className={st.Numbers_Con}>
                            <div className={st.Tweet_Count} title="Tweets" >
                                {numberWithThousandSep(user.statuses_count)}
                            </div>
                            <div className={st.Follower_Count} title="Followers" >
                                {numberWithThousandSep(user.followers_count)}
                            </div>
                        </div>
                        <div className={this.checkActive(user.screen_name)} onClick={() => this.toogleActiveCard(user.screen_name, user.protected)}>
                            {(actionCon === ActionConType.add) &&
                                <div className={st.Actions_Con}>
                                    <button className={st.Button_Add} onClick={() => this.addUser(user)}>
                                        Add
                                    </button>
                                </div>
                            }
                            {(actionCon === ActionConType.follow) && this.props.twitterStatus === TwitterStatus.signedIn && 
                                <div className={st.Actions_Con}>
                                    <button className={st.Button_Follow} onClick={() => this.followUser(user)}>
                                        Follow
                                    </button>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            )
        }

        return ( 
            <div>
                {cards}
            </div>
        );
    }

}
export default Search_List;

function numberWithThousandSep(x: number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}




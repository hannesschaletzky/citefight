import React, { Component } from 'react';
import st from './SearchList.module.scss'

import {Twitter_User} from 'components/Interfaces'
import VerifiedIcon from 'assets/tweet/VerifiedIcon.png'

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
            //this.props.onSelectAnswer(''); //remove con from parent 
        }
        else {
            //select
            this.setState({activeCard: newKey})
            //this.props.onSelectAnswer(conClicked); //add con to parent 
        }
    }

    checkActive(key:string) {
        //if con is in selected state
        if (this.state.activeCard === key) {
            return st.actions_Con_Show
        }
        return st.actions_Con_Hidden
    }

    render() { 

        //var values = Object.values(this.props.data) get objects into an array
        let count = Object.keys(this.props.data).length //get count of objects passed 
        
        //loop array & add each answer option as new card
        var cards=[];
        for(let i=0;i<count;i++){
            //get item
            let key = Object.keys(this.props.data)[i];
            let user:Twitter_User = this.props.data[key]

            //construct twitter user url
            let profileUrl = "https://twitter.com/" + user.screen_name

            //protected profile settings
            let topClassName = st.userCard_Con
            let topTitle = user.description
            if (user.protected) {
                topClassName = st.userCard_Con_Disabled
                topTitle = 'This profile is not public, if youre logged in with your user, you can follow it'
            }

            cards.push(
                <div className={topClassName} key={user.screen_name} title={topTitle} onClick={() => this.toogleActiveCard(user.screen_name, user.protected)}>
                    <a href={profileUrl} target="_blank" rel="noreferrer" title="View twitter profile">
                        <img className={st.User_Pic} src={user.profile_image_url_https} alt="User"/>
                    </a>
                    <div className={st.UserCard_DataCon}>
                        <div className={st.Names_Con}>
                            <div className={st.UserName_Con}>
                                <div className={st.UserName} title={user.name}>
                                    {user.name}
                                </div>
                                {user.verified && <img className={st.Verified_Icon} src={VerifiedIcon} title="User is verified" alt="Verified"/>}
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
                            Actions
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




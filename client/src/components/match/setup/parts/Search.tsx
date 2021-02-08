import React, { useState, useEffect } from 'react';
import st from './Search.module.scss'

import CircularProgress from '@material-ui/core/CircularProgress';
import {Twitter_User} from 'components/Interfaces'
import TwitterIcon from 'assets/footer/Twitter_Icon.png'
import VerifiedIcon from 'assets/tweet/VerifiedIcon.png'

//import TwitterIcon_Black from 'assets/user/Twitter_Black.png'

const stateInitArray:Twitter_User[] = []
const stateUserCardsInit = [<div key="init"></div>]

export default function Search() {
    //state hook
    const [page, setPage] = useState(1);
    const [userObjects, setUserObjects] = useState(stateInitArray);
    const [userCards, setUserCards] = useState(stateUserCardsInit);
    const [searchInput, setSearchInput] = useState("");
    const [lastSearchString, setLastSearchString] = useState("");
    const [searchEnabled, setSearchEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [actionCard, setActionCard] = useState("");

    enum RequestType {
        inital,
        more
    }

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        
    });


    const onSearchButtonClick = (type: RequestType) => {

        //dont fire mutiple requests
        if (loading) {
            console.log('already loading')
            return
        }

        if (!searchEnabled && RequestType.inital) {
            console.log('no input string')
            return
        }

        //check if user loads more users or searches for new
        let qString = ""
        let newPage = -1
        if (type === RequestType.inital) {
            setPage(1)
            newPage = 1
            qString = searchInput
            //reset state arrays
            let _userCards = userCards 
            let length = _userCards.length
            while (length >= 0) {
                _userCards.pop()
                length--
            }
            setUserCards(_userCards) 

            let _userObjects = userObjects 
            length = _userObjects.length
            while (length >= 0) {
                _userObjects.pop()
                length--
            }
            setUserObjects(_userObjects) 
            
        }
        else if (type === RequestType.more) {
            newPage = page + 1
            setPage(newPage)
            qString = lastSearchString
        }

        if (qString === "" || newPage === -1) {
            console.log('not all query parameters given')
            return
        }

        //start request
        setLoading(true)
        getUsers(qString, newPage)
            .then(res => {
                if (res.status !== 200) {
                    //error
                    console.log('error occured: ' + res.message)
                    if (res.status === 44) {
                        //-> no more users to show
                    }
                }
                else {
                    //success
                    console.log('successfully got data for "' + qString + '" at page ' + newPage)
                    parseReponse(res.data)
                    //if user clicks mutiple times on more but no input string entered
                    if (searchInput.length === 0) {
                        setLastSearchString(lastSearchString)
                    }
                    else {
                        setLastSearchString(searchInput)
                    }
                    
                }
                setLoading(false)
            }) 
            .catch(err => {
                console.log(err)
                setLoading(false)
            });
    }

    const getUsers = async (name: string, page: number) => {
        //passing additional parameters in header
        var requestOptions = {
            headers: {
                'q': name,
                'page': page.toString()
            }
        };
        let request = new Request('/api/users', requestOptions)

        const response = await fetch(request);
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        
        return body;
    };

    //this parses the retrieved object to array of users that is then displayed
    const parseReponse = (input: any[]) => {

        let parsedUsers:Twitter_User[] = []
        for(let i=0;i<input.length;i++) {
            let item = input[i]
            let newUser:Twitter_User = {
                id: item.id,
                screen_name: item.screen_name,
                name: item.name,
                description: item.description,
                location: item.location,
                verified: item.verified,
                protected: item.protected,
                following: item.following,
                followers_count: item.followers_count,
                statuses_count: item.statuses_count,
                profile_image_url_https: item.profile_image_url_https,
            } 
            //check if already included
            let included = false
            for(let j=0;j<userObjects.length;j++) {
                if (userObjects[j].id === newUser.id)  {
                    included = true
                    break
                }
            }
            if (!included) {
                console.log('adding user: ' + newUser.name)
                parsedUsers.push(newUser)
            }
            else {
                console.log('skipping user ' + newUser.name)
            }
        }
        addUsersToUI(parsedUsers)
    }

    const addUsersToUI = (users:Twitter_User[]) => {

        //loop all users and insert ui card into array
        let cards = []
        for(let i=0;i<users.length;i++) {
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


            let userCard = 
            <div className={topClassName} key={user.screen_name} title={topTitle} onClick={() => cardClicked(user.screen_name, user.protected)}>
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
                    <div className={getActiveState(user.screen_name)} onClick={() => cardClicked(user.screen_name, user.protected)}>
                        Actions
                    </div>
                </div>
            </div>
                
            cards.push(userCard)
        }

        //UI
        let _userCards = userCards //get state array
        let concatedArray = _userCards.concat(cards)
        setUserCards(concatedArray)

        //internal
        let _userObjects = userObjects //get state array
        let concat = _userObjects.concat(users)
        setUserObjects(concat) 
        
    }


    /*
        USER CARD HANDLER
    */

    const getActiveState = (key: string) => {
        console.log('determine action state for card: ' + key)
        if (actionCard === key) {
            //show
            return st.actions_Con_Show
        }
        else {
            //dismiss
            return st.actions_Con_Hidden
        }
    }

    const cardClicked = (key: string, userProtected: boolean) => {
        console.log(actionCard)
        if (userProtected) {
            console.log('protected profile')
        }
        if (actionCard === "") {
            //add
            setActionCard(key);
            console.log('add action card: ' + actionCard)
        }
        else if (actionCard === key) {
            //remove
            setActionCard("")
            console.log('remove action card ' + actionCard)
        }

        /*
        My explanatin for this behaviour is that the userCards component is being created with certain states
        but not being rerendered when the actionCard changes... 
        -> extract the UI of the user cards to a seperate component 
        -> then it should be rerendered...

        
        the answers component also only gets a list of the objects as input...
        */

    }   


    /*
        BUTTON HANDLERS
    */
    const userNameChanged = (name: string) => {
        setSearchInput(name)

        if (name.length === 0 || !name.trim()) {
            setSearchEnabled(false)
        }
        else {
            setSearchEnabled(true)
        }
    }

    const keyPressed = (event: any) => {
        if (event.key === 'Enter' && searchInput !== "") {
            onSearchButtonClick(RequestType.inital)
        }
    }

  return (
    <div >
        <div className={st.Con}>
            <div>
                {actionCard}
            </div>
            <div className={st.Top_Con}>
                <input className={st.Input} type="search" autoComplete="off" placeholder="Type name or usertag" onChange={e => userNameChanged(e.target.value)} onKeyPress={e => keyPressed(e)}/>
                {searchEnabled && <div className={st.buttonCon}>
                    <img className={st.Icon} src={TwitterIcon} alt="Twitter" onClick={e => onSearchButtonClick(RequestType.inital)}/>
                    <button className={st.searchButton} onClick={e => onSearchButtonClick(RequestType.inital)}>Search</button>
                </div>}
            </div>
            <div className={st.List_Con}>
                {userCards}
            </div>
            <div className={st.buttonMore_Con}>
                {(userCards.length % 20 === 0) && (userCards.length !== 0) && <button className={st.buttonMore} onClick={e => onSearchButtonClick(RequestType.more)}>Show more...</button>}
            </div>
            <div className={st.loading_Con}>
                {loading && <CircularProgress/>}
            </div>
        </div>
    </div>
  );
}


function numberWithThousandSep(x: number) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}





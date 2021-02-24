import React, { useState, useEffect } from 'react';
import  { Redirect } from 'react-router-dom'
import st from './Search.module.scss'

import SearchList from './SearchList'
import CircularProgress from '@material-ui/core/CircularProgress';
import TwitterIcon from 'assets/footer/Twitter_Icon.png'

//import oauthSignature from 'oauth-signature/dist/oauth-signature.js'

import {TwitterStatus} from 'components/Interfaces'
import {Twitter_User} from 'components/Interfaces'
import {SetupJoinStatus} from 'components/Interfaces'
import {LocalStorage} from 'components/Interfaces'

const stateInitArray:Twitter_User[] = []

enum TokenStatus {
    init,
    requested,
    error,
    //no received, since there is a immediate redirect on receive
}

enum RequestType {
    inital,
    more
}

export default function Search( 
                                twitterStatus:TwitterStatus,
                                joinType: SetupJoinStatus,
                                addedUsers:Twitter_User[],
                                panelContainer:string,
                                addUserFunc:(par1: Twitter_User) 
                                => void) 
                                {
    const [page, setPage] = useState(1);
    const [userObjects, setUserObjects] = useState(stateInitArray);
    const [searchInput, setSearchInput] = useState("");
    const [lastSearchString, setLastSearchString] = useState("");
    const [searchEnabled, setSearchEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [_twitterStatus, setTwitterStatus] = useState(twitterStatus)
    const [tokenStatus, setTokenStatus] = useState(TokenStatus.init)
    const [redirectURL, setRedirectURL] = useState('')

    
    useEffect(() => {
        let accessToken = localStorage.getItem(LocalStorage.Access_Token)
        let accessToken_Secret = localStorage.getItem(LocalStorage.Access_Token_Secret)
        if (accessToken !== null && accessToken_Secret != null) {
            console.log('twitter access token and secret available')
            //validate tokens with call
            // -> https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials

            //if valid -> enable search
            //invalid -> show twitter login button again
        }
    });
    

    /*
    ##################################
    ##################################
            Twitter API Search
    ##################################
    ##################################
    */


    const onSearchButtonClick = (type: RequestType) => {

        //dont fire mutiple requests
        if (loading) {
            console.log('already loading')
            return
        }

        //check if search string is provided
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

            //reset user objects
            let _userObjects = userObjects 
            let length = _userObjects.length
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

                    //if user clicks on more but deleted search string already
                    if (searchInput.length === 0) {
                        setLastSearchString(lastSearchString)
                    }
                    else {
                        setLastSearchString(searchInput)
                    }

                    //append new user objects to current
                    let _userObjects = userObjects
                    let concat = _userObjects.concat(res.data)
                    setUserObjects(concat) 
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
        let request = new Request('/api/twitter/users', requestOptions)

        const response = await fetch(request)
        const body = await response.json()
        if (response.status !== 200) throw Error(body.message)
        
        return body;
    };

    /*
    ##################################
    ##################################
            Twitter Sign in
    ##################################
    ##################################
    */

    const onSignInButtonClicked = async () => {
        console.log('trying to sign in')
        setTokenStatus(TokenStatus.requested)

        //userAuth
        let request = new Request('/api/twitter/request_token')
        const response = await fetch(request)
        const body = await response.json()
        if (body.status !== 200) {
            console.log('ERROR retrieving user token from: api.twitter.com/oauth/request_token')
            console.log(body)
            setTokenStatus(TokenStatus.error)
        }
        else {
            console.log(body)
            //"oauth_token=i-7ofAAAAAABLx8pAAABd86SI80&oauth_token_secret=IvoJA3G2XzQ41c9IlfgZb8HHQY8Vw6Rq&oauth_callback_confirmed=true"
            let str: string = body.body

            //extract token
            let search = '='
            let start = str.indexOf(search) + search.length;
            let end = str.indexOf('&');
            let token = str.substring(start, end)

            //extract token_secret
            search = 'secret='
            start = str.indexOf(search) + search.length;
            end = str.lastIndexOf('&');
            let tokenSecret = str.substring(start, end)

            //extract matchID
            let current = window.location.href
            let matchID = current.substr(current.lastIndexOf('/') + 1)

            //reset old access token + secret retrieved in step 3
            localStorage.removeItem(LocalStorage.Access_Token)
            localStorage.removeItem(LocalStorage.Access_Token_Secret)

            //save tokens for current step 1
            localStorage.setItem(LocalStorage.Token, token)
            localStorage.setItem(LocalStorage.Token_Secret, tokenSecret)
            localStorage.setItem(LocalStorage.MatchID, matchID)

            //redirect user to: /redirect/:token
            setRedirectURL('/redirect/' + token)
            setTwitterStatus(TwitterStatus.tokenReceived)
            
        }
    }




    /*
    ##################################
    ##################################
            Handlers
    ##################################
    ##################################
    */
    const userNameChanged = (name: string) => {
        setSearchInput(name)

        //check empty or only spaces
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

    const getContent = () => {
        /*
            -> conditions have to be passed to the function of the component in order to avoid
                -> "React has detected a change in the order of Hooks"
                -> "Uncaught Invariant Violation: Rendered more hooks than during the previous render"
                https://reactjs.org/docs/hooks-rules.html
        */
        let rtn = <div></div>
        if (joinType === SetupJoinStatus.Joined) { 
            if (_twitterStatus === TwitterStatus.none) {
                //NOT SIGNED IN
                rtn = 
                <div className={panelContainer} /*coming from parent container*/>
                    <div className={st.SignIn_Con}>
                        <div className={st.Button_Con}>
                            <img className={st.Icon} 
                                src={TwitterIcon} 
                                alt="Sign into Twitter" 
                                onClick={() => onSignInButtonClicked()}/>
                            <button className={st.Search} 
                                    onClick={() => onSignInButtonClicked()}>
                                        Sign in
                            </button>
                        </div>
                        <div className={st.SignIn_Caption}>
                            Sign in to browse Twitter and add the profiles you wanna play.
                        </div>
                        <div className={st.TokenStatus_Con}>
                            {(tokenStatus === TokenStatus.error) &&
                            <div>
                                There was an error receiving the token.
                            </div>
                            }
                            {(tokenStatus === TokenStatus.requested) &&
                                <CircularProgress/>
                            }
                        </div>
                    </div>
                </div>
            }
            else if (_twitterStatus === TwitterStatus.tokenReceived) {
                //FIRST TOKEN RECEIVED
                rtn = 
                    <Redirect to={redirectURL}/>
            }
            else if (_twitterStatus === TwitterStatus.signedIn) {
                //SIGNED IN
                rtn = 
                <div className={panelContainer} /*coming from parent container*/>
                    <div className={st.Con}>
                        <div className={st.Top_Con}>
                            <input  className={st.Input} 
                                    type="search" 
                                    autoComplete="off" 
                                    placeholder="Enter username or tag..." 
                                    onChange={(e) => userNameChanged(e.target.value)} 
                                    onKeyPress={(e) => keyPressed(e)}/>
                            {searchEnabled && 
                                <div className={st.Button_Con}>
                                    <img className={st.Icon} 
                                        src={TwitterIcon} 
                                        alt="Twitter" 
                                        onClick={(e) => onSearchButtonClick(RequestType.inital)}/>
                                    <button className={st.Search} 
                                            onClick={(e) => onSearchButtonClick(RequestType.inital)}>
                                                Search
                                    </button>
                                </div>
                            }
                        </div>
                        <div className={st.List_Con}>
                            <SearchList
                                data={userObjects}
                                addedUsers={addedUsers}
                                onAddUser={addUserFunc}
                            />
                            <div className={st.Bottom_Con}>
                                {(userObjects.length % 20 === 0) && (userObjects.length !== 0) && 
                                    <button className={st.More} 
                                            onClick={(e) => onSearchButtonClick(RequestType.more)}>
                                        Show more...
                                    </button>
                                }
                                {loading && 
                                    <CircularProgress/>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            }
        }
        return rtn
    }

  return (
    getContent()
  );
}



/*






*/

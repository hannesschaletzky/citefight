import React, { useState } from 'react';
import st from './Search.module.scss'

import SearchList from './SearchList'
import CircularProgress from '@material-ui/core/CircularProgress';

//import oauthSignature from 'oauth-signature/dist/oauth-signature.js'

import {Twitter_User} from 'components/Interfaces'
import {SetupJoinStatus} from 'components/Interfaces'
import {TwitterStatus} from 'components/Interfaces'

import TwitterIcon from 'assets/footer/Twitter_Icon.png'

const stateInitArray:Twitter_User[] = []

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
    
    enum RequestType {
        inital,
        more
    }

    // Similar to componentDidMount and componentDidUpdate:
    /*
    useEffect(() => {
        
    });
    */

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
        
        /*
        let API_Key = process.env.REACT_APP_TWITTER_API_Key
        let API_Secret = process.env.REACT_APP_TWITTER_API_Secret

        console.log(API_Key)
        console.log(API_Secret)

        //CREATE SIGNATURE
        let httpMethod = 'POST'
        let url = 'https://api.twitter.com/oauth/request_token'
        let parameters = {
            oauth_consumer_key : API_Key,
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: '1613733259',
            oauth_nonce: 'kllo9940pd9333jh',
            oauth_callback: 'http%3A%2F%2Flocalhost%3A3000%2Fstart', //maybe use normal 
            oauth_version: '1.0',
        }
        let consumerSecret = API_Secret
        // generates a RFC 3986 encoded, BASE64 encoded HMAC-SHA1 hash
        let encodedSignature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret)
        // generates a BASE64 encode HMAC-SHA1 hash
        let signature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, { encodeSignature: false});
        console.log(signature)


        //passing additional parameters in header
        let requestOptions = {
            headers: {
                'sig': encodedSignature,
                'time': parameters.oauth_timestamp,
                'nonce': parameters.oauth_nonce
            }
        };
        let request = new Request('/api/twitter/userAuthNew', requestOptions)
        //let request = new Request('/api/twitter/userAuthNew')
        const response = await fetch(request)
        const body = await response.json()
        if (response.status !== 200) {
            throw Error(body.message)
        }
        console.log(body)
        */


        //GET
        /*
        //let request = new Request('/api/twitter/userAuth')
        let request = new Request('/api/twitter/postTweet')
        const response = await fetch(request)
        const body = await response.json()
        if (response.status !== 200) {
            throw Error(body.message)
        }
        console.log(body)
        */

        //POST
        const response = await fetch('/api/twitter/postTweetNew', {
            method: 'POST',
            body: JSON.stringify('test'),
        });
        //read response
        const body = await response.text();
        console.log(body)
        
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
            if (twitterStatus === TwitterStatus.none) {
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
                    </div>
                </div>
            }
            else if (twitterStatus === TwitterStatus.signedIn) {
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

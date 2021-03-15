import React, { useState } from 'react';
//import  { Redirect } from 'react-router-dom'
import st from './Search.module.scss'
import {log} from 'components/Logic'
//ui-elements
import TwitterProfileList from './TwitterProfileList'
import CircularProgress from '@material-ui/core/CircularProgress';
import TwitterIcon from 'assets/footer/Twitter_Icon.png'
import TwitterIconBlack from 'assets/user/Twitter_Black.png'
//logic
import {didUserExceedLimit} from 'components/Logic'
//interfaces
import {Profile} from 'components/Interfaces'
import {LocalStorage} from 'components/Interfaces'
import {TwitterStatus} from 'components/Interfaces'
import {ProfilesUsage} from 'components/Interfaces'
//functional-interfaces
import {SearchProps} from 'components/Functional_Interfaces'
//components
import * as Not from 'components/00_shared/notification/Notification'

const stateInitArray:Profile[] = []

/*
//status for step 1
enum TokenStatus {
    init,
    requested,
    error,
    //no received, since there is a immediate redirect on receive
}

//status for saved token from localstorage
enum TokenVerify {
    init,
    pending,
    fail,
    success
}
*/

//search request type
enum RequestType {
    inital,
    more
}

let actionTimestamps:string[] = []

export default function Search(props:SearchProps) {
    const [page, setPage] = useState(1);
    const [userObjects, setUserObjects] = useState(stateInitArray);
    const [searchInput, setSearchInput] = useState("");
    const [lastSearchString, setLastSearchString] = useState("");
    const [searchEnabled, setSearchEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [twitterStatus, setTwitterStatus] = useState(TwitterStatus.none)
    //const [tokenStatus, setTokenStatus] = useState(TokenStatus.init)
    //const [tokenVerifyStatus, setTokenVerifyStatus] = useState(TokenVerify.init)
    //const [redirectURL, setRedirectURL] = useState('')

    
    /*
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {

        
        //CHECK IF USER ALREADY HAS VALID TOKEN IN LOCAL STORAGE
        //only verify once
        if (tokenVerifyStatus !== TokenVerify.init) {
            return
        }
        //verify token & secret
        setTokenVerifyStatus(TokenVerify.pending)
        let accessToken = localStorage.getItem(LocalStorage.Access_Token)
        let accessToken_Secret = localStorage.getItem(LocalStorage.Access_Token_Secret)
        if (accessToken !== null && accessToken_Secret != null) {
            log('token & secret available -> verify')
            verifyCredentials(accessToken, accessToken_Secret)
                .then(() => {
                    //success -> enable search
                    setTwitterStatus(TwitterStatus.signedIn)
                }) 
                .catch(() => {
                    setTokenVerifyStatus(TokenVerify.fail)
                });
        }
    });
    */
    

    /*
    ##################################
    ##################################
                GENERAL
    ##################################
    ##################################
    */

    //send error notification to setup
    const showErrNot = (msg: string) => {
        log(msg)
        props.newNotification('Error: ' + msg, Not.Type.Error)
    }

    const showWarNot = (msg: string) => {
        log(msg)
        props.newNotification('Warning: ' + msg, Not.Type.Warning)
    }

    //ACTIONS EXCEEDED
    const actionsExceeded = () => {
        if (didUserExceedLimit(actionTimestamps, 20, 30000)) {
            //actions exceeded
            props.newNotification('easy boy... small cooldown - too many actions', Not.Type.Warning)
            return true
        }
        //not exceeded -> add timestamp
        actionTimestamps.push(new Date().toISOString())
        return false
    }

    /*
    ##################################
    ##################################
            Search Users
    ##################################
    ##################################
    */


    const onSearchButtonClick = (type: RequestType) => {

        if (actionsExceeded()) {
            return
        }

        //dont fire mutiple requests
        if (loading) {
            showWarNot('already loading')
            return
        }

        //check if search string is provided
        if (!searchEnabled && RequestType.inital) {
            showErrNot('no input string')
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
            showErrNot('not all query parameters given')
            return
        }

        //start request
        setLoading(true)
        getUsers(qString, newPage)
            .then(res => {
                if (res.status !== 200) {
                    //error
                    showErrNot(res.message)
                    if (res.status === 44) {
                        //-> no more users to show
                        showWarNot('no more users available')
                    }
                }
                else {
                    //success
                    log('successfully got data for "' + qString + '" at page ' + newPage)

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
                showErrNot('critical system error occured, check console')
                log(err)
                setLoading(false)
            });
    }


    const getUsers = async (name: string, page: number) => {

        let accessToken = localStorage.getItem(LocalStorage.Access_Token)
        let accessToken_Secret = localStorage.getItem(LocalStorage.Access_Token_Secret)
        if (accessToken === null) {
            accessToken = ""
        }
        if (accessToken_Secret === null) {
            accessToken_Secret = ""
        }

        //passing additional parameters in header
        var requestOptions = {
            headers: {
                'q': name,
                'page': page.toString(),
                'token': accessToken,
                'token_secret': accessToken_Secret
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

    /*
    const onSignInButtonClicked = async () => {

        //alredy requested
        if (tokenStatus === TokenStatus.requested) {
            return
        }

        log('trying to sign in')
        setTokenStatus(TokenStatus.requested)

        //userAuth
        let request = new Request('/api/twitter/request_token')
        const response = await fetch(request)
        const body = await response.json()
        if (body.status !== 200) {
            showErrNot(body.message) //maybe not body.message 
            setTokenStatus(TokenStatus.error)
        }
        else {
            log(body)
            //"oauth_token=i-7ofAAAAAABLx8pAAABd86SI80&
            //oauth_token_secret=IvoJA3G2XzQ41c9IlfgZb8HHQY8Vw6Rq&oauth_callback_confirmed=true"
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

    const verifyCredentials = async (accessToken: string, accessToken_Secret: string) => {
        //passing additional parameters in header
        var requestOptions = {
            headers: {
                'token': accessToken,
                'token_secret': accessToken_Secret
            }
        };
        let request = new Request('/api/twitter/verify_token', requestOptions)

        const response = await fetch(request)
        const body = await response.json()
        if (body.status !== 200) {
            showErrNot(body.message) 
            setTokenVerifyStatus(TokenVerify.fail)
            throw new Error(body)
        }
        else {
            log('valid token & secret')
            setTokenVerifyStatus(TokenVerify.success)
            return "200";
        }
    };
    */



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


    /*
    ##################################
    ##################################
            CONTENT
    ##################################
    ##################################
    */
    const getLoginComponent = () => {
        /*
            conditions like 'joinType' have to be passed to the Search component in order to avoid
            errors in parent component like:
            -> "React has detected a change in the order of Hooks"
            -> "Uncaught Invariant Violation: Rendered more hooks than during the previous render"
            https://reactjs.org/docs/hooks-rules.html
        */
        let rtn = <div></div>

        return rtn

        /*
        if (twitterStatus === TwitterStatus.none) {
            //NOT SIGNED IN
            rtn = 
            <div className={st.Login_Con}>
                <div className={st.Button_Con} title="Sign into your twitter to play your followed profiles">
                    <img className={st.Icon} 
                        src={TwitterIcon} 
                        alt="Sign into Twitter" 
                        onClick={() => onSignInButtonClicked()}/>
                    <button className={st.Search} 
                            onClick={() => onSignInButtonClicked()}>
                                Sign in
                    </button>
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
                    {(tokenVerifyStatus === TokenVerify.fail) &&
                        <div>
                            Previously used user-credentials could not be verified, please sign in again.
                        </div>
                    }
                </div>
            </div>
        }
        else if (twitterStatus === TwitterStatus.tokenReceived) {
            //FIRST TOKEN RECEIVED
            rtn = 
                <Redirect to={redirectURL}/>
        }
        else if (twitterStatus === TwitterStatus.signedIn) {
            //SIGNED IN
            rtn = 
            <div className={st.Login_Con}>
                You are signed in with your twitter user!
            </div>
        }
        return rtn
        */
    }

    return (
        <div className={st.Con}>
            {getLoginComponent()}
            <div className={st.Search_Con}>
                <div className={st.Top_Con}>
                    <input  className={st.Input} 
                            type="search" 
                            autoComplete="off" 
                            placeholder="Search for Twitter username..."
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
                {userObjects.length === 0 &&
                    <div className={st.Empty_Con}>
                        <div className={st.Empty_Caption}>
                            Search for public Twitter profiles and add them by clicking the card.
                        </div>
                        <img className={st.Empty_Icon} 
                            src={TwitterIconBlack} 
                            alt="Twitter"
                        />
                    </div>
                }
                {userObjects.length !== 0  && 
                    <div className={st.List_Con}>
                        <TwitterProfileList
                            parentType={ProfilesUsage.Search}
                            data={userObjects}
                            addedUsers={props.profiles}
                            onAddUser={props.addProfile}
                            onRemoveUser={() => {}}
                            twitterStatus = {twitterStatus}
                        />
                        {(userObjects.length % 20 === 0) && 
                            <div className={st.More_Con}>
                                <button className={st.More} 
                                        onClick={(e) => onSearchButtonClick(RequestType.more)}>
                                    Show more...
                                </button>
                                {loading && //"more" loading
                                    <div className={st.Loading_Con}>
                                        <CircularProgress/>
                                    </div>
                                }
                            </div>
                        }
                    </div>
                }
                {loading && userObjects.length === 0 && //"inital" loading
                <div className={st.Loading_Con}>
                    <CircularProgress/>
                </div>
                }
            </div>
        </div>
    );
}



/*






*/

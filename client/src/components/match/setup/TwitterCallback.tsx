import React, { useEffect, useRef, useReducer } from 'react';
import  { Redirect } from 'react-router-dom'

import {LocalStorage} from 'components/Interfaces'
import CircularProgress from '@material-ui/core/CircularProgress';

enum CallbackStatus {
    denied,
    wrongToken,
    loading,
    apiReject,
    error,
    success
}

export default function TwitterCallback() {

    //save the received data
    const ref_status = useRef(CallbackStatus.loading)
    const ref_token = useRef("")
    const ref_token_verifier = useRef("")
    const [,forceUpdate] = useReducer(x => x + 1, 0);

    let url: string = window.location.href
    //DENIED URL
    //http://localhost:3000/match/setup/twittercallback?denied=rFIEpwAAAAABLx8pAAABd882fZI

    //GRANTED URL
    //http://localhost:3000/match/setup/twittercallback?oauth_token=MGYutQAAAAABLx8pAAABd88jKaY&oauth_verifier=cPiRpAJenYTBqTx8iP3q9RRWxmmDjQlH

    const setStatus = (status:CallbackStatus) => {
        if (ref_status.current !== status) {
            //new received -> update -> prevent infinite loop
            ref_status.current = status
            forceUpdate()
        }
    }

    useEffect(() => {

        //user denied access
        if (url.match('denied')) {
            setStatus(CallbackStatus.denied)
            return
        }

        //extract token
        let search = "="
        let start = url.indexOf(search) + search.length;
        let end = url.indexOf('&');
        ref_token.current = url.substring(start, end)

        //compare received token here with received token from step 1
        if (localStorage.getItem(LocalStorage.Token) !== ref_token.current) {
            setStatus(CallbackStatus.wrongToken)
            return
        }

        //extract token_verifier
        search = "verifier="
        start = url.indexOf(search) + search.length;
        ref_token_verifier.current = url.substring(start)

        if (ref_token.current.length === 0 || ref_token_verifier.current.length === 0) {
            console.log('either no token or no verifier received')
            setStatus(CallbackStatus.error)
            return
        }

        /*
            only call api when not sucessful, avoid:
            React useEffect causing: Can't perform a React state update on an unmounted component
            -> request will not end up in nowhere
        */
        if (ref_status.current !== CallbackStatus.success) {
            triggerAccessToken()
        }
    });

    //IT WILL ONLY WORK ONE TIME -> all other following requests will be rejected
    const triggerAccessToken = async () => {
        console.log(ref_token.current)
        console.log(ref_token_verifier.current)
        var requestOptions = {
            headers: {
                'token': ref_token.current,
                'token_verifier': ref_token_verifier.current
            }
        };
        let request = new Request('/api/twitter/access_token', requestOptions)
        const response = await fetch(request)
        const body = await response.json()
        if (body.status !== 200) {
            console.log('ERROR retrieving access token')
            console.log(body)
            setStatus(CallbackStatus.apiReject)
        }
        else {
            //success
            //{status: 200, body: "oauth_token=134...}"
            //-> "oauth_token=1349709202332246017-tunSbdudXTTaqjj9rBYqKeNbBapGpb&oauth_token_secret=z1Sabk1PMugVKpyY7B5ryNvoSKmyDs0f6GmIYdoEv15pi&user_id=1349709202332246017&screen_name=hannesschaletz1"
            console.log(body)
            let str:string = body.body

            //extract token
            let search = "="
            let start = str.indexOf(search) + search.length;
            let end = str.indexOf('&');
            let token = str.substring(start, end)
            localStorage.setItem(LocalStorage.Access_Token, token)

            //extract token_secret
            search = "oauth_token_secret="
            start = str.indexOf(search) + search.length;
            end = str.indexOf('&user_id');
            let tokenSecret = str.substring(start, end)
            localStorage.setItem(LocalStorage.Access_Token_Secret, tokenSecret)

            //set success
            sessionStorage.setItem(LocalStorage.TwitterLoginSuccess, '1')

            console.log('rerouting back to matchroom')
            setStatus(CallbackStatus.success)
        }
    }

    const render = () => {

        if (ref_status.current === CallbackStatus.loading) {
            return <CircularProgress/>
        }

        else if (ref_status.current === CallbackStatus.denied) {
            return <div>You have to grant access to continue</div> 
        }
        
        else if (ref_status.current === CallbackStatus.wrongToken) {
            return <div>Mismatch of retrieved token and saved token before login</div>
        }   

        else if (ref_status.current === CallbackStatus.apiReject) {
            return <div>The Twitter API rejected the call. Restart the process. Check the console</div>
        }   

        else if (ref_status.current === CallbackStatus.error) {
            return <div>Some error occured, please check the console</div>
        }   

        else if (ref_status.current === CallbackStatus.success) {
            let matchID = localStorage.getItem(LocalStorage.MatchID)
            if (matchID === null) {
                return <div>Could not get MatchID to redirect. Please go back to the lobby yourself.</div>
            }
            let redirectURL = '/match/setup/' + matchID
            return <Redirect to={redirectURL}/>
        }

        return <div></div>
    }

    return (
        <div>
            <div>This page is processing the twitter callback and will redirect you back to the matchroom</div>
            {render()}
        </div>
        
    );
}



/*






*/

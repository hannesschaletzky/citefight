import React, { useEffect, useRef } from 'react';

import {LocalStorage} from 'components/Interfaces'
import CircularProgress from '@material-ui/core/CircularProgress';

export default function TwitterCallback() {

    //save the received data
    const ref_token = useRef("")
    const ref_token_verifier = useRef("")

    let url: string = window.location.href
    //DENIED URL
    //http://localhost:3000/match/setup/twittercallback?denied=rFIEpwAAAAABLx8pAAABd882fZI

    //GRANTED URL
    //http://localhost:3000/match/setup/twittercallback?oauth_token=MGYutQAAAAABLx8pAAABd88jKaY&oauth_verifier=cPiRpAJenYTBqTx8iP3q9RRWxmmDjQlH

    useEffect(() => {

        //extract token
        let start = url.indexOf('=') + 1;
        let end = url.indexOf('&');
        ref_token.current = url.substring(start, end)

        //extract token_verifier
        start = url.indexOf('verifier=') + 9;
        ref_token_verifier.current = url.substring(start)

        triggerAccessToken()
    });

    //THIS CALL WILL ONLY WORK ONE TIME!
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
        }
        else {
            console.log(body)
        }
    }

    const render = () => {

        //user denied access
        if (url.match('denied')) {
            return <div>You have to grant access to continue</div>
        }

        //compare received token here with received token from step 1
        if (localStorage.getItem(LocalStorage.Token) !== ref_token.current) {
            return <div>Mismatch of retrieved token and saved token before login</div>
        }   

        //<CircularProgress/>
        let content = <div></div>
        content = 
            <div>
                <div>This page is processing the twitter callback token</div>
                <div>{localStorage.getItem(LocalStorage.Token)}</div>
                <div>{localStorage.getItem(LocalStorage.Token_Secret)}</div>
                <div>{localStorage.getItem(LocalStorage.MatchID)}</div>
            </div>

        return content
    }

    return (
        render()
    );
}



/*






*/

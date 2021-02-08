import React, { useState, useEffect } from 'react';
import st from './Search.module.scss'

import CircularProgress from '@material-ui/core/CircularProgress';
import {Twitter_User} from 'components/Interfaces'
import TwitterIcon from 'assets/footer/Twitter_Icon.png'

import SearchList from './SearchList'

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

                    //if user clicks mutiple times on more but no input string entered
                    if (searchInput.length === 0) {
                        setLastSearchString(lastSearchString)
                    }
                    else {
                        setLastSearchString(searchInput)
                    }

                    //save new user objects
                     //internal
                    let _userObjects = userObjects //get state array
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
        let request = new Request('/api/users', requestOptions)

        const response = await fetch(request);
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        
        return body;
    };


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
                <SearchList data={userObjects}/>
            </div>
            <div className={st.buttonMore_Con}>
                {(userObjects.length % 20 === 0) && (userObjects.length !== 0) && <button className={st.buttonMore} onClick={e => onSearchButtonClick(RequestType.more)}>Show more...</button>}
            </div>
            <div className={st.loading_Con}>
                {loading && <CircularProgress/>}
            </div>
        </div>
    </div>
  );
}





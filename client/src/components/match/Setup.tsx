//import React, { Component } from 'react';

import React, { useState, useEffect } from 'react';
//import { useParams } from 'react-router-dom';
import st from './Setup.module.scss'

import CircularProgress from '@material-ui/core/CircularProgress';
import {Twitter_User} from 'components/Interfaces'

const stateInitArray:Twitter_User[] = []
const stateUserCardsInit = [<div key="init"></div>]

export default function Match_Setup() {
    //state hook
    const [response, setResponse] = useState("");
    const [page, setPage] = useState(1);
    const [userObjects, setUserObjects] = useState(stateInitArray);
    const [userCards, setUserCards] = useState(stateUserCardsInit);
    //const [post, setPost] = useState("");
    //const [responseToPost, setresponseToPost] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [loading, setLoading] = useState(false);
    //params hook
    //const { id } = useParams<Record<string, string | undefined>>()

    enum RequestType {
        inital,
        more
    }

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        /*
        callApi()
        .then(res => setResponse(res.data.length))
        .catch(err => console.log(err));
        */
    });


    const onSearchButtonClick = (type: RequestType) => {

        //dont fire mutiple requests
        if (loading) {
            console.log('already loading')
            return
        }

        //check if user loads more users or searches for new
        let newPage = page
        if (type === RequestType.inital) {
            setPage(1)
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
            newPage++
            setPage(newPage)
        }

        //start request
        setLoading(true)
        getUsers(searchInput, newPage)
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
                    parseReponse(res.data)
                    setResponse(res.data.length) //can be removed
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
                protected: item.protected,
                followers_count: item.followers_count,
                verified: item.verified,
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
            let userCard = 
                <div className={st.userCard_Con} key={user.screen_name}>
                    {user.name}
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
        BUTTON HANDLERS
    */
    const userNameChanged = (name: string) => {
        setSearchInput(name)

        if (name.length === 0 || !name.trim()) {
            setButtonDisabled(true)
        }
        else {
            setButtonDisabled(false)
        }
    }

    const keyPressed = (event: any) => {
        if (!buttonDisabled) {
            if (event.key === 'Enter') {
                onSearchButtonClick(RequestType.inital)
            }
        }
    }

  return (
    <div >
        <div className={st.Search_Con}>
            Search for users here
            <input type="search" autoComplete="off" onChange={e => userNameChanged(e.target.value)} onKeyPress={e => keyPressed(e)}/>
            <button className={st.searchButton} disabled={buttonDisabled} onClick={e => onSearchButtonClick(RequestType.inital)}>Search</button>
            {loading && <CircularProgress/>}
            <p>{response} users found {userCards.length}</p>
            <div className={st.userList_Con}>
                {userCards}
            </div>
            <div>
                {(userCards.length % 20 === 0) && (userCards.length !== 0) && <button className={st.button_moreUsers} onClick={e => onSearchButtonClick(RequestType.more)}>Show more...</button>}
            </div>
        </div>
    </div>
  );
}











/*


    <form onSubmit={handleSubmit}>
                <p>
                <strong>Post to Server from match with id: {id}</strong>
                </p>
                <input
                type="text"
                value={post}
                onChange={e => setPost(e.target.value)}
                />
                <button type="submit">Submit</button>
            </form>
            <p>{responseToPost}</p>


    const callApi = async () => {

        //passing additional parameters in header
        var requestOptions = {
            headers: {'q': 'Götze123'}
        };
        let request = new Request('/api/users', requestOptions)

        const response = await fetch(request);
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        
        return body;
    };
    */
  
    /*
    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const response = await fetch('/api/world', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post: {post} }),
        });
        const body = await response.text();
        
        setresponseToPost(body)
    };
    */













/*
class Matchroom_Setup extends Component <any, any> {

    id = useParams<Record<string, string | undefined>>()

    constructor(props: any) {
        super(props);
        this.state = {
            response: '',
            post: '',
            responseToPost: '',
        };
    }

    componentDidMount() {
        this.callApi()
        .then(res => this.setState({ response: res.data.length }))
        .catch(err => console.log(err));
    }
  
    callApi = async () => {
        const response = await fetch('/api/users');
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        
        return body;
    };
  
    handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        const response = await fetch('/api/world', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post: this.state.post }),
        });
        const body = await response.text();
        
        this.setState({ responseToPost: body });
    };
    
    render() { 
        return (  
            <div >
                <div className={st.App}>
                <p>{this.state.response}</p>
                <form onSubmit={this.handleSubmit}>
                    <p>
                    <strong>Post to Server:</strong>
                    </p>
                    <input
                    type="text"
                    value={this.state.post}
                    onChange={e => this.setState({ post: e.target.value })}
                    />
                    <button type="submit">Submit</button>
                </form>
                <p>{this.state.responseToPost}</p>
                </div>
            </div>
        );
    }

}
export default Matchroom_Setup;

*/

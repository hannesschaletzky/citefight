//import React, { Component } from 'react';

import React, { useState, useEffect } from 'react';
//import { useParams } from 'react-router-dom';
import st from './Setup.module.scss'

import CircularProgress from '@material-ui/core/CircularProgress';
import {Twitter_User} from 'components/Interfaces'

//const stateInitArray:Twitter_User[] = []
const stateUIInitArray = [<div key="init"></div>]

export default function Match_Setup() {
    //state hook
    const [response, setResponse] = useState("");
    const [userCards, setUserCards] = useState(stateUIInitArray);
    //const [post, setPost] = useState("");
    //const [responseToPost, setresponseToPost] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [loading, setLoading] = useState(false);
    //params hook
    //const { id } = useParams<Record<string, string | undefined>>()

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        /*
        callApi()
        .then(res => setResponse(res.data.length))
        .catch(err => console.log(err));
        */
    });

    const userNameChanged = (name: string) => {
        setSearchInput(name)

        if (name.length === 0) {
            setButtonDisabled(true)
        }
        else {
            setButtonDisabled(false)
        }
    }

    const onSearchButtonClick = () => {

        //dont fire mutiple requests
        if (loading) {
            console.log('already loading')
            return
        }

        //start request
        setLoading(true)
        getUsers(searchInput)
            .then(res => {
                parseReponse(res.data)
                setResponse(res.data.length) //can be removed
                setLoading(false)
            }) 
            .catch(err => {
                setLoading(false)
                console.log(err)
            });
    }

    const getUsers = async (name: string) => {
        //passing additional parameters in header
        var requestOptions = {
            headers: {
                'q': name
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
            parsedUsers.push(newUser)
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

        setUserCards(cards)
    }

    const keyPressed = (event: any) => {
        if (event.key === 'Enter') {
            onSearchButtonClick()
        }
    }

  return (
    <div >
        <div className={st.Search_Con}>
            Search for users here
            <input type="search" autoComplete="off" onChange={e => userNameChanged(e.target.value)} onKeyPress={e => keyPressed(e)}/>
            <button className={st.searchButton} disabled={buttonDisabled} onClick={onSearchButtonClick}>Search</button>
            {loading && <CircularProgress/>}
            <p>{response} users found</p>
            <div className={st.userList_Con}>
                {userCards}
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

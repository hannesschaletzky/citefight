//import React, { Component } from 'react';

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import st from './Setup.module.scss'


export default function Match_Setup() {
    //state hook
    const [response, setResponse] = useState("");
    const [post, setPost] = useState("");
    const [responseToPost, setresponseToPost] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [buttonDisabled, setButtonDisabled] = useState(true);
    //params hook
    const { id } = useParams<Record<string, string | undefined>>()

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        callApi()
        .then(res => setResponse(res.data.length))
        .catch(err => console.log(err));
    });

    const callApi = async () => {

        //passing additional parameters in header
        var requestOptions = {
            headers: {'testkey': 'TESTPASSEDVARIABLE'}
        };
        let request = new Request('/api/users', requestOptions)

        const response = await fetch(request);
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        
        return body;
    };
  
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


    const userNameChanged = (name: string) => {
        setSearchInput(name)

        if (name.length === 0) {
            setButtonDisabled(true)
        }
        else {
            setButtonDisabled(false)
        }
    }

    const findUser = () => {
        alert(searchInput)

        //start loading symbol
        //call async function
    }

    const getUsersForInput = async (input: string) => {
        const response = await fetch('/api/users');
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        
        return body;
    };

  return (
    <div >
        <div className={st.Search_Con}>
            Search for users here
            <input type="search" autoComplete="off" onChange={e => userNameChanged(e.target.value)}/>
            <button className={st.searchButton} disabled={buttonDisabled} onClick={findUser}>Search</button>
        </div>

        <div className={st.App}>
            <p>{response}</p>
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
        </div>
    </div>
  );
}














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

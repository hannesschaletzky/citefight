import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import st from './NotFound.module.scss'


class NotFound extends Component {

    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    render() { 
        return ( 
            <div>
                <h1>404 - Not Found!</h1>
                <Link to="/">
                    Go Home
                </Link>
            </div>
        );
    }

}
export default NotFound;





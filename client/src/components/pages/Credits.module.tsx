import React, { Component } from 'react';
import st from './Credits.module.scss'

class Credits extends Component {

    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    render() { 
        return (  
            <div>
                Navigation Icons by 
                <a href="https://freeicons.io/profile/714" target="_blank" rel="noreferrer">Raj Dev</a> 
                 on 
                <a href="https://freeicons.io" target="_blank" rel="noreferrer">freeicons.io</a>
            </div>
            
            
        );
    }

}
export default Credits;





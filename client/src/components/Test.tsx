import React, { Component } from 'react';

class Test extends Component {
    
    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    render() { 
        return (  
            <div className="App">Test Component! + apikey:{process.env.REACT_APP_TWITTER_API_Key}</div>
        );
    }

}
export default Test;





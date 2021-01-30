import React, { Component } from 'react';

class Test extends Component {
    
    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    render() { 
        return (  
            <div className="App">Test Component! + envvar:{process.env.REACT_APP_TEST_VAR}</div>
        );
    }

}
export default Test;





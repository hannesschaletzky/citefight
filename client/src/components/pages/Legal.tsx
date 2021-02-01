import React, { Component } from 'react';
import st from './Legal.module.scss'

class Legal extends Component {

    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    render() { 
        return ( 
            <div className={st.Legal_Container}>
                <div>Legal</div>
            </div> 
            
        );
    }

}
export default Legal;





import React, { Component } from 'react';
import st from './Header.module.scss'

class Root_Header extends Component {

    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    render() { 
        return (  
            <div>
                <div className={st.Headline_Container}>
                    <a className={st.Headline} href="/start">citefight</a>
                </div>
            </div>
        );
    }

}
export default Root_Header;





import React, { Component } from 'react'
import st from './Footer.module.scss'

import twitterIcon from '../../assets/footer/Twitter_Icon.png'
import GithubIcon from '../../assets/footer/GitHub_Icon.png'
import Back4AppIcon from '../../assets/footer/Back4App_Icon.png'
import VSCodeIcon from '../../assets/footer/VSCode_Icon.png'
import PostmanIcon from '../../assets/footer/Postman_Icon.png'

class Root_Footer extends Component {

    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    render() { 
        return (  
            <div>
                <div className={st.Icon_Container}>
                    <a className={st.Icon} href="https://www.twitter.com/" target="_blank" rel="noreferrer">
                        <img src={twitterIcon} alt="Twitter" width="22" height="22"/>
                    </a>
                    <a className={st.Icon} href="https://github.com/" target="_blank" rel="noreferrer">
                        <img src={GithubIcon} alt="Github" width="20" height="20"/>
                    </a>
                    <a className={st.Icon}  href="https://back4app.com/" target="_blank" rel="noreferrer">
                        <img src={Back4AppIcon} alt="Back4App" width="20" height="20"/>
                    </a>
                    <a className={st.Icon}  href="https://code.visualstudio.com/" target="_blank" rel="noreferrer">
                        <img src={VSCodeIcon} alt="VSCode" width="20" height="20"/>
                    </a>
                    <a className={st.Icon}  href="https://www.postman.com/" target="_blank" rel="noreferrer">
                        <img src={PostmanIcon} alt="Postman" width="20" height="20"/>
                    </a>
                </div>
                <div className={st.Link_Container}>
                    <a className={st.Link} href="/legal">Legal</a>
                    <a className={st.Link} href="/about">About</a>
                    <a className={st.Link} href="/donate">Donate</a>
                    <a className={st.Link} href="/credits">Credits</a>
                </div>
            </div>
        );
    }

}
export default Root_Footer;





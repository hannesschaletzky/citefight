import React, { Component } from 'react';
import st from './Images.module.scss'

import {Tweet_Content} from 'components/Interfaces'

class Images extends Component <any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    tweet: Tweet_Content = this.props.data //assign to object type for safety

    test() {
        console.log("Hovered with mouse over picture")
    }

    render() { 

        //count how many photos have been passed 
        let photoCount = 0
        if (this.tweet.photo1 !== '') {
            photoCount++
        }
        if (this.tweet.photo2 !== '') {
            photoCount++
        }
        if (this.tweet.photo3 !== '') {
            photoCount++
        }
        if (this.tweet.photo4 !== '') {
            photoCount++
        }


        //depending of amount of pictures, return correct div -> include and display images
        let pictures;
        let className = st.Images_Con
        if (photoCount === 1) {
            pictures =  
                <div className={className}>
                    <a href={this.tweet.photo1} target="_blank" rel="noreferrer"> 
                        <img onMouseOver={() => this.test()} className={st.One} src={this.tweet.photo1} alt=""/>
                    </a>
                </div>
        }
        else if (photoCount === 2) {
            pictures =  
                <div className={className}>
                    <div className={st.Two_Con}>
                        <div className={st.Two_Left_Con}>
                            <a href={this.tweet.photo1} target="_blank" rel="noreferrer"> 
                                <img className={st.Two_Left} src={this.tweet.photo1} alt=""/>
                            </a>
                        </div>
                        <div className={st.Two_Right_Con}>
                            <a href={this.tweet.photo2} target="_blank" rel="noreferrer"> 
                                <img className={st.Two_Right} src={this.tweet.photo2} alt=""/>
                            </a>
                        </div>
                    </div>
                </div>
        }
        else if (photoCount === 3) {
            pictures =  
                <div className={className}>
                    <div className={st.Three_Con}>
                        <div className={st.Three_Left_Con}>
                            <a href={this.tweet.photo1} target="_blank" rel="noreferrer"> 
                                <img className={st.Three_Left} src={this.tweet.photo1} alt=""/>
                            </a>
                        </div>
                        <div className={st.Three_Right_Con}>
                            <a href={this.tweet.photo2} target="_blank" rel="noreferrer"> 
                                <img className={st.Three_Right_Top} src={this.tweet.photo2} alt=""/>
                            </a>
                            <a href={this.tweet.photo3} target="_blank" rel="noreferrer"> 
                                <img className={st.Three_Right_Bottom} src={this.tweet.photo3} alt=""/>
                            </a>
                        </div>
                    </div>
                </div>
        }
        else if (photoCount === 4) {
            pictures =  
                <div className={className}>
                    <div className={st.Four_Con}>
                        <div className={st.Four_Left_Con}>
                            <a href={this.tweet.photo1} target="_blank" rel="noreferrer"> 
                                <img onMouseOver={() => this.test()} className={st.Four_Left_Top} src={this.tweet.photo1} alt=""/>
                            </a>
                            <a href={this.tweet.photo2} target="_blank" rel="noreferrer"> 
                                <img className={st.Four_Left_Bottom} src={this.tweet.photo2} alt=""/>
                            </a>
                        </div>
                        <div className={st.Four_Right_Con}>
                            <a href={this.tweet.photo3} target="_blank" rel="noreferrer"> 
                                <img className={st.Four_Right_Top} src={this.tweet.photo3} alt=""/>
                            </a>
                            <a href={this.tweet.photo4} target="_blank" rel="noreferrer"> 
                                <img className={st.Four_Right_Bottom} src={this.tweet.photo4} alt=""/>
                            </a>
                        </div>
                    </div>
                </div>
        }
        else {
            pictures = <div></div>
        }

        return (  
            <div>
                {pictures}
            </div>
        );
    }
}

export default Images;

















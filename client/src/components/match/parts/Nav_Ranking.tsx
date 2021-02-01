import React, { Component } from 'react';
import st from './Nav_Ranking.module.scss'

//import Ranking from '../../../assets/nav/Ranking.png'
import Clock from 'assets/nav/Clock.png'
import Tick from 'assets/nav/Tick.png'

import {Ranking_User} from 'components/Interfaces';

class Nav_Ranking extends Component <any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
            currentCon: ''
        };
    }

    render() { 

        //get count of objects passed
        let count = Object.keys(this.props.data).length 
        var sortedRanking:Ranking_User[]=[];

        //loop array & sort
        for(let i=0;i<count;i++){
            //get item
            let key = Object.keys(this.props.data)[i];
            let item:Ranking_User = this.props.data[key]

            //insert into sorted array
            insertIntoArray(item)
        }

        /*
            User with most points first, if even points, user with less time first 
        */
        function insertIntoArray(inputItem: Ranking_User) {

            //insert first item
            if (sortedRanking.length === 0) {
                sortedRanking.push(inputItem)
            }
            //determine position
            else {
                
                //new last place
                if (inputItem.points < sortedRanking[0].points) {
                    sortedRanking.splice(0, 0, inputItem)
                    return
                }

                //new first place
                if (inputItem.points > sortedRanking[sortedRanking.length-1].points) {
                    sortedRanking.push(inputItem)
                    return
                }

                //determine in between position -> value between these two indexes
                let topIndex = -1
                let bottomIndex = -1
                
                //loop from bottom to top until input points are lower
                for(let i=0;i<sortedRanking.length;i++) {
                    let item = sortedRanking[i] 
                    if (inputItem.points < item.points) {
                        topIndex=i
                        break
                    }
                }

                //loop from top to bottom until input points are higher
                for(let i=sortedRanking.length-1;i>=0;i--) {
                    let item = sortedRanking[i]
                    if (inputItem.points > item.points) {
                        bottomIndex=i
                        break
                    }
                }

                //no same value exists
                if ((topIndex - bottomIndex) === 1) {
                    sortedRanking.splice(topIndex, 0, inputItem)
                    return
                }
                //same values exist OR value has same score than top -> sort time
                else if ((topIndex - bottomIndex) > 1 || (topIndex  === -1)){

                    //worst time
                    if (inputItem.totalTime > sortedRanking[bottomIndex + 1].totalTime) {
                        sortedRanking.splice(bottomIndex + 1, 0, inputItem)
                        return
                    }

                    //best time
                    if (topIndex === -1) {
                        //-> very top of the table
                        topIndex = sortedRanking.length
                    }
                    if (inputItem.totalTime < sortedRanking[(topIndex - 1)].totalTime) {
                        sortedRanking.splice(topIndex, 0, inputItem) 
                        return
                    }

                    let timeTopIndex = -1
                    let timeBottomIndex = -1

                    //loop from bottom to top until input totalTime is lower
                    for(let i=bottomIndex+1;i<topIndex;i++) {
                        let item = sortedRanking[i] 
                        if (inputItem.totalTime > item.totalTime) {
                            timeTopIndex=i
                            break
                        }
                    }

                    //loop from top to bottom until input totalTime is higher
                    for(let i=topIndex-1;i>bottomIndex;i--) {
                        let item = sortedRanking[i]
                        if (inputItem.totalTime < item.totalTime) {
                            timeBottomIndex=i
                            break
                        }
                    }

                    //no same value exists
                    if ((timeTopIndex - timeBottomIndex) === 1) {
                        sortedRanking.splice(timeTopIndex, 0, inputItem)
                        return
                    }
                    //same values exist 
                    //-> PLAYER ARE CURRENTLY SET AFTER EACH OTHER IF POINTS AND TIME ARE EQUAL
                    else if ((timeTopIndex - timeBottomIndex) > 1){
                        sortedRanking.splice(timeTopIndex, 0, inputItem) 
                        return
                    }
                }

            }
        }

        //add every user as new div, start with top index of array
        let rankingToDisplay=[]
        let placeCounter = 1
        for (let i=sortedRanking.length-1;i>=0;i--) {

            //get item
            let item:Ranking_User = sortedRanking[i]

            //read values
            let name = item.name
            let points = item.points
            let totalTime = item.totalTime

            rankingToDisplay.push(
                <div className={st.User_Con}>
                    <div className={st.Place}>
                        {placeCounter}.
                    </div>
                    <div className={st.Name}>
                        {name}
                    </div>
                    <div className={st.Points}>
                        {points}
                    </div>
                    <div className={st.TotalTime}>
                        {totalTime}
                    </div>
                </div>
            )

            placeCounter++
        }

        return (  
            <div className={st.Con}>
                <div className={st.Headline_Con}>
                    <div className={st.Headline_Place}>

                    </div>
                    <div className={st.Headline_Name}>
                        
                    </div>
                    <div className={st.Headline_Points}>
                        <img className={st.Icon} src={Tick} alt="Correct" title="Correct answers"/>
                    </div>
                    <div className={st.Headline_TotalTime}>
                        <img className={st.Icon} src={Clock} alt="Time" title="Total time"/>
                    </div>
                </div>
                {rankingToDisplay}
            </div>
        );
    }

}
export default Nav_Ranking;




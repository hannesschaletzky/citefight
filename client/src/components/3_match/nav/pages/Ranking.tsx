import React from 'react'
import st from './Ranking.module.scss'
//functional-interface
import {RankingProps} from 'components/Functional_Interfaces'
import {Matrix, Point} from 'components/Interfaces'
//interfaces
import * as Sorting from './Sorting'

export default function Ranking(props:RankingProps) {
    
    const getCards = () => {

        //let matrix = props.matrix


        //MOCK MATRIX
        let matrix:Matrix = {}
        function gP(goal:string, answer: string, timeMS:number):Point {
            let p:Point = {
                goal: goal,        
                answer: answer,     
                correct: goal === answer,   
                timeMS: timeMS,      
                ready: false
            }
            return p
        }

        /*
            Tor     5       4500
            Bea     5       5000
            Tom     5       6000
            Gabi    4       5000
            Tobi    3       2500
            Mod     2       5000
            Franz   2       8000
            Vera    0       9000

        */

        matrix["ModDWADWADWADWADWADAWDWADWADWADWA"] = [
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', '____', 1000),
            gP('GOAL', '____', 1000),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', '____', 1000),
        ]
        matrix["Bea"] = [
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 1000),
        ]
        matrix["Gabi"] = [
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', '____', 1000),
        ]
        matrix["Vera"] = [
            gP('GOAL', '____', 1000),
            gP('GOAL', '____', 1000),
            gP('GOAL', '____', 1000),
            gP('GOAL', '____', 1000),
            gP('GOAL', '____', 1000),
        ]
        matrix["Franz"] = [
            gP('GOAL', 'GOAL', 4000),
            gP('GOAL', '____', 1000),
            gP('GOAL', '____', 1000),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', '____', 1000),
        ]
        matrix["Tom"] = [
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 2000),
        ]
        matrix["Tobi"] = [
            gP('GOAL', 'GOAL', 500),
            gP('GOAL', 'GOAL', 500),
            gP('GOAL', 'GOAL', 500),
            gP('GOAL', '____', 500),
            gP('GOAL', '____', 500),
        ]
        matrix["Tor"] = [
            gP('GOAL', 'GOAL', 500),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 1000),
        ]
        matrix["Tor22"] = [
            gP('GOAL', 'GOAL', 500),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 1000),
        ]
        matrix["Tor34213"] = [
            gP('GOAL', 'GOAL', 500),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 4000),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 1000),
        ]
        matrix["gangstat1123"] = [
            gP('GOAL', 'GOAL', 500),
            gP('GOAL', 'GOAL', 1000),
            gP('GOAL', 'GOAL', 4000),
            gP('GOAL', '____', 1000),
            gP('GOAL', 'GOAL', 1000),
        ]
        matrix["gangstat1337"] = [
            gP('GOAL', 'GOAL', 500),
            gP('GOAL', 'GOAL', 100),
            gP('GOAL', 'GOAL', 400),
            gP('GOAL', 'GOAL', 500),
            gP('GOAL', 'GOAL', 1000),
        ]
        //MOCK END

        const keys = Object.keys(matrix)

        let cards = [<div key="_"></div>]
        cards = []

        let calcArr:Sorting.User[] = []

        keys.forEach((player) => {

            //calc total points/time
            let correct = 0
            let timeMS = 0
            let arr = matrix[player]
            arr.forEach((point) => {
                if (point.correct) {correct++}
                timeMS += point.timeMS
            })

            //insert into sorted array
            let user:Sorting.User = {
                name: player,
                points: correct,
                time: timeMS
            }
            Sorting.insertIntoRanking(user, calcArr)
        })

        //create cards (-> loop backwards)
        for(let i=calcArr.length-1;i>=0;i--) {
            let user = calcArr[i]
            cards.push(
                <div className={st.Card_Con} key={user.name}>
                    <div className={st.Name}>{user.name}</div>
                    <div className={st.Points}>{user.points}</div>
                    <div className={st.Time}>{user.time}</div>
                </div>
            )
        }

        return cards
    }


    return (
        <div className={st.Con}>
            <div className={st.Headline_Con}>
                👍
                ⏱️
            </div>
            <div className={st.Cards_Con}>
                {getCards()}
            </div>
        </div>
    );
}








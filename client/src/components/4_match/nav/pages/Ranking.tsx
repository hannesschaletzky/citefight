import React from 'react'
import st from './Ranking.module.scss'
//functional-interface
import {RankingProps} from 'components/Functional_Interfaces'
//import {Matrix, Point} from 'components/Interfaces'
//interfaces
import * as Sorting from './Ranking_Sorting'

export default function Ranking(props:RankingProps) {
    
    function round(value: number, precision: number) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
    }

    const getCards = () => {

        let matrix = props.matrix

        //MOCK MATRIX
        /*
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
        matrix["Bea1233"] = [
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
        matrix["Tobi123"] = [
            gP('GOAL', 'GOAL', 500),
            gP('GOAL', 'GOAL', 500),
            gP('GOAL', 'GOAL', 500),
            gP('GOAL', '____', 500),
            gP('GOAL', '____', 500),
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
        */
        

        const keys = Object.keys(matrix)

        let cards = [<div key="_"></div>]
        cards = []

        let calcArr:Sorting.User[] = []

        keys.forEach((player) => {

            //calc total points/time
            let correct = 0
            let timeMS = 0
            let arr = matrix[player]
            for(let i=0;i<arr.length;i++) {
                //check if max given round reached
                if (i === props.roundUntil) {break}
                //calc
                if (arr[i].correct) {correct++}
                timeMS += arr[i].timeMS
            }

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

            let status = <div className={st.Answer} title='No Action yet'>❓</div>
            let className = st.Card_Con

            //-> when round finished -> check ready & correct/false
            if (props.readyEnabled) {
                let point = matrix[user.name][props.roundUntil-1]
                //ready
                if (point.ready) {
                    className = st.Card_Con_Ready
                }
                //correct/false
                if (point.answer === '') {
                    status = <div className={st.Answer} title='No answer was given'>❓</div>
                }
                else {
                    const text = 'Solution: ' + point.goal + ', Answer: ' + point.answer
                    if (point.correct) {
                        status = <div className={st.Answer} title={text}>✅</div>
                    }
                    else {
                        status = <div className={st.Answer} title={text}>⭕</div>
                    }
                }
            }
            //-> during round -> check if answer was given
            else if (matrix[user.name][props.roundUntil].answer !== '') {
                status = <div className={st.Answer} title='Answer submitted'>✔️</div>
            }

            cards.push(
                <div className={className} key={user.name}>
                    {status}
                    <div className={props.userName === user.name ? st.Name_IsYou : st.Name} title={user.name}>{user.name}</div>
                    <div className={st.Points} title="Total correct answers">{user.points}</div>
                    <div className={st.Time} title={"Total time taken: " + user.time/1000}>{round(user.time/1000, 1)}s</div>
                </div>
            )
        }

        return cards
    }


    return (
        <div className={st.Con}>
            <div className={st.Headline_Con}>
                <div className={st.Headline_Answer} title='Correct Answer?'>❓</div>
                <div className={st.Headline_Name}></div>
                <div className={st.Headline_Points} title="Total correct answers">👍</div>
                <div className={st.Headline_Time} title="Total time taken">⏱️</div>
            </div>
            <div className={st.Cards_Con}>
                {getCards()}
            </div>
        </div>
    );
}








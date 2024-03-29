import {Matrix} from 'components/Interfaces'
import {round} from 'components/Logic'

export interface User {
    name: string
    points: number
    ratio: number
    time: number
}

export function getSortedArray(matrix:Matrix, roundUntil:number):User[] {
    const keys = Object.keys(matrix)
    let calcArr:User[] = []
    keys.forEach((player) => {

        //calc total points/time
        let correct = 0
        let timeMS = 0
        let answersCount = 0 
        let arr = matrix[player]
        for(let i=0;i<arr.length;i++) {
            //check if max given round reached
            if (i === roundUntil) {break}
            //calc measures
            if (arr[i].correct) {correct++}
            if (arr[i].answer !== '') {answersCount++}
            timeMS += arr[i].timeMS
        }

        //calc ratio
        let ratio = 0
        if (answersCount !== 0) {
            ratio = round((correct/answersCount)*100,0)
        }

        //insert into sorted array
        let user:User = {
            name: player,
            points: correct,
            ratio: ratio,
            time: timeMS
        }
        insertIntoRanking(user, calcArr)
    })
    //reverse array
    calcArr = calcArr.reverse()
    //return
    return calcArr
}


function insertIntoRanking(input: User, ranking:User[]) {

    //insert first item
    if (ranking.length === 0) {
        ranking.push(input)
    }
    //determine position
    else {
        
        //new last place
        if (input.points < ranking[0].points) {
            ranking.splice(0, 0, input)
            return
        }

        //new first place
        if (input.points > ranking[ranking.length-1].points) {
            ranking.push(input)
            return
        }

        //determine in between position -> value between these two indexes
        let topIndex = -1
        let bottomIndex = -1
        
        //loop from bottom to top until input points are lower
        for(let i=0;i<ranking.length;i++) {
            let item = ranking[i] 
            if (input.points < item.points) {
                topIndex=i
                break
            }
        }

        //loop from top to bottom until input points are higher
        for(let i=ranking.length-1;i>=0;i--) {
            let item = ranking[i]
            if (input.points > item.points) {
                bottomIndex=i
                break
            }
        }

        //no same value exists
        if ((topIndex - bottomIndex) === 1) {
            ranking.splice(topIndex, 0, input)
            return
        }
        //same values exist OR value has same score than top -> sort time
        else if ((topIndex - bottomIndex) > 1 || (topIndex  === -1)){

            //worst time
            if (input.time > ranking[bottomIndex + 1].time) {
                ranking.splice(bottomIndex + 1, 0, input)
                return
            }

            //best time
            if (topIndex === -1) {
                //-> very top of the table
                topIndex = ranking.length
            }
            if (input.time < ranking[(topIndex - 1)].time) {
                ranking.splice(topIndex, 0, input) 
                return
            }

            let timeTopIndex = -1
            let timeBottomIndex = -1

            //loop from bottom to top until input time is lower
            for(let i=bottomIndex+1;i<topIndex;i++) {
                let item = ranking[i] 
                if (input.time > item.time) {
                    timeTopIndex=i
                    break
                }
            }

            //loop from top to bottom until input time is higher
            for(let i=topIndex-1;i>bottomIndex;i--) {
                let item = ranking[i]
                if (input.time < item.time) {
                    timeBottomIndex=i
                    break
                }
            }

            //no same value exists
            if ((timeTopIndex - timeBottomIndex) === 1) {
                ranking.splice(timeTopIndex, 0, input)
                return
            }
            //same values exist 
            //-> PLAYER ARE CURRENTLY SET AFTER EACH OTHER IF POINTS AND TIME ARE EQUAL
            else if ((timeTopIndex - timeBottomIndex) > 1){
                ranking.splice(timeTopIndex, 0, input) 
                return
            }
            //custom for first round
            else if (timeTopIndex === -1 && timeBottomIndex === -1) {
                ranking.splice(bottomIndex, 0, input) 
            }
        }

    }
}
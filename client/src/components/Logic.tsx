export function didUserExceedLimit(timestamps:string[],actionCount:number, timeSpan: number = 15000):boolean {
    //if user wants to send more than 5 messages within 15 seconds -> return true
    //check only as soon as five messages were sent
    actionCount-- //index starts at 0
    let count = timestamps.length - 1
    if (count < actionCount) {
        return false
    }
    //calc time difference in milliseconds
    let ref = new Date(timestamps[count - actionCount])
    let now = new Date()
    let diff = now.getTime() - ref.getTime()
    if (diff < timeSpan) {
        return true
    }
    return false
}

//return the matchID if valid, invalid -> empty string
export function isValidMatchID(url:string):string | null {
    let matchID = url.substr(url.lastIndexOf('/') + 1)
    if (matchID.length === 0 || !(/^\d+$/.test(matchID))) {
        log('INVALID ID: ' + matchID)
        return null
    }
    return matchID
}

//countdown in seconds
export function setCountdown(diffS:number, diffMS:number, decrease:() => void, finished:() => void):NodeJS.Timeout[] {
    let timeouts:NodeJS.Timeout[] = [] 
    let timeout = 
        setTimeout(() => {
            decrease()
            finished()
        }, diffMS)
    timeouts.push(timeout)
    //intermediate calls
    let span = 1000
    while (diffS > 1) { //>1 -> skip last call
        timeout = 
            setTimeout(() => {
                decrease()
            }, span)
        span += 1000
        diffS -= 1
        timeouts.push(timeout)
    }
    return timeouts
}

export function getRandomInt(max:number) {
    return Math.floor(Math.random() * Math.floor(max))
}

export function round(value: number, precision: number) {
    var multiplier = Math.pow(10, precision || 0)
    return Math.round(value * multiplier) / multiplier
}

export function isDevEnv():boolean {
    if (process.env.NODE_ENV === 'development') {
        return true
    }
    return false
}

export function isProdEnv():boolean {
    if (process.env.NODE_ENV === 'production') {
        return true
    }
    return false
}


export function log(item:any):void {
    if (isDevEnv()) {
        console.log(item)
    }
}

export function logErr(item:any):void {
    console.log(item)
}

export function logObjectPretty(item:any):void {
    let str = JSON.stringify(item, null, 4)
    console.log(str)
}



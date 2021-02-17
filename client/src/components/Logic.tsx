




export function didUserExceedLimit(timestamps:string[],actionCount:number, timeSpan: number = 15000):boolean {
    //if user wants to send more than 5 messages within 15 seconds -> return true
    //check only as soon as five messages were sent
    actionCount--; //index starts at 0
    let count = timestamps.length - 1;
    if (count < actionCount) {
        return false
    }
    //calc time difference in milliseconds
    let ref = new Date(timestamps[count - actionCount])
    let now = new Date()
    let diff = now.getTime() - ref.getTime(); 
    if (diff < timeSpan) {
        return true
    }
    return false
}
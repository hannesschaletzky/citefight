import { Component } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

class TwitterRedirect extends Component <any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
        };
    }

    //immediately call parent rerouting function to reroute to twitter login page
    componentDidMount() {
        let current = window.location.href
        let token = current.substr(current.lastIndexOf('/') + 1);
        this.props.onRedirect(token)
    }

    render() { 
        return (  
            <div>
                You are being redirected to the twitter login now!
                <CircularProgress/>
            </div>
        );
    }

}
export default TwitterRedirect;




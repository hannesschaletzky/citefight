import React, { useState } from 'react';

import {SetupJoinStatus} from 'components/Interfaces'

export default function SearchTestComp(type: SetupJoinStatus) {
    const [page, setPage] = useState(1);

    const getCorrect = () => {
        let rtn = 
            <div >
                NOT JOINED
            </div>
        if (type === SetupJoinStatus.Joined) {
            rtn = 
                <div >
                    YOU ARE JOINED {page}
                </div>
        }
        return rtn
    }

    return (
        getCorrect()
    );
}





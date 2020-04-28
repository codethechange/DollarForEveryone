import React from 'react';
import { v4 as uuidv4 } from 'uuid';

const UID = 'uID'
const NODE_URL = ''
const CONTEXT='dollarforeveryone'

function Splash() {
    
    const uID: string = localStorage.getItem(UID) || uuidv4()
    if (uID !== localStorage.getItem(UID)) {
        localStorage.setItem(UID, uID)
    }

    return (
        <>
            {uID }
            <a href="brightid://link-verification/http:%2f%2ftest.brightid.org/DollarForEveryone/4902ea59-5f88-4a73-8aac-047684e479cf"> BrightID Deep Link</a>
        </>
    
    );
  }

export default Splash
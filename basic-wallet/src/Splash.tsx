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
            <a href="brightid://link-verification/http:%2f%2ftest.brightid.org/DollarForEveryone/95a13cc6-878b-4574-b91e-768216751d53"> BrightID Deep Link</a>
        </>
    
    );
  }

export default Splash
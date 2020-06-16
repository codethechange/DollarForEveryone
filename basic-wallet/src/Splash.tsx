import React from 'react';
import { v4 as uuidv4 } from 'uuid';

const UID = 'uID'

function Splash() {
    
    let uID: string = localStorage.getItem(UID) || uuidv4()
    if (uID !== localStorage.getItem(UID)) {
        localStorage.setItem(UID, uID)
    }
    uID = '95a13cc6-878b-4574-b91e-768216751d53'
    return (
        <>
            {uID}
            <a href={"brightid://link-verification/http:%2f%2fnode.brightid.org/DollarForEveryone/" + uID}> BrightID Deep Link</a>
        </>
    
    );
  }

export default Splash
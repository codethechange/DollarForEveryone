import React, { useState, useEffect } from 'react'

interface Props {
    accountAddress: string;
}

function NotVerified ({accountAddress}: Props) {
    // useEffect(() => {
    //     fetch(`/api/status/${accountAddress}`).then(res => res.json())
    //     .then(res => {
    //         if (res.status === "LINKED") {
    //             setStatus(Status.LINKED)
    //         } else if (res.status === "VERIFIED") {
    //             setStatus(Status.VERIFIED)
    //         }
    //     })
    // }, [accountAddress])

    return (
        <div className="text">
            <h2>You have not been verified yet.</h2>
            <p>
                To become verified, join a <a href="https://www.brightid.org/meet">verification party.</a>
            </p>
            <p>
                Check back here once you receive a "verified" sticker on BrightID.
            </p>
        </div>
    )
}

export default NotVerified
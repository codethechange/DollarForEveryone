
import React, { useState, useEffect } from 'react'

import * as serviceWorker from './serviceWorker';
import { xdai, eth } from '@burner-wallet/assets';
import BurnerCore from '@burner-wallet/core';
import { InjectedSigner, LocalSigner } from '@burner-wallet/core/signers';
import { InfuraGateway, InjectedGateway, XDaiGateway, } from '@burner-wallet/core/gateways';
import Exchange, { Uniswap, XDaiBridge } from '@burner-wallet/exchange';
import ModernUI from '@burner-wallet/modern-ui';
import MetamaskPlugin from '@burner-wallet/metamask-plugin';
import { BurnerConnectPlugin } from '@burner-wallet/burner-connect-wallet';
import 'worker-loader?name=burnerprovider.js!./burnerconnect'; // eslint-disable-line import/no-webpack-loader-syntax

import './App.css';
import SUN_IMAGE from './assets/Sun.svg'
import NotVerified from './NotVerified'
import Splash from './Splash'

const core = new BurnerCore({
    signers: [new InjectedSigner(), new LocalSigner()],
    gateways: [
      new InjectedGateway(),
      new InfuraGateway(process.env.REACT_APP_INFURA_KEY),
      new XDaiGateway(),
    ],
    assets: [xdai, eth],
});
  
const exchange = new Exchange({
pairs: [new XDaiBridge(), new Uniswap('dai')],
});
  
const BurnerWallet = () =>
<ModernUI
    core={core}
    plugins={[
    exchange,
    new MetamaskPlugin(),
    new BurnerConnectPlugin('Basic Wallet'),
    ]}
/>

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

enum Status {
    NOT_LINKED,
    LINKED,
    VERIFIED
}

function App() {

    const [status, setStatus] = useState(Status.NOT_LINKED)
    // const accountAddress = core.getAccounts()[0]
    const accountAddress = "0xEc21870902d3870FAb8157016FAeCF0Da600D599"

    useEffect(() => {
        fetch(`/api/status/${accountAddress}`).then(res => {
            return res.json()
        })
        .then(res => {
            if (res.status === "LINKED") {
                setStatus(Status.LINKED)
            } else if (res.status === "VERIFIED") {
                setStatus(Status.VERIFIED)
            }
        })
    }, [accountAddress])
    let appComponent = (<BurnerWallet></BurnerWallet>)
    if (status === Status.NOT_LINKED) {
        appComponent = (<Splash address={accountAddress}></Splash>)
    }
    if (status === Status.LINKED) {
        appComponent =  (<NotVerified accountAddress={accountAddress}></NotVerified>)
    }
    return (
        <div id="container">
            <div id="header">
                <h2 id="title">DollarForEveryone</h2>
                <img id="logo" alt="logo" src={SUN_IMAGE} />
            </div>
            <div id="app-content">
                {appComponent}
            </div>
        </div>
            
        
    )

}

export default App
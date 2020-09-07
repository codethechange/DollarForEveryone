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


function App() {
    debugger
    const [contextId, setContextId] = useState(localStorage.getItem("contextId") || "")
    const [linked, setLinked] = useState(localStorage.getItem("linked"))
    const [verified, setVerified] = useState(localStorage.getItem("verified"))
    
    // TODO
    return (<BurnerWallet></BurnerWallet>)

    if (!contextId || !linked) {
        return (<Splash contextId={contextId}></Splash>)
    }
    if (!verified) {
        return (<NotVerified></NotVerified>)
    }
    return (<BurnerWallet></BurnerWallet>)

}

export default App
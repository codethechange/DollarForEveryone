import { ComponentType } from 'react';
import { Asset } from '@burner-wallet/assets';
import {
  Account, AccountSearchFn, Actions, BurnerPluginContext, BurnerPluginData, Plugin, PluginActionContext, PluginElement, PluginPage, QRScannedFn, SendData, TXSentFn
} from '@burner-wallet/types';
import { RouteComponentProps } from 'react-router-dom';
import { withBurner } from './BurnerProvider';
import BurnerUICore from './BurnerUICore';

export type BurnerPluginData = BurnerPluginData;

export const DEFAULT_PLUGIN_DATA = {
  pages: [],
  homeButtons: [],
  elements: {},
  accountSearches: [],
  tryHandleQR: () => false,
  sent: () => null,
};

export default class Plugins {
  private changeListeners: ((data: BurnerPluginData) => void)[];
  private qrHandlers: QRScannedFn[];
  private sentHandlers: TXSentFn[];
  private pluginData: BurnerPluginData;
  private ui: BurnerUICore;

  constructor(plugins: Plugin[], ui: BurnerUICore) {
    this.changeListeners = [];
    this.sentHandlers = [];
    this.qrHandlers = [];
    this.ui = ui;
    this.pluginData = {
      ...DEFAULT_PLUGIN_DATA,
      tryHandleQR: this.tryHandleQR.bind(this),
      sent: this.sent.bind(this),
    };

    plugins.forEach(plugin => plugin.initializePlugin(this.getPluginContext(plugin)));
  }

  onDataChange(listener: (data: BurnerPluginData) => void) {
    this.changeListeners.push(listener);
  }

  getData() {
    return this.pluginData;
  }

  getPluginContext(plugin: Plugin): BurnerPluginContext {
    return {
      addElement: (position: string, Component: PluginElement) =>
        this.addPluginElement(plugin, position, Component),
      onAccountSearch: (callback: AccountSearchFn) => this.addAccountSearch(callback),
      onQRScanned: (callback: QRScannedFn) => this.qrHandlers.push(callback),
      onSent: (callback: TXSentFn) => this.sentHandlers.push(callback),
      addPage: (path: string, Component: PluginPage) => this.addPluginPage(plugin, path, Component),
      addHomeButton: (title: string, path: string) => this.addPluginHomeButton(plugin, title, path),
      getAssets: () => this.ui.getAssets(),
      getWeb3: (network: string, options?: any) => this.ui.getCore().getWeb3(network, options),
    };
  }

  setPluginData(newData: any) {
    this.pluginData = {
      ...this.pluginData,
      ...newData,
    };
    this.changeListeners.forEach(listener => listener(this.pluginData));
  }

  addPluginPage(plugin: Plugin, path: string, Component: PluginPage) {
    const WrappedComponent = withBurner(Component);
    this.setPluginData({
      pages: [...this.pluginData.pages, { plugin, path, Component: WrappedComponent }],
    });
  }

  addPluginHomeButton(plugin: Plugin, title: string, path: string) {
    this.setPluginData({
      homeButtons: [...this.pluginData.homeButtons, { plugin, title, path }],
    });
  }

  addPluginElement(plugin: Plugin, position: string, Component: PluginElement) {
    const WrappedComponent = withBurner(Component);
    const existingElements = this.pluginData.elements[position] || [];
    this.setPluginData({
      elements: {
        ...this.pluginData.elements,
        [position]: [...existingElements, { plugin, Component: WrappedComponent }],
      },
    });
  }

  addAccountSearch(callback: AccountSearchFn) {
    this.setPluginData({
      accountSearches: [...this.pluginData.accountSearches, callback],
    });
  }

  tryHandleQR(qr: string, context: PluginActionContext) {
    for (const handler of this.qrHandlers) {
      if (handler(qr, context)) {
        return true;
      }
    }
    return false;
  }

  sent(data: SendData) {
    let redirect = null;
    for (const listener of this.sentHandlers) {
      const response = listener(data);
      if (!redirect && response && response.length) {
        redirect = response;
      }
    }
    return redirect;
  }
}

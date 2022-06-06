/* eslint-disable import/first */

// import * as Arbundles from "arbundles/esm/umd.bundle"
// globalThis.arbundles = Arbundles;
import "arbundles/esm/umd.bundle"

import React from "react";

import BigNumber from "bignumber.js";
import { Button } from "@chakra-ui/button";
import { Input, HStack, Text, VStack, useToast, Menu, MenuButton, MenuList, MenuItem, Tooltip } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons"

// import WalletConnectProvider from "@walletconnect/web3-provider";
import { providers } from "ethers"
import { Web3Provider } from "@ethersproject/providers";

import { WalletConnection, keyStores, connect } from "near-api-js";
// @ts-ignore
// import * as Solana from "@bundlr-network/solana-web/esm/web/umd.bundle"
// // @ts-ignore
// import * as Ethereum from "@bundlr-network/ethereum-web/esm/web/umd.bundle"
// // @ts-ignore
// import * as Near from "@bundlr-network/near-web/esm/web/umd.bundle"
// // @ts-ignore
// import * as Erc20 from "@bundlr-network/erc20-web/esm/web/umd.bundle"
// @ts-ignore
import * as Cosmos from "@bundlr-network/cosmos-web/esm/web/umd.bundle"
// // @ts-ignore
// import * as Cosmos from "../../Cosmos/web/esm/web/umd.bundle"
// @ts-ignore
// globalThis.BundlrSolanaWeb = Solana;
// @ts-ignore
// globalThis.BundlrEthereumWeb = Ethereum;
// // @ts-ignore
// globalThis.BundlrNearWeb = Near;
// // @ts-ignore
// globalThis.BundlrErc20Web = Erc20
// @ts-ignore
globalThis.BundlrCosmosWeb = Cosmos
// import "@bundlr-network/solana-web/esm/web/umd.bundle"
// import "@bundlr-network/ethereum-web/esm/web/umd.bundle"
// import "@bundlr-network/erc20-web/esm/web/umd.bundle"
// import "@bundlr-network/near-web/esm/web/umd.bundle"

// import { WebBundlr } from "@bundlr-network/client/build/esm/bundle" 

// @ts-ignore
import { WebBundlr } from "@bundlr-network/client/build/esm/bundle"

declare var window: any // TODO: specifically extend type to valid injected objects.
const PhantomWalletAdapter = require("@solana/wallet-adapter-phantom").PhantomWalletAdapter

import { Keplr } from "@keplr-wallet/types";
import { getKeplrFromWindow } from "@keplr-wallet/stores";





function App() {
  const defaultCurrency = "Select a Currency"
  const defaultSelection = "Select a Provider"
  const [currency, setCurrency] = React.useState<string>(defaultCurrency);
  const [address, setAddress] = React.useState<string>();
  const [selection, setSelection] = React.useState<string>(defaultSelection);
  const [balance, setBalance] = React.useState<string>();
  const [img, setImg] = React.useState<Buffer>();
  const [price, setPrice] = React.useState<BigNumber>();
  const [bundler, setBundler] = React.useState<WebBundlr>();
  //const [bundler, setBundler] = React.useState<SolanaBundlr>();
  const [bundlerHttpAddress, setBundlerAddress] = React.useState<string>(
    "https://node1.bundlr.network"
  );

  const [rpcUrl, setRpcUrl] = React.useState<string>();
  const [contractAddress, setContractAddress] = React.useState<string>();
  const [minConfirm, setMinConfirm] = React.useState<number>();
  const [devMode, setDevMode] = React.useState<boolean>(false);
  const [chainChange, setChainChange] = React.useState<boolean>(true);

  const [fundAmount, setFundingAmount] = React.useState<string>();
  const [withdrawAmount, setWithdrawAmount] = React.useState<string>();
  const [provider, setProvider] = React.useState<Web3Provider>();

  const toast = useToast();
  const intervalRef = React.useRef<number>();


  const clean = async () => {
    clearInterval(intervalRef.current)
    setBalance(undefined);
    setImg(undefined);
    setPrice(undefined);
    setBundler(undefined);
    setProvider(undefined);
    setAddress(undefined);
    setCurrency(defaultCurrency);
    setSelection(defaultSelection);

  }


  const handleFileClick = () => {
    var fileInputEl = document.createElement("input");
    fileInputEl.type = "file";
    fileInputEl.accept = "image/*";
    fileInputEl.style.display = "none";
    document.body.appendChild(fileInputEl);
    fileInputEl.addEventListener("input", function (e) {
      handleUpload(e as any);
      document.body.removeChild(fileInputEl);
    });
    fileInputEl.click();
  };

  const handleUpload = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    let files = evt.target.files;
    let reader = new FileReader();
    if (files && files.length > 0) {
      reader.onload = function () {
        if (reader.result) {
          setImg(Buffer.from(reader.result as ArrayBuffer));
        }
      };
      reader.readAsArrayBuffer(files[0]);
    }
  };

  const handlePrice = async () => {
    if (img) {
      const price = await bundler?.utils.getPrice(currency as string, img.length);
      //@ts-ignore
      setPrice(price?.toString());
    }
  };

  const uploadFile = async () => {
    if (img) {
      await bundler?.uploader.upload(img, [{ name: "Content-Type", value: "image/png" }])
        .then((res: any) => {
          toast({
            status: res?.status === 200 || res?.status === 201 ? "success" : "error",
            title: res?.status === 200 || res?.status === 201 ? "Successful!" : `Unsuccessful! ${res?.status}`,
            description: res?.data.id ? `https://arweave.net/${res.data.id}` : undefined,
            duration: 15000,
          });
        })
        .catch((e: any) => { toast({ status: "error", title: `Failed to upload - ${e}` }) })
    }
  };

  const fund = async () => {
    if (bundler && fundAmount) {
      toast({ status: "info", title: "Funding...", duration: 15000 })
      const value = parseInput(fundAmount)
      if (!value) return
      await bundler.fund(value)
        .then((res: any) => { toast({ status: "success", title: `Funded ${res?.target}`, description: ` tx ID : ${res?.id}`, duration: 10000 }) })
        .catch((e: any) => {
          toast({ status: "error", title: `Failed to fund - ${e.data?.message || e.message}` })
        })
    }

  };

  const withdraw = async () => {
    if (bundler && withdrawAmount) {
      toast({ status: "info", title: "Withdrawing..", duration: 15000 })
      const value = parseInput(withdrawAmount)
      if (!value) return
      await bundler
        .withdrawBalance(value)
        .then((data: any) => {
          toast({
            status: "success",
            title: `Withdrawal successful - ${data.data?.tx_id}`,
            duration: 5000,
          });
        })
        .catch((err: any) => {
          toast({
            status: "error",
            title: "Withdrawal Unsuccessful!",
            description: err.message,
            duration: 5000,
          });
        });
    }
  };

  // field change event handlers

  const updateAddress = (evt: React.BaseSyntheticEvent) => {
    setBundlerAddress(evt.target.value);
  };

  const updateFundAmount = (evt: React.BaseSyntheticEvent) => {
    setFundingAmount(evt.target.value);
  };

  const updateWithdrawAmount = (evt: React.BaseSyntheticEvent) => {
    setWithdrawAmount(evt.target.value);
  };


  const connectWeb3 = async (connector: any) => {
    if (provider) {
      await clean();
    }
    const p = new providers.Web3Provider(connector);
    await p._ready();
    return p
  }

  /**
   * Map of providers with initialisation code - c is the configuration object from currencyMap
   */
  const providerMap = {
    "MetaMask": async (c: any) => {
      if (!window?.ethereum?.isMetaMask) return;
      await window.ethereum.enable();
      const provider = await connectWeb3(window.ethereum);
      const chainId = `0x${c.chainId.toString(16)}`
      if (!chainChange) {
        return provider
      }
      try { // additional logic for requesting a chain switch and conditional chain add.
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId }],
        })
      } catch (e: any) {
        if (e.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId, rpcUrls: c.rpcUrls, chainName: c.chainName
            }],
          });
        }
      }
      return provider;
    },
    // "WalletConnect": async (c: any) => { return await connectWeb3(await (new WalletConnectProvider(c)).enable()) },
    "Phantom": async (c: any) => {
      if (window.solana.isPhantom) {
        await window.solana.connect();
        const p = new PhantomWalletAdapter()
        await p.connect()
        return p;
      }
    },
    "wallet.near.org": async (c: any) => {
      const near = await connect(c);
      const wallet = new WalletConnection(near, "bundlr");
      if (!wallet.isSignedIn()) {
        toast({ status: "info", title: "You are being redirected to authorize this application..." })
        window.setTimeout(() => { wallet.requestSignIn() }, 4000)
        // wallet.requestSignIn();
      }
      else if (!await c.keyStore.getKey(wallet._networkId, wallet.getAccountId())) {
        toast({ status: "warning", title: "Click 'Connect' to be redirected to authorize access key creation." })
      }
      return wallet
    },
    "Keplr": async (c: any) => {
      const wallet = await getKeplrFromWindow();
      if (typeof wallet !== "undefined") {
        const key = await wallet.getKey(c.chainId);
        setAddress(key.bech32Address);
        await wallet.enable([c.chainId]);
      }
      return wallet
    }

  } as any

  const ethProviders = ["MetaMask", "WalletConnect"]

  const currencyMap = {
    "solana": {
      providers: ["Phantom"], opts: {}
    },
    "matic": {
      providers: ethProviders,
      opts: {
        chainId: 137,
        chainName: 'Polygon Mainnet',
        rpcUrls: ["https://polygon-rpc.com"],
      },
    },
    "arbitrum": {
      providers: ethProviders,
      opts: {
        chainName: "Arbitrum One",
        chainId: 42161,
        rpcUrls: ["https://arb1.arbitrum.io/rpc"]
      }
    },
    "bnb": {
      providers: ethProviders,
      opts: {
        chainName: "Binance Smart Chain",
        chainId: 56,
        rpcUrls: ["https://bsc-dataseed.binance.org/"]
      }
    },
    "avalanche": {
      providers: ethProviders,
      opts: {
        chainName: "Avalanche Network",
        chainId: 43114,
        rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"]
      }
    },
    "boba-eth": {
      providers: ethProviders,
      opts: {
        chainName: "BOBA L2",
        chainId: 288,
        rpcUrls: ["https://mainnet.boba.network"]
      }
    },
    "boba": {
      providers: ethProviders,
      opts: {
        chainName: "BOBA L2",
        chainId: 288,
        rpcUrls: ["https://mainnet.boba.network"]
      }
    },
    "near": {
      providers: ["wallet.near.org"],
      opts: {
        networkId: "mainnet",
        keyStore: new keyStores.BrowserLocalStorageKeyStore(),
        nodeUrl: "https://rpc.mainnet.near.org",
        walletUrl: "https://wallet.mainnet.near.org",
        helperUrl: "https://helper.mainnet.near.org",
        explorerUrl: "https://explorer.mainnet.near.org",
      }
    },
    "cosmos": {
      providers: ["Keplr"],
      opts: {
        chainId: "cosmoshub-4"
      }
    },
    "kyve": {
      providers: ["Keplr"],
      opts: {
        chainId: "korellia"
      }
    },
    "akash": {
      providers: ["Keplr"],
      opts: {
        chainId: "akashnet-2"
      }
    },
  } as any


  /**
   * initialises the selected provider/currency
   * @param cname currency name
   * @param pname provider name
   * @returns 
   */
  const initProvider = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (provider) {
      setProvider(undefined);
      setBundler(undefined);
      setAddress(undefined);
      return;
    }

    const pname = selection as string;
    const cname = currency as string;
    const p = providerMap[pname] // get provider entry
    const c = currencyMap[cname]
    console.log(`loading: ${pname} for ${cname}`)
    const providerInstance = await p(c.opts).catch((e: Error) => { toast({ status: "error", title: `Failed to load provider ${pname}`, duration: 10000 }); console.log(e); return; })
    setProvider(providerInstance)
  };

  const initBundlr = async () => {

    const bundlr = await WebBundlr.init(bundlerHttpAddress, currency, provider, { providerUrl: rpcUrl, contractAddress, minConfirm })

    try {
      // Check for valid bundlr node
      await bundlr.utils.getBundlerAddress(currency)
    } catch {
      toast({ status: "error", title: `Failed to connect to bundlr ${bundlerHttpAddress}`, duration: 10000 })
      return;
    }

    if (!bundlr.address) {
      console.log("something went wrong");
    }
    toast({ status: "success", title: `Connected to ${bundlerHttpAddress}` })
    setAddress(bundlr?.address)
    setBundler(bundlr);
  }

  const toProperCase = (s: string) => { return s.charAt(0).toUpperCase() + s.substring(1).toLowerCase() }
  const toggleRefresh = async () => {
    if (intervalRef) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = window.setInterval(async () => {
      bundler?.getLoadedBalance()
        .then((r: any) => { setBalance(r.toString()) })
        .catch((_: any) => clearInterval(intervalRef.current))
    }, 5000)
  }

  // parse decimal input into atomic units
  const parseInput = (input: string | number) => {
    const conv = new BigNumber(input).multipliedBy(bundler!.currencyConfig.base[1]);
    if (conv.isLessThan(1)) {
      toast({ status: "error", title: `Value too small!` })
      return;
    }
    return conv;
  }

  return (
    <VStack mt={10} >
      <HStack>
        {" "}
        <Menu >
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            {toProperCase(currency)}
          </MenuButton>
          <MenuList>
            {Object.keys(currencyMap).map((v) => {
              return (<MenuItem key={v} onClick={() => { clean(); setCurrency(v) }}>{toProperCase(v)}</MenuItem>) // proper/title case
            })}
          </MenuList>
        </Menu>
        <Menu >
          <MenuButton disabled={currency === defaultCurrency} as={Button} rightIcon={<ChevronDownIcon />}>
            {selection}
          </MenuButton>
          <MenuList>
            {Object.keys(providerMap).map((v) => {
              return ((currencyMap[currency] && currencyMap[currency].providers.indexOf(v) !== -1) ? (<MenuItem key={v} onClick={() => setSelection(v)}>{v}</MenuItem>) : undefined)
            })}
          </MenuList>
        </Menu>
        <Button disabled={!(selection !== defaultSelection && currency !== defaultCurrency && bundlerHttpAddress.length > 8)} onClick={async () => await initProvider()}>
          {provider ? "Disconnect" : "Connect"}
        </Button>
      </HStack>
      <Text>Connected Account: {address ?? "None"}</Text>
      <HStack>
        <Button w={400} disabled={!provider} onClick={async () => await initBundlr()}>
          Connect to Bundlr
        </Button>
        <Input
          value={bundlerHttpAddress}
          onChange={updateAddress}
          placeholder="Bundler Address"
        />
      </HStack>
      {devMode && (
        <>
          <Text>Advanced Overrides (Only change if you know what you're doing!)</Text>
          <HStack mt={10}>
            <Input
              value={rpcUrl}
              onChange={(evt: React.BaseSyntheticEvent) => { setRpcUrl(evt.target.value) }}
              placeholder="RPC Url"
            />
            <Input
              value={contractAddress}
              onChange={(evt: React.BaseSyntheticEvent) => { setContractAddress(evt.target.value) }}
              placeholder="Contract address"
            />
            <Input width='450px'
              value={minConfirm}
              onChange={(evt: React.BaseSyntheticEvent) => { setMinConfirm(evt.target.value) }}
              placeholder="minConfirm"
            />
            <Button onClick={() => setChainChange(!chainChange)} width='400px'>
              {chainChange ? "Disable" : "Enable"} Chain Changing
            </Button>

          </HStack>
        </>
      )}
      {
        bundler && (
          <>
            <HStack>
              <Button
                onClick={async () => {
                  address &&
                    bundler!
                      .getBalance(address)
                      .then((res: BigNumber) => {
                        setBalance(res.toString())
                      });
                  await toggleRefresh();
                }}

              >
                Get {toProperCase(currency)} Balance
              </Button>
              {balance && (
                <Tooltip label={`(${balance} ${bundler.currencyConfig.base[0]})`}>
                  <Text>
                    {toProperCase(currency)} Balance: {bundler.utils.unitConverter(balance).toFixed(7, 2).toString()} {bundler.currencyConfig.ticker.toLowerCase()}
                  </Text>
                </Tooltip>
              )}
            </HStack>
            <HStack>
              <Button w={200} onClick={fund}>
                Fund Bundlr
              </Button>
              <Input
                placeholder={`${toProperCase(currency)} Amount`}
                value={fundAmount}
                onChange={updateFundAmount}
              />
            </HStack>
            <HStack>
              <Button w={200} onClick={withdraw}>
                Withdraw Balance
              </Button>
              <Input
                placeholder={`${toProperCase(currency)} Amount`}
                value={withdrawAmount}
                onChange={updateWithdrawAmount}
              />
            </HStack>
            <Button onClick={handleFileClick}>Select file from Device</Button>
            {
              img && (
                <>
                  <HStack>
                    <Button onClick={handlePrice}>Get Price</Button>
                    {price && (
                      <Text>{`Cost: ${bundler.utils.unitConverter(price).toString()} ${bundler.currencyConfig.ticker.toLowerCase()} `}</Text>
                    )}
                  </HStack>
                  <Button onClick={uploadFile}>Upload to Bundlr Network</Button>
                </>
              )
            }
          </>
        )
      }
      <Button onClick={() => { setDevMode(!devMode) }}>
        {devMode ? "Hide" : "Show"} Advanced Options
      </Button>
    </VStack >

  );
}

export default App;

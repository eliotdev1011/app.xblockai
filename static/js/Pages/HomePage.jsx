import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./HomePage.css";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import Card from "../components/Card/Card";
import useNetworkData from "../hooks/useNetworkData";
import StakingABI from "../blockchain/abi/Xero.json";
import TokenABI from "../blockchain/abi/tokenAbi.json"
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useProvider, useSigner } from "wagmi";
import useTransactionToast from "../hooks/useTransactionToast";
import { amountFormatter, defaultPool, defaultUser, wethPriceInUSD, findError, fromWei, getTimeInDays, getValueInUSD, handleError, poolFormatter, sendAndConfirmTransaction, toWei, userFormatter } from "../utils";
import useConfirmationToast from "../hooks/useConfirmationToast";
window.ethers = ethers;
const amountPer = [.25, .5, .75, 1];

const HomePage = () => {

  const network = useNetworkData();
  const { address } = useAccount()
  const { isConnected } = useAccount();
  const [tab, setTab] = useState(0);
  const txToast = useTransactionToast();
  const confirmationToast = useConfirmationToast("emergency");
  const confirmationToastStake = useConfirmationToast("stake");
  const [userBal, setUserBal] = useState(0);
  const [amount, setAmount] = useState('');
  const [pool, setPoolInfo] = useState(defaultPool);
  const [userInfo, setUserStakeInfo] = useState(defaultUser);
  console.log('userInfo: ', userInfo);
  const [claimableAmount, setClaimableAmount] = useState(0);
  const [totalClaimedInUSD, setTotalClaimedInUSD] = useState(0);
  console.log('totalClaimedInUSD: ', totalClaimedInUSD);
  const [claimableETHAmount, setClaimableETHAmount] = useState(0);
  const [totalStakedValue, setTotalStakedValue] = useState(0);

  const provider = useProvider();
  const { data: signer } = useSigner()

  const { contract, token } = useMemo(() => {
    const contract = new ethers.Contract(network.contract, StakingABI, signer || provider)
    const token = new ethers.Contract(network.token, TokenABI, signer || provider)
    return { contract, token }
  }, [network, signer, provider]);

  const getPool = async () => {
    try {
      const pool = await contract.pool();
      const format = poolFormatter(pool);
      setPoolInfo(format);
    } catch (error) {
      console.log('error: ', error);
    }
  }

  const getUser = async () => {
    if (!address) return;
    try {
      const userStakeInfo = await contract.userInfo(address);
      const format = userFormatter(userStakeInfo);
      setUserStakeInfo(format);
    } catch (error) {
      console.log('error: ', error);
    }
  }

  const fetchData = async () => {
    if (!address) return;
    try {
      const claimableAmount = await contract.claimableRewards(address);
      const claimableETHAmount = await contract.claimableETHReward(address);
      const userBal = await token.balanceOf(address);
      setClaimableAmount(fromWei(claimableAmount));
      setClaimableETHAmount(fromWei(claimableETHAmount, 18));
      setUserBal(fromWei(userBal));
    } catch (error) {
      console.log('error: ', error);
    }
  }

  async function approve(amount) {
    const allowance = await token.allowance(address, network.contract);
    if (allowance.gte(amount)) return true;
    await toast.promise(sendAndConfirmTransaction(() => token.approve(network.contract, amount)), {
      loading: "Approving...",
      success: "Approved",
      error: e => findError(e, "Approval failed")
    })
    return true;
  }

  async function handleStake() {
    if (claimableETHAmount > 0) {
      return confirmationToastStake(stake);
    }
    await stake();
  }

  async function validateBalance() {
    const balance = await token.balanceOf(address);
    if (balance < pool.minContribution) {
      toast.error("Insufficient balance");
      throw new Error("Insufficient balance");
    }
    return true
  }

  async function stake() {
    await validateBalance();
    if (!amount) return toast.error("Enter Stake Amount");
    const _amount = toWei(amount);
    const isApproved = await approve(_amount);
    if (!isApproved) return;
    const tx = sendAndConfirmTransaction(() => contract.stakeTokens(_amount));
    await toast.promise(tx, {
      loading: "Staking...",
      success: function (hash) {
        txToast(hash);
        return "Staked Successfully"
      },
      error: e => findError(e, "Stake failed")
    })
    setAmount('');
    await refetchData();
  }

  async function handleUnstake() {
    await toast.promise(
      sendAndConfirmTransaction(() => contract.unstakeTokens()), {
      loading: "Unstaking...",
      success: "Tokens UnStaked Successfully",
      error: (e) => findError(e, "UnStake failed")
    })
    await refetchData();
  }

  async function handleEmergencyWithdraw() {
    await toast.promise(
      sendAndConfirmTransaction(() => contract.emergencyWithdraw()), {
      loading: "Withdrawing...",
      success: "Withdrawn Successfully",
      error: (e) => findError(e, "Emergency withdraw failed")
    })
    await refetchData();
  }

  async function handleClaimRewards() {
    await toast.promise(
      sendAndConfirmTransaction(() => contract.claimRewards()), {
      loading: "Claiming...",
      success: "Claimed Successfully",
      error: (e) => findError(e, "Claim failed")
    })
    await refetchData();
  }

  async function handleETHClaim() {
    await toast.promise(
      sendAndConfirmTransaction(() => contract.claimETHReward()), {
      loading: "Claiming...",
      success: "Claimed Successfully",
      error: (e) => findError(e, "Claim failed")
    })
    await refetchData();
  }

  const totalStakedTokenValue = async () => {
    try {
      const totalTokenValue = await getValueInUSD(pool.currentPoolSize);
      setTotalStakedValue(totalTokenValue);
    } catch (error) {
      console.log('error: ', error);
    }
  }

  const totalUserClaimedValue = async () => {
    try {
      const wethPrice = await wethPriceInUSD();
      const claimedETHValue = Number(userInfo.rewardETHClaimed) * Number(wethPrice);
      setTotalClaimedInUSD(claimedETHValue);
    } catch (error) {
      console.log('error: ', error);
    }
  }

  const refetchData = async () => {
    await getPool();
    await getUser();
    await fetchData();
    await fetechAmount();
  }

  const fetechAmount = useCallback(async () => {
    try {
      if (pool.currentPoolSize > 0) {
        await totalStakedTokenValue();
      }
      if (userInfo.rewardETHClaimed > 0) {
        await totalUserClaimedValue();
      }
    } catch (error) {
      console.log('error: ', error);
    }
  }, [pool, userInfo]);

  useEffect(() => {
    fetechAmount()
  }, [fetechAmount])

  useEffect(() => {
    refetchData()
  }, [])

  return (
    <>
      <div className="main-container">
        <div className="token-container-wrapper">

          <div className="upper-box-group">
            <Card heading={"Token Value Locked"} value={"$" + amountFormatter(totalStakedValue)} />
            <Card heading={"Total Tokens Staked"} value={amountFormatter(pool.currentPoolSize)} />
            <Card heading={"Total Claimed ETH Value"} value={"$" + amountFormatter(totalClaimedInUSD)} />
          </div>
          <div className="left-box-group">
            <Card heading={"My Balance"} value={amountFormatter(userBal)} />
            <Card heading={"My Stake Balance"} value={amountFormatter(userInfo.amount)} />
            <Card heading={"Total ETH Claimed"} value={Number(userInfo.rewardETHClaimed).toFixed(4)} />
          </div>
          <div className="right-box-group">
            <Card heading={"Early Unstake Fee"} value={`${pool.emergencyFees / 10}%`} />
            <Card heading={"APY Rate"} value={"Dynamic"} />
            <Card heading={"Locked at"} value={getTimeInDays(userInfo.stakingTime)} />
          </div>

          <div className="tab-pannel mob">
            <button className={`tab btn ${tab === 0 ? "btn-1" : ""}`} onClick={() => setTab(0)}>Stake</button>
            <button className={`tab btn ${tab === 1 ? "btn-2" : ""}`} onClick={() => setTab(1)}>Unstake</button>
          </div>

          <div className="data-info mob">
            <div className="row">
              <div className="col text-bold">Token Value Locked</div>
              <div className="col text-gray">${amountFormatter(totalStakedValue)}</div>
            </div>
            <div className="row">
              <div className="col text-bold">Total Tokens Staked</div>
              <div className="col text-gray">{amountFormatter(pool.currentPoolSize)}</div>
            </div>
            <div className="row">
              <div className="col text-bold">Total Claimed ETH Value</div>
              <div className="col text-gray">${amountFormatter(totalClaimedInUSD)}</div>
            </div>
          </div>
          <div className="data-info mob">
            <div className="row">
              <div className="col text-bold">My Balance</div>
              <div className="col text-gray">{amountFormatter(userBal)}</div>
            </div>
            <div className="row">
              <div className="col text-bold">My Stake Balance</div>
              <div className="col text-gray">{amountFormatter(userInfo.amount)}</div>
            </div>
            <div className="row">
              <div className="col text-bold">Total ETH Claimed</div>
              <div className="col text-gray">{Number(userInfo.rewardETHClaimed).toFixed(4)}</div>
            </div>
          </div>

          <div className="token-container gradient-border" >
            <h6 className="midStyle" style={{ paddingTop: "1rem", fontSize: "1rem" }}>
              Minimum lock period: {pool.minLockDays} days
            </h6>
            <div className="pol-creater-wrapper">
              <div className="payment-option-container">
                <>
                  <div style={{ position: "relative", display: "inline-block", }}>
                    <input style={{
                      border: "2px solid white",
                      paddingRight: "30px",
                      color: "#fff",
                      borderRadius: '20px'
                    }} type="number" inputMode="numeric" value={amount} placeholder="0.00" onChange={(e) => setAmount(e.target.value)} />
                    <button className={`gradient-border ${tab !== 0 ? "border-tab-1" : ""} `}
                      style={{ position: "absolute", top: "2px", right: "1px", height: "90%", width: "60px", fontWeight: "bold", justifyContent: "center", alignItems: "center", backgroundColor: "black", color: "white", borderRadius: "12px", }}
                      onClick={() => setAmount(userBal)}
                    >
                      MAX
                    </button>
                  </div>
                </>

                <div className="payment-opt-btn-group amount">
                  {amountPer.map(e => (
                    <button key={e} className={`gradient-border ${tab !== 0 ? "border-tab-1" : ""}`} style={{ borderRadius: "12px", backgroundColor: "black" }} onClick={() => setAmount(userBal * e)}>
                      {e * 100}%
                    </button>
                  ))}
                </div>
                {!isConnected ? (
                  <div className="connect-wallet">
                    <ConnectButton chainStatus="none" />
                  </div>
                ) :
                  <>
                    <div className="btn-group-desk">
                      <div className="gradientButton">
                        <button onClick={handleStake} style={{ width: "49%", background: "linear-gradient(120deg, #ff3bff, #ecbfbf, #5c24ff)", borderRadius: "100px", padding: "13px", fontSize: "16px", fontWeight: "bold", }}>
                          Stake
                        </button>
                        <button onClick={handleUnstake} style={{ width: "49%", background: "linear-gradient(120deg, #ff3bff, #ecbfbf, #5c24ff)", borderRadius: "100px", padding: "13px", fontSize: "16px", fontWeight: "bold", }}                        >
                          Unstake
                        </button>
                      </div>
                      <div>
                        <button onClick={() => confirmationToast(handleEmergencyWithdraw)} style={{ width: "100%", background: "linear-gradient(120deg, #ff3bff, #ecbfbf, #5c24ff)", borderRadius: "100px", padding: "13px", fontSize: "16px", fontWeight: "bold", marginBlock: "1rem" }}>
                          Emergency Withdraw
                        </button>
                        <div className="gradientButton">
                          <div>
                            <h4 style={{ color: "white" }}>Claimable Reward</h4>
                            <h4 style={{ color: "white" }}>{claimableETHAmount} ETH</h4>
                          </div>
                          <button onClick={handleETHClaim} className="gradient-border" style={{ width: "max-content", background: "linear-gradient(120deg, #ff3bff, #ecbfbf, #5c24ff)", borderRadius: "100px", padding: "13px", fontSize: "16px", fontWeight: "bold", }}>
                            Claim ETH
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="btn-group-mob">
                      {tab === 0 ?
                        <button onClick={handleStake} style={{ width: "100%", background: "linear-gradient(99deg, #FF3BFF 0%, #ECBFBF 100%)", borderRadius: "12px", padding: "13px", fontSize: "1rem", border: "none", fontWeight: "bold", }}>
                          Stake
                        </button>
                        :
                        <div style={{ display: "grid", gap: "1rem" }}>
                          <button onClick={handleUnstake} style={{ width: "100%", background: "linear-gradient(180deg, rgba(48, 16, 128, 0.60) 0%, rgba(120, 64, 173, 0.36) 100%), #FFF", borderRadius: "12px", padding: "13px", fontSize: "1rem", border: "none", fontWeight: "bold", }}>
                            Unstake
                          </button>
                          <button onClick={() => confirmationToast(handleEmergencyWithdraw)} style={{ width: "100%", background: "linear-gradient(180deg, rgba(48, 16, 128, 0.60) 0%, rgba(120, 64, 173, 0.36) 100%), #FFF", borderRadius: "12px", padding: "13px", fontSize: "1rem", border: "none", fontWeight: "bold", }}>
                            Emergency Withdraw
                          </button>
                        </div>
                      }

                      <div className="mob-claim-btn">
                        <div>
                          <h4 style={{ color: "white" }}>Claimable Reward</h4>
                          <h4 style={{ color: "white" }}>{claimableETHAmount} ETH</h4>
                        </div>
                        <button onClick={handleETHClaim} style={{ width: "100%", color: "white", background: "transparent", borderRadius: "12px", padding: "13px", fontSize: "1rem", border: "1px solid white", fontWeight: "bold", }}>
                          Claim ETH
                        </button>
                      </div>
                    </div>
                  </>
                }
              </div>
            </div>
          </div>
          <div className="data-info mob">
            <div className="row">
              <div className="col text-bold">Early Unstake Fee</div>
              <div className="col text-gray">{pool.emergencyFees / 10}%</div>
            </div>
            <div className="row">
              <div className="col text-bold">APY Rate</div>
              <div className="col text-gray">Dynamic</div>
            </div>
            <div className="row">
              <div className="col text-bold">Locked at</div>
              <div className="col text-gray">{getTimeInDays(userInfo.stakingTime)}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;

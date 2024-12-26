import { BigNumber, ethers } from "ethers/lib";

export const defaultPool = {
    apy: 0,
    currentPoolSize: 0,
    emergencyFees: 0,
    maxContribution: 0,
    maxPoolSize: 0,
    minContribution: 0,
    minLockDays: 0,
    poolActive: false,
    poolType: '',
    totalETHRewardsClaimed: 0,
    totalRewardsClaimed: 0
}

export const defaultUser = {
    amount: 0,
    rewardClaimed: 0,
    rewardETHClaimed: 0,
    stakingTime: 0
}

export function getTimeInDays(targetTimeInSeconds) {
    if (targetTimeInSeconds === 0) return '--'
    const date = new Date(targetTimeInSeconds * 1000);

    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        // hour: 'numeric',
        // minute: 'numeric',
    })

}

export function addressSorter(address) {
    const start = address.slice(0, 8);
    const end = address.slice(-4);
    return `${start}...${end}`
}

export function poolFormatter(pool) {
    if (!pool) return {
        apy: 0,
        currentPoolSize: 0,
        emergencyFees: 0,
        maxContribution: 0,
        maxPoolSize: 0,
        minContribution: 0,
        minLockDays: 0,
        poolActive: false,
        poolType: '',
        totalETHRewardsClaimed: 0,
        totalRewardsClaimed: 0,
        totalTokenRewards: 0,
        totalETHRewards: 0
    }
    return {
        apy: Number(pool.apy),
        poolType: pool.poolType,
        poolActive: pool.poolActive,
        currentPoolSize: fromWei(pool.currentPoolSize),
        emergencyFees: Number(pool.emergencyFees),
        maxContribution: fromWei(pool.maxContribution),
        maxPoolSize: fromWei(pool.maxPoolSize),
        minContribution: fromWei(pool.minContribution),
        minLockDays: Number(pool.minLockDays),
        totalETHRewardsClaimed: fromWei(pool.totalETHRewardsClaimed),
        totalRewardsClaimed: fromWei(pool.totalRewardsClaimed),
        totalTokenRewards: fromWei(pool.totalTokenRewards),
        totalETHRewards: fromWei(pool.totalETHRewards)
    }
}

export function userFormatter(user) {
    if (!user) return {
        amount: 0,
        rewardClaimed: 0,
        rewardETHClaimed: 0,
        stakingTime: 0
    }
    return {
        amount: fromWei(user.amount),
        rewardClaimed: fromWei(user.rewardClaimed),
        rewardETHClaimed: fromWei(user.rewardETHClaimed, 18),
        stakingTime: Number(user.stakingTime),
    }
}

export const toWei = (value, decimals = 9) => {
    return ethers.utils.parseUnits(value.toString(), decimals);
}

export const fromWei = (value, decimals = 9) => {
    if (!value) return 0
    return Number(ethers.utils.formatUnits(value, decimals)).toFixed(4);
}

export const amountFormatter = (value, to = 2) => {
    if (!value) return '0'
    const numFormat = Intl.NumberFormat('en-US', { maximumFractionDigits: to });
    return numFormat.format(value);
}
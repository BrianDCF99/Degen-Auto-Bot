import React, { useState, useEffect } from 'react';
import {pumpFunImage } from './links';


function coinBoxReact({coin, type}) {


    return (
        <div className='coinBox' key = {type + '${coin.tokenAddress}'}>
            <img className='coinImg' src={coinBoxDataFormatter(coin.img_url)} alt={coin.tokenName} />
            {coin.pumpfun && (
                <img className='pumpFunImg' src={pumpFunImage} alt='Pump Fun' />
            )}
            <div className='coinDetails'>
                <div className='coinNameContainer'>
                    <span className='coinNameLabel'>Name:</span>
                    <span className='coinName'>{coin.tokenName}</span>
                </div>
                <p>Ticker: {coin.tokenTicker}</p>
                <p>MC: {coinBoxDataFormatter(coin.marketCap)}</p>
                <p>Liq: {coinBoxDataFormatter(coin.liquidity)}</p>
                <div className='buttonContainer'>
                    
                    {coinBoxButtonHandler.getSocialButtons(coin)}
                </div>
            </div>
        </div>
    );
}

export default coinBoxReact;

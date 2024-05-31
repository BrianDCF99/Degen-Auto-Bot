import React, { useState } from 'react';
import { copyImage, twitterImage, telegramImage, websiteImage, pumpFunImage } from './links';
import './coinBox.css';

const convertIpfsUrl = (url) => {
    if (url.startsWith('https://gateway.pinata.cloud/ipfs/')) {
        return url.replace('https://gateway.pinata.cloud/ipfs/', 'https://cloudflare-ipfs.com/ipfs/');
    }
    return url;
}

function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) {
        return '$0';
    }
    if (typeof num !== 'number') {
        num = Number(num);
        if (isNaN(num)) {
            return '$0';
        }
    }
    if (num >= 1000000000) {
        return '$' + (num / 1000000000).toFixed(2) + 'B';
    } else if (num >= 1000000) {
        return '$' + (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return '$' + (num / 1000).toFixed(2) + 'k';
    }
    return '$' + num.toFixed(2);
}

function CoinBox({ coin }) {
    const [isCopied, setIsCopied] = useState(false);

    if (!coin) {
        return <p>Loading...</p>;
    }

    const formattedMarketCap = formatNumber(coin.marketCap);
    const formattedLiquidity = formatNumber(coin.totalLiquidity);

    const handleCopy = () => {
        navigator.clipboard.writeText(coin.poolAddress).then(() => {
            setIsCopied(true);
            setTimeout(() => {
                setIsCopied(false);
            }, 150);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    };

    const handleButtonClick = (url) => {
        window.open(url, '_blank');
    };

    const socialButtons = [];
    if (coin.socials) {
        if (coin.socials.twitter) {
            socialButtons.push(
                <button key="twitter" className='socialButton' onClick={() => handleButtonClick(coin.socials.twitter)}>
                    <img className='buttonIcon' src={twitterImage} alt='Twitter Button' />
                </button>
            );
        }
        if (coin.socials.telegram) {
            socialButtons.push(
                <button key="telegram" className='socialButton' onClick={() => handleButtonClick(coin.socials.telegram)}>
                    <img className='buttonIcon' src={telegramImage} alt='Telegram Button' />
                </button>
            );
        }
        if (coin.socials.website) {
            socialButtons.push(
                <button key="website" className='socialButton' onClick={() => handleButtonClick(coin.socials.website)}>
                    <img className='buttonIcon' src={websiteImage} alt='Website Button' />
                </button>
            );
        }
    }

    return (
        <div className='coinBox'>
            <img className='coinImg' src={convertIpfsUrl(coin.img_url)} alt={coin.tokenName} />
            <div className='coinDetails'>
                <div className='coinNameContainer'>
                    <span className='coinNameLabel'>Name:</span>
                    <span className='coinName'>{coin.tokenName}</span>
                </div>
                <p>Ticker: {coin.tokenTicker}</p>
                <p>MC: {formattedMarketCap}</p>
                <p>Liq: {formattedLiquidity}</p>
                <div className='buttonContainer'>
                    <button className={`clipboardButton ${isCopied ? 'copied' : ''}`} onClick={handleCopy}>
                        <img className='clipboardIcon' src={copyImage} alt='Clipboard' />
                    </button>
                    {socialButtons}
                </div>
            </div>
        </div>
    );
}

export default CoinBox;

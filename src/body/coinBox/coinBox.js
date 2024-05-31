import React, { useState } from 'react';
import { copyImage, twitterImage, telegramImage, websiteImage } from './links';
import './coinBox.css';

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

    // Handle pinata.cloud links
    const imgSrc = coin.img_url.includes('pinata.cloud')
        ? coin.img_url.replace('gateway.pinata.cloud', 'cloudflare-ipfs.com')
        : coin.img_url;

    const handleCopy = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(coin.poolAddress).then(() => {
                setIsCopied(true);
                setTimeout(() => {
                    setIsCopied(false);
                }, 1500);
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = coin.poolAddress;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                setIsCopied(true);
                setTimeout(() => {
                    setIsCopied(false);
                }, 1500);
            } catch (err) {
                console.error('Could not copy text: ', err);
            }
            document.body.removeChild(textarea);
        }
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
            <img className='coinImg' src={imgSrc} alt={coin.tokenName} />
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

import React, { useState, useEffect } from 'react';
import { copyImage, twitterImage, telegramImage, websiteImage, pumpFunImage, imgNotFound } from './links';
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

function CoinBox({ coin, id, isNewBlue, isNewGreen }) {
    const [isCopied, setIsCopied] = useState(false);
    const [hasFlashed, setHasFlashed] = useState(false);

    useEffect(() => {
        // Reset hasFlashed state when isNewBlue or isNewGreen changes
        setHasFlashed(false);
    }, [isNewBlue, isNewGreen]);

    useEffect(() => {
        // Flash blue or green based on the prop
        if (!hasFlashed) {
            if (isNewBlue) {
                flashBlue(coin.tokenAddress);
                setHasFlashed(true);
            } else if (isNewGreen) {
                flashGreen(coin.tokenAddress);
                setHasFlashed(true);
            }
        }
    }, [isNewBlue, isNewGreen, coin.tokenAddress, hasFlashed]);

    const flashBlue = (coinAddress) => {
        const element = document.getElementById(`coinBox-${coinAddress}`);
        if (element) {
            element.classList.add('flashBlue');
            setTimeout(() => {
                element.classList.remove('flashBlue');
            }, 5000); // Duration of the animation
        }
    };

    const flashGreen = (coinAddress) => {
        const element = document.getElementById(`coinBox-${coinAddress}`);
        if (element) {
            element.classList.add('flashGreen');
            setTimeout(() => {
                element.classList.remove('flashGreen');
            }, 1000); // Duration of the animation
        }
    };

    if (!coin) {
        return <p>Loading...</p>;
    }

    const formattedMarketCap = formatNumber(coin.marketCap);
    const formattedLiquidity = formatNumber(coin.totalLiquidity);

    // Handle pinata.cloud links
    const imgSrc = (imgURL) => {
        if (imgURL.includes('gateway.pinata.cloud')) {
            return imgURL.replace('gateway.pinata.cloud', 'cloudflare-ipfs.com');
        } else if (imgURL.includes('cf-ipfs.com')) {
            return imgURL.replace('cf-ipfs.com', 'cloudflare-ipfs.com');
        }
        return imgURL;
    };

    const handleCopy = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(coin.tokenAddress).then(() => {
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
                }, 200);
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
        <div className={`coinBox`} id={id}>
            <img className='coinImg' src={imgSrc(coin.img_url)} alt={coin.tokenName} />
            {coin.pumpfun && (
                <img className='pumpFunImg' src={pumpFunImage} alt='Pump Fun' />
            )}
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

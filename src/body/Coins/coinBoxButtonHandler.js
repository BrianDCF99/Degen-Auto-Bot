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


function getSocialButtons(coin){
    const socialButtons = [];

    socialButtons.push(
        <button className={`clipboardButton ${isCopied ? 'copied' : ''}`} onClick={handleCopy}>
            <img className='clipboardIcon' src={copyImage} alt='Clipboard' />
        </button>
    );

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
    
}
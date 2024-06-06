import React, { useState, useEffect } from 'react';
import CoinBox from './coinBox/coinBox';
import { addedFetcher, upcomingFetcher } from '../apiGetter/fetcher';
import './body.css';

function Body() {
    const [addedCoins, setAddedCoins] = useState([]);
    const [dpPublished, setDpPublished] = useState([]);
    const [newImageDisplayed, setNewImageDisplayed] = useState([]); // Track displayed coins

    // Flashing methods
    const flashBlue = (coinAddress) => {
        const element = document.getElementById(`coinBox-${coinAddress}`);
        if (element) {
            element.classList.add('flashBlue');
            setTimeout(() => {
                element.classList.remove('flashBlue');
            }, 1000); // Duration of the animation
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

    useEffect(() => {
        const clearLocalStorageOnce = () => {
            if (!localStorage.getItem('cleared')) {
                localStorage.clear();
                localStorage.setItem('cleared', 'true');
                console.log('Local storage cleared');
            }
        };

        const updateCoins = async () => {
            console.log('Updating coins...');
            try {
                console.log('NEW IMAGES');
                await addedFetcher.updateCoins('https://degenautobot.xyz');
                const addedCoinsData = localStorage.getItem('newImages');
                let addedCoinsArray = [];
                if (addedCoinsData) {
                    addedCoinsArray = JSON.parse(addedCoinsData).reverse();
                    setAddedCoins(addedCoinsArray);
                    console.log('Added Coins:', addedCoinsArray);
                }
                console.log('NEW IMAGES DONE ------');

                console.log('DEX PAID');
                await upcomingFetcher.updateCoins('https://degenautobot.xyz/dex');
                const upcomingCoinsData = localStorage.getItem('dexPaid');
                let upcomingCoinsArray = [];
                if (upcomingCoinsData) {
                    upcomingCoinsArray = JSON.parse(upcomingCoinsData).reverse();
                    console.log('Upcoming Coins:', upcomingCoinsArray);
                }
                console.log('DEX PAID DONE ------');

                // Filter out coins that have already been added to Image Added
                let bufferArray = [];
                for (const coin of upcomingCoinsArray) {
                    if (!addedCoinsArray.some(addedCoin => addedCoin.tokenAddress === coin.tokenAddress)) {
                        bufferArray.push(coin);
                    }
                }
                console.log('Buffer Array:', bufferArray);

                // Initialize dpPublished in local storage if it doesn't exist
                let dpPublishedArray = [];
                if (!localStorage.getItem('dpPublished')) {
                    localStorage.setItem('dpPublished', JSON.stringify([]));
                } else {
                    dpPublishedArray = JSON.parse(localStorage.getItem('dpPublished'));
                }

                // Remove coins from dpPublished that are not in bufferArray
                const updatedDpPublished = dpPublishedArray.filter(coin =>
                    bufferArray.some(bufferCoin => bufferCoin.tokenAddress === coin.tokenAddress)
                );

                // Add coins to dpPublished that are in bufferArray but not in dpPublished
                bufferArray.forEach(bufferCoin => {
                    if (!updatedDpPublished.some(dpCoin => dpCoin.tokenAddress === bufferCoin.tokenAddress)) {
                        updatedDpPublished.unshift(bufferCoin); // Use unshift to maintain LIFO order
                        flashBlue(bufferCoin.tokenAddress); // Flash blue when a new coin is added
                    }
                });

                // Save the updated dpPublished back to local storage and state
                localStorage.setItem('dpPublished', JSON.stringify(updatedDpPublished));
                setDpPublished(updatedDpPublished);

                console.log('dpPublished:', updatedDpPublished);

                // Update newImageDisplayed and track newly displayed coins
                addedCoinsArray.forEach(coin => {
                    if (!newImageDisplayed.some(displayedCoin => displayedCoin.tokenAddress === coin.tokenAddress)) {
                        newImageDisplayed.push(coin);
                        flashGreen(coin.tokenAddress); // Flash green when a new coin is displayed
                    }
                });
                
                setNewImageDisplayed([...newImageDisplayed]);

            } catch (error) {
                console.error('Error updating coins:', error);
            }
        };

        clearLocalStorageOnce(); // Clear local storage once on startup
        updateCoins(); // Initial load
        const intervalId = setInterval(updateCoins, 1000); // Update every second

        return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, [addedCoins, newImageDisplayed]);

    // Split coins into rows of 4 for the added images
    const splitIntoRows = (coins) => {
        const rows = [];
        for (let i = 0; i < coins.length; i += 4) {
            rows.push(coins.slice(i, i + 4));
        }
        return rows;
    };

    const addedRows = splitIntoRows(addedCoins);

    return (
        <div className='body-container'>
            <div className='upcoming-container'>
                <div className='Dtitle'>
                    <h2>Enhanced Token Info Update</h2>
                </div>
                <div className='upcoming-body'>
                    {dpPublished.map((coin, index) => (
                        <CoinBox
                            key={index}
                            coin={coin}
                            id={`coinBox-${coin.tokenAddress}`}
                        />
                    ))}
                </div>
            </div>
            <div className='title'>
                <h2>Added Images</h2>
            </div>
            <div className='body'>
                {addedRows.map((row, rowIndex) => (
                    <div key={rowIndex} className='row'>
                        {row.map((coin, index) => (
                            <CoinBox
                                key={index}
                                coin={coin}
                                id={`coinBox-${coin.tokenAddress}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Body;

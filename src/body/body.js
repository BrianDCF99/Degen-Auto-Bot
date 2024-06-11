import React, { useState, useEffect } from 'react';
import CoinBox from './coinBox/coinBox';
import { addedFetcher, upcomingFetcher } from '../apiGetter/fetcher';
import './body.css';

function Body() {
    const [addedCoins, setAddedCoins] = useState([]);
    const [dpPublished, setDpPublished] = useState([]);
    const [previousAddedCoins, setPreviousAddedCoins] = useState([]); // Track previous added coins
    const [previousDpPublished, setPreviousDpPublished] = useState([]); // Track previous published coins
    const [newlyAddedGreenCoins, setNewlyAddedGreenCoins] = useState([]); // Track newly added coins for green flashing
    const [newlyAddedBlueCoins, setNewlyAddedBlueCoins] = useState([]); // Track newly added coins for blue flashing
    const [newlyAddedYellowCoins, setNewlyAddedYellowCoins] = useState([]); // Track newly added coins for yellow flashing

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
                // Clear local storage keys for newImages and dexPaid
                localStorage.removeItem('newImages');
                localStorage.removeItem('dexPaid');

                // Fetch new images
                console.log('Fetching new images...');
                await addedFetcher.updateCoins('https://degenautobot.xyz');
                const addedCoinsData = localStorage.getItem('newImages');
                let addedCoinsArray = [];
                if (addedCoinsData) {
                    addedCoinsArray = JSON.parse(addedCoinsData).reverse();
                    console.log('Added Coins:', addedCoinsArray);
                }
                console.log('Fetching new images done.');

                // Fetch enhanced token info
                console.log('Fetching enhanced token info...');
                await upcomingFetcher.updateCoins('https://degenautobot.xyz/dex');
                const upcomingCoinsData = localStorage.getItem('dexPaid');
                let upcomingCoinsArray = [];
                if (upcomingCoinsData) {
                    upcomingCoinsArray = JSON.parse(upcomingCoinsData).reverse();
                    console.log('Upcoming Coins:', upcomingCoinsArray);
                }
                console.log('Fetching enhanced token info done.');

                // Step 1: Filter out coins from upcomingCoinsArray that are present in addedCoinsArray
                let bufferArray = upcomingCoinsArray.filter(coin => 
                    !addedCoinsArray.some(addedCoin => addedCoin.tokenAddress === coin.tokenAddress)
                );
                console.log('Buffer Array after filtering:', bufferArray);

                // Initialize dpPublished in local storage if it doesn't exist
                let dpPublishedArray = [];
                if (!localStorage.getItem('dpPublished')) {
                    localStorage.setItem('dpPublished', JSON.stringify([]));
                } else {
                    dpPublishedArray = JSON.parse(localStorage.getItem('dpPublished'));
                }

                // Track coins removed from dpPublished
                const removedFromDpPublished = dpPublishedArray.filter(coin =>
                    !bufferArray.some(bufferCoin => bufferCoin.tokenAddress === coin.tokenAddress)
                );

                // Remove coins from dpPublished that are not in bufferArray
                const updatedDpPublished = dpPublishedArray.filter(coin =>
                    bufferArray.some(bufferCoin => bufferCoin.tokenAddress === coin.tokenAddress)
                );

                // Reset isNew flag for existing coins
                updatedDpPublished.forEach(coin => coin.isNew = false);

                // Add coins to dpPublished that are in bufferArray but not in dpPublished
                bufferArray.forEach(bufferCoin => {
                    if (!updatedDpPublished.some(dpCoin => dpCoin.tokenAddress === bufferCoin.tokenAddress)) {
                        updatedDpPublished.unshift({ ...bufferCoin, isNew: true }); // Use unshift to maintain LIFO order and add isNew flag
                    }
                });

                // Track newly added blue coins
                const newlyAddedBlue = updatedDpPublished.filter(coin =>
                    !previousDpPublished.some(prevCoin => prevCoin.tokenAddress === coin.tokenAddress)
                );

                // Track coins that moved to addedCoinsArray
                const movedToAddedCoins = addedCoinsArray.filter(coin =>
                    removedFromDpPublished.some(removedCoin => removedCoin.tokenAddress === coin.tokenAddress)
                );

                // Save the updated dpPublished back to local storage and state
                localStorage.setItem('dpPublished', JSON.stringify(updatedDpPublished));
                setDpPublished(updatedDpPublished);
                setPreviousDpPublished(updatedDpPublished);
                setNewlyAddedBlueCoins(newlyAddedBlue);
                setNewlyAddedYellowCoins(movedToAddedCoins);

                console.log('dpPublished:', updatedDpPublished);

                // Track newly added green coins
                const newlyAddedGreen = addedCoinsArray.filter(coin => 
                    !previousAddedCoins.some(prevCoin => prevCoin.tokenAddress === coin.tokenAddress) &&
                    !movedToAddedCoins.some(movedCoin => movedCoin.tokenAddress === coin.tokenAddress)
                );

                setAddedCoins(addedCoinsArray);
                setPreviousAddedCoins(addedCoinsArray);
                setNewlyAddedGreenCoins(newlyAddedGreen);

                console.log('Newly Added Green Coins:', newlyAddedGreen);
                console.log('Newly Added Blue Coins:', newlyAddedBlue);
                console.log('Newly Added Yellow Coins:', movedToAddedCoins);

            } catch (error) {
                console.error('Error updating coins:', error);
            }
        };

        clearLocalStorageOnce(); // Clear local storage once on startup
        updateCoins(); // Initial load
        const intervalId = setInterval(updateCoins, 10000); // Update every 10 seconds

        return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, [previousAddedCoins, previousDpPublished]);

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
                            key={`${coin.tokenAddress}-${coin.isNew}-${index}`} // Ensure re-render when isNew changes
                            coin={coin}
                            id={`coinBox-${coin.tokenAddress}`}
                            isNewBlue={newlyAddedBlueCoins.some(newCoin => newCoin.tokenAddress === coin.tokenAddress)} // Pass the isNew flag to CoinBox
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
                                key={`${coin.tokenAddress}-${index}`} // Ensure unique key
                                coin={coin}
                                id={`coinBox-${coin.tokenAddress}`}
                                isNewGreen={newlyAddedGreenCoins.some(newCoin => newCoin.tokenAddress === coin.tokenAddress)} // Ensure it gets the prop
                                isNewYellow={newlyAddedYellowCoins.some(newCoin => newCoin.tokenAddress === coin.tokenAddress)} // Pass the isNewYellow flag to CoinBox
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Body;

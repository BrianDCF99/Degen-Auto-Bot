import React, { useState, useEffect } from 'react';
import CoinBox from './coinBox/coinBox';
import { addedFetcher, upcomingFetcher } from '../apiGetter/fetcher';
import './body.css';

function Body() {
    const [addedCoins, setAddedCoins] = useState([]);
    const [upcomingCoins, setUpcomingCoins] = useState([]);
    const [dpPublished, setDpPublished] = useState([]); // Keep the useState for dpPublished

    useEffect(() => {
        const clearLocalStorage = () => {
            localStorage.clear();
            console.log('Local storage cleared');
        };
 
        const updateCoins = async () => {
            console.log('Updating coins...');
            try {
                console.log('NEW IMAGES');
                await addedFetcher.updateCoins('http://ec2-3-76-37-115.eu-central-1.compute.amazonaws.com:8083/');
                const addedCoinsData = localStorage.getItem('newImages');
                let addedCoinsArray = [];
                if (addedCoinsData) {
                    addedCoinsArray = JSON.parse(addedCoinsData).reverse();
                    setAddedCoins(addedCoinsArray);
                    console.log('Added Coins:', addedCoinsArray);
                }
                console.log('NEW IMAGES DONE ------');

                console.log('DEX PAID');
                await upcomingFetcher.updateCoins('http://ec2-3-76-37-115.eu-central-1.compute.amazonaws.com:8083/dex');
                const upcomingCoinsData = localStorage.getItem('dexPaid');
                let upcomingCoinsArray = [];
                if (upcomingCoinsData) {
                    upcomingCoinsArray = JSON.parse(upcomingCoinsData).reverse();
                    setUpcomingCoins(upcomingCoinsArray);
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
                        updatedDpPublished.push(bufferCoin);
                    }
                });

                // Save the updated dpPublished back to local storage and state
                localStorage.setItem('dpPublished', JSON.stringify(updatedDpPublished));
                setDpPublished(updatedDpPublished);

                console.log('dpPublished:', updatedDpPublished);
            } catch (error) {
                console.error('Error updating coins:', error);
            }
        };

        clearLocalStorage(); // Clear local storage once on startup
        updateCoins(); // Initial load
        const intervalId = setInterval(updateCoins, 1000); // Update every second

        return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, []);

    // Split coins into rows of 4
    const splitIntoRows = (coins) => {
        const rows = [];
        for (let i = 0; i < coins.length; i += 4) {
            rows.push(coins.slice(i, i + 4));
        }
        return rows;
    };

    const addedRows = splitIntoRows(addedCoins);
    const publishedRows = splitIntoRows(dpPublished); // Use dpPublished for rendering

    return (
        <div className='body-container'>
            <div className='upcoming-container'>
                <div className='title'>
                    <h2>Enhanced Token Info Update</h2>
                </div>
                <div className='upcoming-body'>
                    {publishedRows.map((row, rowIndex) => (
                        <div key={rowIndex} className='row'>
                            {row.map((coin, index) => (
                                <CoinBox
                                    key={index}
                                    coin={coin}
                                />
                            ))}
                        </div>
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
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Body;

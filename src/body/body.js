import React, { useState, useEffect } from 'react';
import CoinBox from './coinBox/coinBox';
import { addedFetcher, upcomingFetcher } from '../apiGetter/fetcher';
import './body.css';

function Body() {
    const [addedCoins, setAddedCoins] = useState([]);
    const [upcomingCoins, setUpcomingCoins] = useState([]);
    const [dpPublished, setDpPublished] = useState([]);
    const [newImageDisplayed, setNewImageDisplayed] = useState([]); // Track displayed coins

    useEffect(() => {

        const updateCoins = async () => {
            console.log('Updating coins...');
            try {
                // Fetch added coins
                await addedFetcher.updateCoins('http://ec2-18-196-105-255.eu-central-1.compute.amazonaws.com:8083/');
                const addedCoinsData = localStorage.getItem('newImages');
                let addedCoinsArray = [];
                if (addedCoinsData) {
                    addedCoinsArray = JSON.parse(addedCoinsData).reverse();
                    setAddedCoins(addedCoinsArray);
                    console.log('Added Coins:', addedCoinsArray);
                }
                console.log('NEW IMAGES DONE ------');

                // Fetch upcoming coins
                await upcomingFetcher.updateCoins('http://ec2-18-196-105-255.eu-central-1.compute.amazonaws.com:8083/dex');
                const upcomingCoinsData = localStorage.getItem('dexPaid');
                let upcomingCoinsArray = [];
                if (upcomingCoinsData) {
                    upcomingCoinsArray = JSON.parse(upcomingCoinsData).reverse();
                    setUpcomingCoins(upcomingCoinsArray);
                    console.log('Upcoming Coins:', upcomingCoinsArray);
                }
                console.log('DEX PAID DONE ------');

                // Filter out coins that have already been added to Image Added
                let bufferArray = upcomingCoinsArray.filter(upComingCoin => !addedCoinsArray.some(addedCoin => addedCoin.tokenAddress === upComingCoin.tokenAddress));
                console.log('Buffer Array:', bufferArray);

                // Initialize dpPublished in local storage if it doesn't exist OR Load if it does exist
                let dpPublishedArray = [];
                if (!localStorage.getItem('dpPublished')) {
                    localStorage.setItem('dpPublished', JSON.stringify([]));
                } else {
                    dpPublishedArray = JSON.parse(localStorage.getItem('dpPublished'));
                }

                // Remove coins from dpPublished that are not in bufferArray (Coins that moved to New Images) and Flash them yellow before removing
                dpPublishedArray = dpPublishedArray.filter(coin => {
                    const isMatch = bufferArray.some(bufferCoin => bufferCoin.tokenAddress === coin.tokenAddress);
                    if (!isMatch && newImageDisplayed.includes(coin.tokenAddress)) {
                        coin.flashYellow(); // Trigger flash yellow
                    }
                    return isMatch;
                });

                // Add coins that are not in dpPublished but are in buffer (New Tokens to show in Enhanced Token Info) and flash them blue after adding
                bufferArray.forEach(bufferCoin => {
                    const isNewToPublish = !dpPublishedArray.some(publishedCoin => bufferCoin.tokenAddress === publishedCoin.tokenAddress);
                    if (isNewToPublish) {
                        dpPublishedArray.push(bufferCoin);
                        bufferCoin.flashBlue(); // Trigger flash blue
                    }
                });

                // Update and save dpPublished
                setDpPublished(dpPublishedArray);
                localStorage.setItem('dpPublished', JSON.stringify(dpPublishedArray));
                console.log('dpPublished:', dpPublishedArray);


                // Update newImageDisplayed and track newly displayed coins
                const newDisplayedCoins = addedCoinsArray.filter(coin =>
                    !newImageDisplayed.some(displayedCoin => displayedCoin.tokenAddress === coin.tokenAddress)
                ).map(coin => coin.tokenAddress);

                setNewImageDisplayed([...newImageDisplayed, ...newDisplayedCoins]);


            } catch (error) {
                console.error('Error updating coins:', error);
            }
        };

        updateCoins(); // Initial load
        const intervalId = setInterval(updateCoins, 1000); // Update every second

        return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, [addedCoins, newImageDisplayed]);

    // Split coins into rows of 4
    const splitIntoRows = (coins) => {
        const rows = [];
        for (let i = 0; i < coins.length; i += 4) {
            rows.push(coins.slice(i, i + 4));
        }
        return rows;
    };

    const addedRows = splitIntoRows(addedCoins);
    const publishedRows = splitIntoRows(dpPublished);

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
                                    flash={coin.isNew} // Apply flash blue animation
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
                                flashGreen={coin.isNewGreen} // Apply flash green animation
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Body;

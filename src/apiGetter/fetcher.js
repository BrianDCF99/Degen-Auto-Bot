class Fetcher {
    constructor(fetchCoinsKey) {
        this.fetchCoinsKey = fetchCoinsKey;
    }

    async fetchNewCoins(apiUrl) {
        try {
            console.log(`Fetching new coins from API: ${apiUrl}`);
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const newCoins = await response.json();
            console.log(`Fetched new coins from ${apiUrl}:`, newCoins);
            return newCoins;
        } catch (error) {
            console.error(`Error fetching new coins from ${apiUrl}:`, error);
            return [];
        }
    }

    readExistingCoins() {
        try {
            console.log(`Reading existing coins from local storage: ${this.fetchCoinsKey}`);
            const data = localStorage.getItem(this.fetchCoinsKey);
            if (!data) {
                console.log(`No data found for ${this.fetchCoinsKey}`);
                return [];
            }
            const coins = JSON.parse(data);
            console.log(`Read existing coins from ${this.fetchCoinsKey}:`, coins);
            return coins;
        } catch (error) {
            console.error(`Error reading coins from ${this.fetchCoinsKey}:`, error);
            return [];
        }
    }

    saveCoins(coins) {
        try {
            console.log(`Saving coins to local storage: ${this.fetchCoinsKey}`);
            localStorage.setItem(this.fetchCoinsKey, JSON.stringify(coins));
            console.log(`Saved coins to ${this.fetchCoinsKey}`);
        } catch (error) {
            console.error(`Error saving coins to ${this.fetchCoinsKey}:`, error);
        }
    }

    async addNewCoins(newCoins) {
        const existingCoins = this.readExistingCoins();
        const existingCoinAddresses = existingCoins.map(coin => coin.tokenAddress);

        const coinsToAdd = newCoins.filter(coin => !existingCoinAddresses.includes(coin.tokenAddress));

        if (coinsToAdd.length > 0) {
            const updatedCoins = [...existingCoins, ...coinsToAdd];
            this.saveCoins(updatedCoins);
            console.log(`Added ${coinsToAdd.length} new coins to ${this.fetchCoinsKey}`);
        } else {
            console.log(`No new coins to add to ${this.fetchCoinsKey}`);
        }
    }

    async updateCoins(apiUrl) {
        console.log(`Starting update for ${apiUrl} and ${this.fetchCoinsKey}`);
        const newCoins = await this.fetchNewCoins(apiUrl);
        if (newCoins.length > 0) {
            await this.addNewCoins(newCoins);
            console.log(`JSON updated for ${this.fetchCoinsKey}`);
        }
    }
}

export default Fetcher;

export const addedFetcher = new Fetcher('newImages');
export const upcomingFetcher = new Fetcher('dexPaid'); // New fetcher for upcoming coins
const coin = document.body.dataset.coin; //Gets the cryptocurrency name from the HTML page so the same JavaScript can be used for Bitcoin, Ethereum and Solana
const apitoken = "CG-ta6bRHmDqhUw2wPB3Ha4MsjC"; //Const means I am creating a variable called apitoken which will call back to my private apitoken which contains all the prices, grpahs, dates, etc from coingecko

const investment = document.getElementById("investment");// Gets the investment number from the cryptocurrency page, which then sends it to coingecko, which then calculates the profit/loss based on the duration of investment
const duration = document.getElementById("duration");//Gets the investment duration from the dropdown area of the cryptocurrency page, which then sends it to coin gecko with the initial investment amount, and finally calculates the result.
const calculate = document.getElementById("calculate"); //This is linked to the button on each cryptocurrency page, which when presses will get the statistics from coingecko and calculate the profit/loss
const result = document.getElementById("result");//This is the area linked to each html cryptocurrency webpage which shows the initial investment, price of crypto at first and then price when sold, shows loss amount and percentage etc

const canvas = document.getElementById("priceChart");//This represents the graph on each html page and draws a 2D graph showing the price going up or down between the allocated time.
const graph = canvas.getContext("2d");//This is to tell coingecko that I would like a 2 dimensional graph

calculate.addEventListener("click", calculateInvestment); //This is so that when I click the calculate button, it actually sends the information and retrieves information from the coin gecko website. This function calculates how much they would have made or lost. The function coded is shown below.

async function calculateInvestment() {//Creates a function called calculateInvestment which calculates cryptocurrency prices and profit/loss based on information given from the user.

    const money = Number(investment.value);

    if (money <= 0) {
        result.innerHTML = "Please enter an investment amount."; //Gets the money amount inputted by the user
        return;//If the number is 0 or lower than 0, then it will show please enter an investment amount
    }

    let days = 7; //Default option, which is one week or 7 days
    //Each option is linked to the day equivalent of the amount because coin gecko calculates it in such a way
    if (duration.value === "1month") { //One month option which is 30 days
        days = 30;
    }

    if (duration.value === "3month") {//Three month option which is 90 days
        days = 90;
    }

    if (duration.value === "6month") {//six month option which is 180 days
        days = 180;
    }

    if (duration.value === "1year") {//one year option which is 365 days
        days = 365;
    }
    //Variable below gets the current date, and then coin gecko determines how long the user wants to invest, and then rewinds the amount of time invested and then calculates the price
    const today = new Date();
    const startDate = new Date();

    startDate.setDate(today.getDate() - days);
    //Converts the dates to timestamps as coingecko only accepts these
    const startTime = Math.floor(startDate.getTime() / 1000);
    const endTime = Math.floor(today.getTime() / 1000);

    const url = //Getting the cryptocurrency price from the URL coingecko gave me initially when signing up
        "https://api.coingecko.com/api/v3/coins/" + coin + "/market_chart/range" +
        "?vs_currency=usd" + //Default currency is USD 
        "&from=" + startTime +//Start date
        "&to=" + endTime +//End date
        "&x_cg_demo_api_key=" + apitoken;//Send to this API token

    result.innerHTML = "Loading...";//Loading text as the data given from coin gecko is not instant

    try {

        const response = await fetch(url);//Gets the information from the internet

        if (!response.ok) {
            throw new Error("API request failed, please try again"); //Error message for if the fetch request even went through. 
        }

        const data = await response.json();//Waits for the information to come back

        if (!data.prices || data.prices.length === 0) {
            throw new Error("No price data available, please try again"); //Error message for when the fetch message went through but no data came back.
        }

        const prices = data.prices;//Analyses the prices
        const startingPrice = prices[0][1];//This variable means that the coin gecko needs to give the prices. 0 means first price, and 1 means price after the date
        const currentPrice = prices[prices.length - 1][1];//Price length and the 1 means to give me the latest cryptocurrency price that coin gecko has

        const bitcoinBought = money / startingPrice;//Calculates the cryptocurrency that the user would have got. An example being if cryptocurrency was worth 50,000 and the user invested 25,000, it would be 0.5 cryptocurrency

        const finalValue = bitcoinBought * currentPrice;//Calculates value of the cryptocurrency that the user would of had, and multiplies it to the current price and that would be the money they would have now

        const profit = finalValue - money;//Initial value - the final value which gives profit/loss amount

        const percentage = (profit / money) * 100;// Multiply the profit over total money invested and then multiply it by 100 to get the percentage amount

        const coinName = coin.charAt(0).toUpperCase() + coin.slice(1);//Changes the cryptocurrency name so that it can be displayed correctly in the results.

        //The Code below shows all the money and number amounts that the user would need, and displays it under price history on the html pages
        result.innerHTML = `
        <h2>Results</h2>
        <p>${coinName} Starting Price: $${startingPrice.toFixed(2)}</p>
        <p>${coinName} Current Price: $${currentPrice.toFixed(2)}</p>
        <p>${coinName} Bought: ${bitcoinBought.toFixed(6)}</p>
        <p>Final Value: $${finalValue.toFixed(2)}</p>
        <p>Profit/Loss: $${profit.toFixed(2)}</p>
        <p>Return: ${percentage.toFixed(2)}%</p>
    `;

        drawGraph(prices); //Drawing the 2D graph

    } catch (error) {
        result.innerHTML = "Unable to retrieve price data. Please try again later.";
        //Shows an error message if the API cannot retrieve the price data.
    }
}

function drawGraph(prices) {

    graph.clearRect(0, 0, canvas.width, canvas.height);//Clear the graph first so that the user can input different investments without reloading the page

    const padding = 25;//Space around the edges

    const graphWidth = canvas.width - padding * 2;//Width
    const graphHeight = canvas.height - padding * 2;//Height
    //Code belows finds the highest price and lowest price and puts it on the Y axis of the graph
    let highestPrice = 0;
    let lowestPrice = prices[0][1];
    //Goes through every single price in the time frame and draws the graph.
    for (let i = 0; i < prices.length; i++) {

        const price = prices[i][1];

        if (price > highestPrice) {
            highestPrice = price;
        }

        if (price < lowestPrice) {
            lowestPrice = price;
        }
    }
    //Code below finds the first and last date of investment
    graph.beginPath();

    for (let i = 0; i < prices.length; i++) {

        const x = //X axis information
            padding +
            (i / (prices.length - 1)) * graphWidth;

        const y = //Y axis information
            padding +
            graphHeight -
            ((prices[i][1] - lowestPrice) /
                (highestPrice - lowestPrice)) *
            graphHeight;
        //Connecting each of the points of the graph with lines
        if (i === 0) {
            graph.moveTo(x, y);
        } else {
            graph.lineTo(x, y);
        }
    }
    // Making the lines visible and the colour/font of the words displayed
    graph.strokeStyle = "#006282";
    graph.lineWidth = 3;
    graph.stroke();
    //Prices displayed
    graph.fillStyle = "#006282";
    graph.font = "14px Arial";
    //Highest price at the top of Y axis
    graph.fillText(
        "$" + highestPrice.toFixed(2),
        5,
        padding
    );
    //Lowest price at the bottom of Y axis
    graph.fillText(
        "$" + lowestPrice.toFixed(2),
        5,
        canvas.height - padding
    );
    //First date at the left side of the X axis
    graph.fillText(
        new Date(prices[0][0]).toLocaleDateString(),
        padding,
        canvas.height - 10
    );
    //Last date at the right side of the X axis
    graph.fillText(
        new Date(prices[prices.length - 1][0]).toLocaleDateString(),
        canvas.width - 100,
        canvas.height - 10
    );
}
const puppeteer = require('puppeteer');
var html2json = require('html2json').html2json;
const {words} = require("./words.json");
let checkWords = words.split(' ');

// sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// function to remove duplicates from an array
function removeDuplicates(arr) {
    return arr.filter((item,
        index) => arr.indexOf(item) === index);
}

async function wordle() {
    // initialization
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto('https://www.nytimes.com/games/wordle/index.html');
    await page.click("body > div > div > dialog > div > button > svg");
    await sleep(1000)
    
    // 5 words are guessed before the bot guesses the last word
    // you can change the words here according to your algorithm
    // a few words might not be in the words.json you would need to update them manually
    let newWordsList = ['vault', 'hinge', 'toxic', 'brown', 'squad']
    for(newWord of newWordsList){
        await page.keyboard.type(newWord);
        await page.keyboard.press('Enter');
        await sleep(3000)

    }

    // assigning empty arrays to store information about the alphabets inserted
    let alphabets = [];
    let checkAlphabets = [];

    // scrape the page info
    let checks = await page.$$('div.Tile-module_tile__UWEHN');
    await sleep(3000)

    for(let check of checks){
        try {
            // taking out the html
            let html = await (await check.getProperty('outerHTML')).jsonValue();
            // converted the html into a json using html2json pkg
            let json = html2json(html);
            // mapping towards alphabets and pushing them to an array
            if(json.child[0].attr['data-state']=="present" || json.child[0].attr['data-state']=="correct"){
                let alpha = json.child[0].attr['aria-label'][0];
                alphabets.push(alpha);
            }
        }
        catch(e) {
            console.log(e.message);
        }
    }

    // using the function to remove the duplicates and sorting it
    let newAlphabets = removeDuplicates(alphabets.sort())
    console.log(newAlphabets);
    // for each word in the given word list if all the alphabets are in a word it return the given word
    checkWords.forEach((e)=>{
        if(newAlphabets.every(el => e.includes(el))){
            console.log(e)
            checkAlphabets.push(e)
        }
    })
    console.log(checkAlphabets)

    // guessing the last word
    for(newAlphabet of checkAlphabets){
        await page.keyboard.type(newAlphabet);
        await page.keyboard.press('Enter');
        await sleep(3000)

    }

}

wordle();

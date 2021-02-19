//These arrays are used for storing and working with received data from the API
let dog_arr = new Array(); //holds all data about the dogs from the API
let splitted_breeds_arr = new Array(); //sorted array of breeds with 10 dog breed names per index
let cur_open_cards_arr = new Array(); //array which holds current selected cards
let cur_breed_selection_arr = new Array();//current selection of checked breed checkboxes

//These variables cannot be modified and are responsible for the game logic
let cur_breeds_index = 0; //Default index value for splitted breeds arr
let playset_pairs = 0; //Variable which holds playssets
let tried_pairs = 0; //Varibale which counts how many pairs were selected
let correct_selected_pairs = 0; //Variable which counts how many correct pairs were selected
let countDown = 0 //Placeholder for the countdown
let highscore = { 'easy': 'No game played!', normal: 'No game played!', 'hard': 'No game played!' }; //Object holding the highscore of the game

//These variables are game parameters and can be modified, but please select integer > 0  
let breed_pack_size = 10; //Varibale which shows how many different breews should be displayed at once to the user
let easy = 4; //Variable that says how many pairs an easy game has
let normal = 6; //Variable that says how many pairs an normal game has
let hard = 9; //Variable that says how many pairs an hard game has

//Receive the breeds as fast as possible from the API
document.addEventListener("DOMContentLoaded", function (event) {
    getBreedsFromAPI();
    getSavedHighscores();
});

//Getting all Breeds from the API 
let getBreedsFromAPI = async function () {
    try {
        let response = await fetch("https://api.thedogapi.com/v1/breeds")
        let breeds = await response.json()
        splitBreeds(breeds);
    }
    catch (error) {
        console.log("error", error);
        alert("Something went wrong. Please try again!");
    }
}

//Split all breeds to one array which contains maximum 10 breeds at one array index
let splitBreeds = function (breeds) {
    //Split the breeds to the given maximum breed_pack_size
    for (var i = 0; i < breeds.length; i = i + breed_pack_size) {
        splitted_breeds_arr.push(breeds.slice(i, i + breed_pack_size));
    }
    //console.log(splitted_breeds_arr);
    printBreedsToHTML();
}

//Attach the received breeds to the corresponding HTML section
let printBreedsToHTML = function () {
    //Variable to hold current HTML which needs to be printed to the website
    let breedsHTML = "";
    //Array which holds maxium 10 different dog breeds to print
    let dog_breeds_to_print_arr = new Array();

    for (let i = 0; i < splitted_breeds_arr.length; i++) {
        //Pass current breed selection from splitted breeds array which holds all breeds to helper array (dog_breeds_to_print_arr)
        dog_breeds_to_print_arr = splitted_breeds_arr[i];

        //Creating Bootstrap carousel items with maximum 10 different breeds
        breedsHTML = breedsHTML +
            `<div class="carousel-item" id="breed-list-${i}">
             <div class="breeds_checkbox" >`;
        for (let breed of dog_breeds_to_print_arr) {
            //console.log(breed_name);
            breedsHTML = breedsHTML +
                `<div>
            <input type="checkbox" name="breeds" id="${breed.id}" value="${breed.name}" onchange="breedChanged(this)" />
            <label for="${breed.id}">${breed.name}</label>
            </div>`;
        }
        breedsHTML = breedsHTML + `</div></div>`;
    }
    //Checking if enough breeds are available,if yes print them to the website, the first breed list will be printed defaultly by index
    document.getElementById("breeds-carousel").innerHTML = breedsHTML;
    if (splitted_breeds_arr.length > 0) {
        document.getElementById("breed-list-0").classList.add('active');
    } else {
        document.getElementById("breeds-carousel").innerHTML = "No breeds are available!";
    }
}

//Get dogs based on their breed id and their limit or gets completely random dogs by limit
let getDogs = async function getDogs(requested_dog_pairs, requested_breed_id) {
    //console.log("Requested dog amount: " + requested_dog_pairs);
    //console.log("Requested breed id: " + requested_breed_id);
    let query_string = "";
    if (requested_breed_id == undefined) {
        query_string = `https://api.thedogapi.com/v1/images/search?limit=${requested_dog_pairs}&mime_types=jpg&size=thumb`;
    }
    else {
        query_string = `https://api.thedogapi.com/v1/images/search?limit=${requested_dog_pairs}&mime_types=jpg&size=thumb&breed_id=${requested_breed_id}`;
    }
    let received_dogs = new Array();
    try {
        let response = await fetch(query_string);
        received_dogs = await response.json()
        //Push each dog to an array to access later
        for (let dog of received_dogs) {
            dog_arr.push(dog)
        }
        //  console.log("received_dogs.length: " + received_dogs.length);
        //  console.log("requested_dog_pairs: " + requested_dog_pairs);
        //  console.log("requested_breed_id: " + requested_breed_id);
        canGameStart(received_dogs.length, requested_dog_pairs);
    }
    catch (error) {
        console.log("error", error);
        alert("Something went wrong. Please try again!");
    }
}

//Check if the game can start and dynamically print how much more breeds are required to start a game
//If enough breeds are received the game can start, otherwise an error will be displayed with the needed amount of dogs
let canGameStart = async function (received_dogs_length, requested_dog_pairs) {
    //Not enough dog cards received
    if (received_dogs_length < requested_dog_pairs) {
        document.getElementById("breeds_error").innerHTML = "The current selection of breeds does not provide enough playcards!"
    }
    //Enough dog cards are received, progress with subsequent code
    if (playset_pairs == dog_arr.length) {
        document.getElementById("breeds_error").innerHTML = "";
        document.getElementById("breeds_difference").innerHTML = "";
        duplicateDogCards();
        shuffleDogCards();
        printDogCardsToHTML();
        startCountDown();
    } //Specify how many more breeds are required to start a game
    else if (playset_pairs > dog_arr.length) {
        let difference = playset_pairs - dog_arr.length;
        let msg = "";
        if (difference == 1) {
            msg = "You need 1 more dog!"
        } else {
            msg = `You need ${difference} more dogs!`;
        }
        document.getElementById("breeds_difference").innerHTML = "Please select additional breeds or lower game difficulty: " + msg;
    }
}

let duplicateDogCards = function () {
    dog_arr = [...dog_arr, ...dog_arr];
}

//Own implementation of Fisher Yates shuffle adapted from https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm (last accessed 2021-02-18)
let shuffleDogCards = function () {
    let a, b, i;
    for (i = dog_arr.length - 1; i > 0; i--) {
        a = Math.floor(Math.random() * (i + 1));
        b = dog_arr[i];
        dog_arr[i] = dog_arr[a];
        dog_arr[a] = b;
    }
}

//Atach the received breeds as dogcards to the corresponding HTML
let printDogCardsToHTML = function () {
    let dog_cards = "";
    let card_id = 1;
    for (let dog of dog_arr) {
        //console.log("DogId: " + dog[0].id);
        //console.log("Url: " + dog[0].url);
        dog_cards = dog_cards +
            `<div class="flip-card m-2">
            <div class="flip-card-inner ${dog.id}" id="card-${card_id}" onclick="card_clicked(this)">
                <div class="front">
                    <img src="doggo.jpg">
                </div>
                <div class="back">
                    <img src="${dog.url}">
                </div>
            </div>
        </div>`
        card_id++;
    }
    document.getElementById("dog_cards").innerHTML = "";
    document.getElementById("dog_cards").innerHTML = dog_cards;
}

//dynmically setting the countdown linked to the game diffulty
let startCountDown = async function () {
    //Wait until the the progressbar is loaded
    await new Promise(p => { setTimeout(p, 500); document.getElementById("progressBar").style = `width: 100%`; });
    let playtime = playset_pairs * 80;
    //console.log("Playtime left: " + playtime);
    let timestart = playtime;
    let timeleft = playtime;

    countDown = setInterval(function () {
        timeleft = timeleft - 1;
        let width = timeleft / timestart * 100;
        //console.log("width: " + width);
        //console.log("timeleft: " + timeleft / 10 + "s");
        document.getElementById("progressBar").style = `width: ${width}%`;
        //When the timer has ended, stop the game and reset
        if (timeleft < 0) {
            resetCountdown()
            //console.log("Timer is finished");
            resetGame("The game time is over!");
        }
    }, 100);
}

//Clearing the timing process visually and logically
let resetCountdown = function () {
    clearInterval(countDown);
    document.getElementById("progressBar").style = "width: 0%";
}

//Incrementing the current breeds index 
let previousBreed = function () {
    //console.log("Previous breeds");
    document.getElementById(`breed-list-${cur_breeds_index}`).classList.remove('active');
    cur_breeds_index--;
    shiftBreedsList(cur_breeds_index);
}

//Decrementing the current breeds index 
let nextBreed = function () {
    //console.log("Next breeds");
    document.getElementById(`breed-list-${cur_breeds_index}`).classList.remove('active');
    cur_breeds_index++;
    shiftBreedsList(cur_breeds_index);
}

//Shifting the Bootstrap to the requested breeds list containing maximum 10 breeds
let shiftBreedsList = function (breeds_index) {
    //If no breeds index is specified, set the breeds index to 0
    if (breeds_index == undefined) {
        cur_breeds_index = 0;
    } //Setting the index from the beginning of the list to the end by index
    else if (breeds_index == -1) {
        cur_breeds_index = splitted_breeds_arr.length - 1;
    }//Setting the index from the end of the list to the beginning by index
    else if (breeds_index > splitted_breeds_arr.length - 1) {
        cur_breeds_index = 0;
    }//The current breed index is somewhere between the beginning and the end of the list
    else {
        cur_breeds_index = breeds_index;
    }
    document.getElementById(`breed-list-${cur_breeds_index}`).classList.add('active');
}

//Triggers when a breed is selected from the checkboxes and assign selected breed id and breed name to an array
let breedChanged = function (el) {
    //When a checkbox is checked
    if (el.checked) {
        cur_breed_selection_arr.push({ "id": el.id, "name": el.value });
    }
    else {//When a checkbox is not checked anymore, delete the breed from current breed selection
        for (let i = 0; i < cur_breed_selection_arr.length; i++) {
            if (cur_breed_selection_arr[i].id == el.id) {
                to_uncheck_breed_by_id = i;
                cur_breed_selection_arr.splice(i, 1);
                break;
            }
        }
    }
    printSelectedBreedsToHTML();
}

//Creates the current checkbox breeds selecection as string and prints it to the website
let printSelectedBreedsToHTML = function () {
    let selected_breeds = "Selected breeds: ";
    for (let breed of cur_breed_selection_arr) {
        selected_breeds = selected_breeds + " " + breed.name + ",";
    }
    //remove last "," from string
    selected_breeds = selected_breeds.slice(0, -1);
    document.getElementById("selected_breeds").innerHTML = selected_breeds;
}

//Returns an array consisting out of current selected checkbox breed ids 
let getCurrentSelectedBreedsIDs = function () {
    let breeds_id_arr = new Array()
    for (let breed of cur_breed_selection_arr) {
        breeds_id_arr.push(breed.id);
    }
    return breeds_id_arr;
}

//Handles when cards a clicked by their class attributes
let card_clicked = function (element) {
    //If a matched card is selected, invoke the function to show the corresponding breed information
    if (element.classList.contains("matched-card")) {
        showBreedInformation(element);
        return;
    }
    //Always push the first opened card to the array holding current opened cards
    if (cur_open_cards_arr.length == 0) {
        cur_open_cards_arr.push(element);
        openCard(element);
    }
    else if (cur_open_cards_arr.length == 1) {
        //Do not allow the user to reselect already selected cards
        if (element.id == cur_open_cards_arr[0].id) {
            //console.log("Check 2- Already selected card: " + element.id == cur_open_cards_arr[0].id);
        } else {//A new card can be pushed to the array holding current opened card for comparison purposes
            cur_open_cards_arr.push(element);
            openCard(element);
            //Set a timeout to leave both cards open for one second before checking match
            setTimeout(checkMatch, 1000);
        }
    }
}

//Check if both cards match 
let checkMatch = function () {
    //Both cards match by their second class index 
    if (cur_open_cards_arr[0].classList[1] == cur_open_cards_arr[1].classList[1]) {
        //console.log("Match");
        correct_selected_pairs++;
        tried_pairs++;
        document.getElementById("tried_pairs").innerHTML = tried_pairs;
        withdrawCardMatch(cur_open_cards_arr[0]);
        withdrawCardMatch(cur_open_cards_arr[1]);
        checkGameIsOver();
    }//Both cards match not by their second class index 
    else if (cur_open_cards_arr[0].classList[1] != cur_open_cards_arr[1].classList[1]) {
        closeCard(cur_open_cards_arr[0]);
        closeCard(cur_open_cards_arr[1]);
        tried_pairs++;
        document.getElementById("tried_pairs").innerHTML = tried_pairs;
    }
    cur_open_cards_arr = []; //cur_open_arr has is not referenced anywhere, deleting content like this is okay
}

//Open a card and assign correspoding status by class
let openCard = function (element) {
    //console.log("Open Card: " + element.id);
    //console.log("Open Cardlgiz: " + cur_open_cards_arr[0].id);
    document.getElementById(element.id).classList.remove('close-card');
    document.getElementById(element.id).classList.add('open-card');
}

//Close a card and assign correspoding status by class
let closeCard = function (element) {
    //console.log("Close Element: " + element.id);
    document.getElementById(element.id).classList.remove('open-card');
    document.getElementById(element.id).classList.add('close-card');
}

//Withdraw a card and assign correspoding status by class
let withdrawCardMatch = function (element) {
    //console.log("Close Element because of Match: " + element.id);
    document.getElementById(element.id).classList.add('matched-card');
}

//Check if the game is already over and progress further if so
let checkGameIsOver = function () {
    //console.log("Correct selected pairs: " + correct_selected_pairs);
    //console.log("Pairs: " + playset_pairs);
    if (correct_selected_pairs == playset_pairs) {
        resetCountdown();
        if (checkHighscore()) {
            saveHighScore()
        }
        alert("The Game is over! You won!");
    }
}

//Save the highscore to the localstorare
let saveHighScore = function () {
    localStorage.setItem('savedHighscores', JSON.stringify(highscore))
}

//Get the highscore from the localstorage
let getSavedHighscores = function () {
    saved_highscore = JSON.parse(localStorage.getItem('savedHighscores'));
    if (saved_highscore != null) {
        document.getElementById("highscore_easy").innerHTML = "Highscore - Easy: " + saved_highscore.easy + " ";
        document.getElementById("highscore_normal").innerHTML = "Highscore - Normal: " + saved_highscore.normal + " ";
        document.getElementById("highscore_hard").innerHTML = "Highscore - Hard: " + saved_highscore.hard + " ";
        highscore.easy = saved_highscore.easy;
        saved_highscore.normal = saved_highscore.normal;
        saved_highscore.hard = saved_highscore.hard;
    }
}

//Check if the user has beaten the current highscore
let checkHighscore = function () {
    switch (playset_pairs) {
        case easy:
            if (highscore.easy == "No game played!" || highscore.easy > tried_pairs) {
                highscore.easy = tried_pairs;
                document.getElementById("highscore_easy").innerHTML = "Highscore - Easy: " + highscore.easy + " ";
                return true;
            }
            break;
        case normal:
            if (highscore.normal == "No game played!" || highscore.normal > tried_pairs) {
                highscore.normal = tried_pairs;
                document.getElementById("highscore_normal").innerHTML = "Highscore - Normal: " + highscore.normal + " ";
                return true;
            }
            break;
        case hard:
            if (highscore.hard == "No game played!" || highscore.hard > tried_pairs) {
                highscore.hard = tried_pairs;
                document.getElementById("highscore_hard").innerHTML = "Highscore - Hard: " + highscore.hard + " ";
                return true;
            }
            break;
        default:
            console.log("Could not figure out difficulty!");
    }
    return false;
}

//when the start button is cliked
let startGame = function () {
    resetPriorEachGame();
    let game_difficulty = document.getElementById("difficulty").value;
    switch (game_difficulty) {
        case "easy":
            playset_pairs = easy;
            break;
        case "normal":
            playset_pairs = normal;
            break;
        case "hard":
            playset_pairs = hard;
            break;
        default:
            alert("Eror while specifying pairs. Default selection is easy");
            playset_pairs = easy;
    }
    buildDogAPICall();
}

//Building API calls based on current selected game settings
let buildDogAPICall = function () {
    let breeds = getCurrentSelectedBreedsIDs();
    let neededCards = playset_pairs;
    if (breeds.length == 0) {
        getDogs(neededCards);
        return;
    }

    // Array holding the limit and breed id at each index to minimize the amount of API requests
    let API_call_arr = new Array();

    //fill the API call array with the breeds ids and set the limit for all breeds to zero
    for (let breed_id of breeds) {
        //console.log("BreedID: " + breed_id);
        API_call_arr.push({ limit: 0, id: breed_id });
    }

    //Iterating through the API call array and allocation the correct limit for each breed
    var limitplus = 1;
    while (limitplus == 1) {
        for (let index in API_call_arr) {
            if (neededCards == 0) {
                limitplus = 0;
            }
            API_call_arr[index].limit = API_call_arr[index].limit + limitplus
            neededCards--
        }
    }

    //Requesting the breeds based on their limit and their id
    for (let i = 0; i < API_call_arr.length; i++) {
        if (API_call_arr[i].limit > 0) {
            getDogs(API_call_arr[i].limit, API_call_arr[i].id)
        } else {
            //Sorry no Api calls for breed_ids with limit = 0
        }
    }
}

//Reset individual game properties
let resetPriorEachGame = function () {
    resetCountdown();
    document.getElementById("dog_cards").innerHTML = "";
    correct_selected_pairs = 0;
    tried_pairs = 0;
    document.getElementById("tried_pairs").innerHTML = 0;
    dog_arr = [];
    cur_open_cards_arr=[];
    document.getElementById("start_btn").disabled = true;
}

//Handling a complete reset of the game
let resetGame = function (alert_message) {

    resetPriorEachGame();
    document.getElementById("start_btn").disabled = false;

    //Properties linked to breed selection
    cur_breed_selection_arr = []
    document.getElementById("selected_breeds").innerHTML = "Selected breeds:";
    cur_breeds_index = 0
    printBreedsToHTML();
    document.getElementById("breeds_error").innerHTML = "";
    document.getElementById("breeds_difference").innerHTML = "";

    //Triggering an alert if requested
    if (alert_message != null) {
        alert(alert_message + " The game will be reset!");
    }
}

//Check which breed info was is requested and push it to the array asked_breed_info
let showBreedInformation = function (element) {
    let asked_breed_info = new Array();
    for (let i = 0; i < dog_arr.length; i++) {
        if (dog_arr[i].id == element.classList.item(1)) {
            asked_breed_info = dog_arr[i].breeds;
            printBreedsInfoToModalHTML(asked_breed_info);
            return;
        }
    }
}

//Attach the breeds info to the HTML modal but previously check if breeds info is available
let printBreedsInfoToModalHTML = function (asked_breed_info) {
    let obj = asked_breed_info[0];

    document.getElementById("modal_content").innerHTML = "";
    let el = document.getElementById("modal_content");
    let title = document.createElement("h3");

    //Check if breeds information is empty
    if (obj == undefined) {
        //console.log("Breeds info undefined!");
        title.innerHTML = "Breeds info not available!";
        el.appendChild(title);
    } //Handling available breed information
    else {
        title.innerHTML = asked_breed_info[0].name;
        el.appendChild(title);
        for (var key in obj) {
            let p1 = document.createElement("p");
            // console.log(key + ": ");
            p1.innerHTML = "<b>" + removeUnderscore(key) + "</b>" + ": ";
            el.appendChild(p1);
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                for (let key2 in obj[key]) {
                    let p2 = document.createElement("p");
                    // console.log(key2 + ": ", obj[key][key2]);
                    p2.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;<b>" + removeUnderscore(key2) + "</b>" + ": " + obj[key][key2];
                    el.appendChild(p2);
                }
            } else {
                p1.innerHTML = "<b>" + removeUnderscore(key) + "</b>" + ": " + obj[key];
                el.appendChild(p1);
                // console.log(obj[key]);
            }
        }
    }
    openModal();
}

//Improve readability of breed attribute description by removing underscore
let removeUnderscore = function (key) {
    return key.replace(/[^a-z]/g, ' ');
}

//Define the model and make it accessible
let modal = document.getElementById("breedsModal");

//Open the modal which contains the breed information
let openModal = function () {
    modal.style.display = "block";
}

//Closing the model with a click outside the model
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
// flip card: https://www.w3schools.com/howto/howto_css_flip_card.asp
var dog_arr = new Array(); //Uncaught SyntaxError: redeclaration of let
var dog_breeds_arr = new Array();
var splitted_breeds_arr = new Array(); // sorted array of breeds with 10 dog breed names per index
var cur_open_cards_arr = new Array();

var cur_breeds_index = 0; //Default index value for splitted breeds arr
var playset_pairs = 0;
var tried_pairs = 0;
var correct_selected_pairs = 0;

//user input related data and functions
var highscore = { easy: "No game played!", normal: "No game played!", hard: "No game played!" };

//Get random dogs
async function getDogs(req_dog_amount) {
    //requested different dogs
    console.log("Requested dog amount: " + req_dog_amount);
    for (let i = 0; i < req_dog_amount; i++) {
        try {
            let response = await fetch("https://api.thedogapi.com/v1/images/search")
            let dog = await response.json()
            dog_arr.push(dog);
        }
        catch (error) {
            console.log("error", error);
        }
    }
    printDogAll();
    duplicateDogCards()
    shuffleDogCards();
    printDogCards();
}

getBreeds()
async function getBreeds() {
    try {
        let response = await fetch("https://api.thedogapi.com/v1/breeds")
        let breeds = await response.json()
        splitBreeds(breeds);
    }
    catch (error) {
        console.log("error", error);
    }

    printBreeds();
}


function splitBreeds(breeds) {
    //Get all breed names in one arry independently from the amount of different breeds
    for (let i = 0; i < breeds.length; i++) {
        dog_breeds_arr.push(breeds[i].name);
    }
    console.log(dog_breeds_arr);

    //Create an new array() for at least 10 breeds(breed_pack_size) at each index and fill it 
    let breed_pack_size = 10;
    for (var i = 0; i < dog_breeds_arr.length; i = i + breed_pack_size) {
        splitted_breeds_arr.push(dog_breeds_arr.slice(i, i + breed_pack_size));
    }
    console.log(splitted_breeds_arr);
    let dogfourtytwo = splitted_breeds_arr[3][1];
    console.log(dogfourtytwo);


}

function previousBreed() {
    console.log("previous");
    document.getElementById(`breed-list-${cur_breeds_index}`).classList.remove('active');
    cur_breeds_index--;
    shiftBreedsList(cur_breeds_index);
}

function nextBreed() {
    console.log("next");
    document.getElementById(`breed-list-${cur_breeds_index}`).classList.remove('active');
    cur_breeds_index++;
    shiftBreedsList(cur_breeds_index);
}

function shiftBreedsList(breeds_index){
    //If no breeds_index is specified, set default to current breeds index to 0
    if (breeds_index == undefined) {
        console.log("Breeds index set 0");
        cur_breeds_index = 0;
    } else if (breeds_index == -1) {
        console.log("Breeds index set end of list");
        cur_breeds_index = splitted_breeds_arr.length - 1;
    }
    else if (breeds_index > splitted_breeds_arr.length - 1) {
        console.log("Breeds index set beginning of list");
        cur_breeds_index = 0;
    } else {
        console.log("Breeds index set value between beginning and end");
        cur_breeds_index = breeds_index;
    }
    document.getElementById(`breed-list-${cur_breeds_index}`).classList.add('active');
}

function printBreeds() {

    let dog_breeds_to_print_arr = new Array();
    dog_breeds_to_print_arr = splitted_breeds_arr[cur_breeds_index];

    let breedsHTML = "";

    //<div class="breeds" id="breeds-list-"></div>
    for (let i = 0; i < splitted_breeds_arr.length; i++) {
        let dog_breeds_to_print_arr = new Array();
        dog_breeds_to_print_arr = splitted_breeds_arr[i];

        breedsHTML = breedsHTML +
            `<div class="carousel-item" id="breed-list-${i}">
             <div class="breeds" >`;
        for (let breed_name of dog_breeds_to_print_arr) {
            //console.log(breed_name);
            breedsHTML = breedsHTML +
                `
            <div>
            <input type="checkbox" id="${breed_name}" name="${breed_name}" value="${breed_name}">
            <label for="${breed_name}">${breed_name}</label>
            </div>`;
        }
        breedsHTML = breedsHTML + `</div></div>`;
    }


    // for (let breed_name of dog_breeds_to_print_arr) {
    //     console.log(breed_name);
    //     breedsHTML = breedsHTML +
    //     `<div>
    //     <input type="checkbox" id="${breed_name}" name="${breed_name}" value="${breed_name}">
    //     <label for="${breed_name}">${breed_name}</label>
    //     </div>`;
    // }
    console.log(breedsHTML);
    document.getElementById("breeds-carousel").innerHTML = breedsHTML;
    document.getElementById("breed-list-0").classList.add('active');
}


function printDog(data) {
    console.log(data)
    document.getElementById("dogtest").innerHTML = JSON.stringify(data, null, 1)
}

function printDogAll() {
    console.log(dog_arr);
    for (let i = 0; i < dog_arr.length; i++) {
        console.log(dog_arr[i][0].id);
    }
}

function duplicateDogCards() {
    dog_arr = [...dog_arr, ...dog_arr];
}

//Own implementation of Fisher Yates shuffle -> https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
function shuffleDogCards() {
    let a, b, i;
    for (i = dog_arr.length - 1; i > 0; i--) {
        a = Math.floor(Math.random() * (i + 1));
        b = dog_arr[i];
        dog_arr[i] = dog_arr[a];
        dog_arr[a] = b;
    }
}

function printDogCards() {
    let dog_cards = "";
    let card_id = 1;
    for (let dog of dog_arr) {
        //console.log("DogId: " + dog[0].id);
        //console.log("Url: " + dog[0].url);
        dog_cards = dog_cards +
            `<div class="flip-card m-2" style="width:150px;height:150px;">
            <div class="flip-card-inner ${dog[0].id}" id="${card_id}" onclick="card_clicked(this)">
                <div class="front">
                    <img src="doggo.jpg" style="width:150px;height:150px;">
                </div>
                <div class="back">
                    <img src="${dog[0].url}" style="width:150px;height:150px;">
                </div>
            </div>
        </div>`
        card_id++;
    }
    document.getElementById("dog_cards").innerHTML = "";
    document.getElementById("dog_cards").innerHTML = dog_cards;
}

function card_clicked(element) {
    //Matched Card are not processed further (Ignoring of matched cards)
    if (element.classList.contains("matched-card")) {
        console.log("Check 1 - Already Matched card: " + element.classList.contains("matched-card")); // does not print to the console? -> Review the check in log
        return;
    }
    //push card to the array
    if (cur_open_cards_arr.length == 0) {
        cur_open_cards_arr.push(element);
        openCard(element);
    } else if (cur_open_cards_arr.length == 1) {
        //Already selected card also does not count and will be ignored
        if (element.id == cur_open_cards_arr[0].id) {
            console.log("Check 2- Already selected card: " + element.id == cur_open_cards_arr[0].id);
            return;
        }
        cur_open_cards_arr.push(element);
        openCard(element);
        setTimeout(checkMatch, 1000);
    }
}


function checkMatch() {
    if (cur_open_cards_arr[0].classList[1] == cur_open_cards_arr[1].classList[1]) {
        console.log("Match");
        correct_selected_pairs++;
        tried_pairs++;
        document.getElementById("tried_pairs").innerHTML = tried_pairs;
        withdrawCardMatch(cur_open_cards_arr[0]);
        withdrawCardMatch(cur_open_cards_arr[1]);
        checkGameIsOver();
    }
    else if (cur_open_cards_arr[0].classList[1] != cur_open_cards_arr[1].classList[1]) {
        closeCard(cur_open_cards_arr[0]);
        closeCard(cur_open_cards_arr[1]);
        tried_pairs++;
        document.getElementById("tried_pairs").innerHTML = tried_pairs;
    }
    //tried_pairs++; // creates addiotional try after match end
    cur_open_cards_arr = []; //cu_open_arr has is not referenced anywhere, deleting content like this is okay
    //document.getElementById("tried_pairs").innerHTML = tried_pairs;
}

function openCard(element) {
    //Do not allow to open the same card twice
    console.log("Open Card: " + element.id);
    console.log("Open Cardlgiz: " + cur_open_cards_arr[0].id);
    document.getElementById(element.id).classList.remove('close-card');
    document.getElementById(element.id).classList.add('open-card');
}

function closeCard(element) {
    console.log("Close Element: " + element.id);
    document.getElementById(element.id).classList.remove('open-card');
    document.getElementById(element.id).classList.add('close-card');
}

function withdrawCardMatch(element) {
    console.log("Close Element because of Match: " + element.id);
    document.getElementById(element.id).classList.add('matched-card');
}

function checkGameIsOver() {
    console.log("Correct selected pairs: " + correct_selected_pairs);
    console.log("Pairs: " + playset_pairs);
    if (correct_selected_pairs == playset_pairs) {
        checkHighscore();
        alert("The Game is over! You won!");
    }
}

function checkHighscore() {
    console.log("Checking High Score")
    switch (playset_pairs) {
        case 4:
            playset_pairs = 4;
            if (highscore.easy == "No game played!" || highscore.easy > tried_pairs) {
                highscore.easy = tried_pairs;
                document.getElementById("highscore_easy").innerHTML = "Highscore - Easy: " + highscore.easy + " ";
            }
            break;
        case 6:
            if (highscore.normal == "No game played!" || highscore.normal > tried_pairs) {
                highscore.normal = tried_pairs;
                document.getElementById("highscore_normal").innerHTML = "Highscore - Normal: " + highscore.normal + " ";
            }
            break;
        case 9:
            if (highscore.hard == "No game played!" || highscore.hard > tried_pairs) {
                highscore.hard = tried_pairs;
                document.getElementById("highscore_hard").innerHTML = "Highscore - Hard: " + highscore.hard + " ";
            }
            break;
        default:
            console.log("Could not figure out difficulty!");
    }
}

//when Button is clicked
function startGame() {
    correct_selected_pairs = 0;
    tried_pairs = 0;
    document.getElementById("tried_pairs").innerHTML = tried_pairs;
    //TODO get current selected breeds

    //Clear dogArray
    dog_arr = [];
    //get current selected option 
    let game_difficulty = document.getElementById("difficulty").value;
    switch (game_difficulty) {
        case "easy":
            playset_pairs = 4;
            break;
        case "normal":
            playset_pairs = 6;
            break;
        case "hard":
            playset_pairs = 9;
            break;
        default:
            alert("Eror while specifying pairs. Default: 4 pairs");
            playset_pairs = 4;
    }
    getDogs(playset_pairs);
}

function resetGame() {
    document.getElementById("dog_cards").innerHTML = "";

    document.getElementById("tried_pairs").innerHTML = 0;
    //alert set game is reset
    //reset all figures like the current highscore
    //reset current cards
    dog_arr = [];
    //reset current breed selection
    alert("The game is reset!");
}

//Timer https://stackoverflow.com/questions/29610521/how-to-make-a-javascript-timer-bar
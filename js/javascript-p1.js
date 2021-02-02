// flip card: https://www.w3schools.com/howto/howto_css_flip_card.asp
var dog_arr = new Array();
var dog_breeds_arr = new Array();
var cur_open_cards_arr = new Array();

var tried_pairs = 0;

//getDogs()
async function getDogs() {
    let req_dog_amount = 2;    //requested different dogs
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

//getBreeds()
async function getBreeds() {
    try {
        let response = await fetch("https://api.thedogapi.com/v1/breeds")
        let breeds = await response.json()
        printBreeds(breeds);
    }
    catch (error) {
        console.log("error", error);
    }

}

function printBreeds(breeds) {
    let onlyBreeds = new Array();
    for (let i = 0; i < breeds.length; i++) {
        onlyBreeds.push(breeds[i].name);
    }
    dog_breeds_arr = onlyBreeds;
    console.log(dog_breeds_arr);
}

//Check if dog is already within the dog array and allow only new dog data to the array
function pushNewDog(new_dog) {
    if (dog_arr.length == 0) {
        dog_arr.push(dog);
    } else {
        for (let i = 0; i < dog_arr.length; i++) {
            if (JSON.stringify(new_dog) === JSON.stringify(dog_arr[i])) {
                console.log("Dog already in Array!");
            } else {
                console.log("New dog for Array!");
            }
        }
    }
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
    let dog_cards = document.getElementById("dog_cards").innerHTML;
    let card_id = 1;
    for (let dog of dog_arr) {
        console.log("DogId: " + dog[0].id);
        console.log("Url: " + dog[0].url);

        dog_cards = dog_cards +
            `            <div class="flip-card m-2" style="width:150px;height:150px;">
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
    document.getElementById("dog_cards").innerHTML = dog_cards;
}


function card_clicked(element) {
    //Matched Card are not processed further (Ignoring of matched cards)
    if (element.classList.contains("matched-card")) {
        console.log("Check 1 - Already Matched card: " + element.classList.contains("matched-card")); // does not print to the console? 
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
        withdrawCardMatch(cur_open_cards_arr[0]);
        withdrawCardMatch(cur_open_cards_arr[1]);
    }
    else {
        closeCard(cur_open_cards_arr[0]);
        closeCard(cur_open_cards_arr[1]);
    }
    tried_pairs++;
    cur_open_cards_arr = []; //cu_open_arr has is not referenced anywhere, deleting content like this is okay
    document.getElementById("tried_pairs").innerHTML = tried_pairs;
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


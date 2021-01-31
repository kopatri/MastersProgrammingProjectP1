var dog_arr = new Array();
getDogs()
async function getDogs() {
    let req_dog_amount = 4;    //requested different dogs
    for ( let i = 0; i < req_dog_amount; i++) {
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

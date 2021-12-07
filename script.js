let countries;
let totalPopulation;
let continentsArray = []

// #region || search input + mic

let previousSearch = "";

$(".search-btn").click(searchFilterClick)

function searchFilterClick() {
    if (previousSearch == $(".search-text-input").val()) {
        return
    }
    previousSearch = $(".search-text-input").val()

    if ($(".search-text-input").val() == "") {
        fetchAll()
        return
    }
    
    fetchFew()
}

// #region || speech recognition

try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.interimResults = true
    recognition.lang = "en-US"
    
    $(".search-mic-btn").click(e => {
        console.log("listening...")
        recognition.start()
        $(".search-mic-btn").addClass("listening")
    })
    
    recognition.onresult = function(e) {
        $(".search-text-input").val(e.results[0][0].transcript)
        if (e.results[0].isFinal == true) {
            console.log("completed listening process")
            searchFilterClick()
        }
    }
    
    recognition.onspeechend = function() {
        recognition.stop()
        console.log("stopped listening: speech ended.")
        $(".search-mic-btn").blur()
        $(".search-mic-btn").removeClass("listening")
    }
    
    recognition.onerror = function(event) {
        console.log('Stopped listening due to error: ' + event.error)
        recognition.stop()
        $(".search-mic-btn").blur()
        $(".search-mic-btn").removeClass("listening")
    }
} catch (error) {
    console.warn("Microphone was removed due to lack of browser support. ERR:", error)
    $(".search-mic-btn").remove()
}

// #endregion
// #endregion

$("#all-btn").click(fetchAll)

function fetchAll() {
    
    const url = `https://restcountries.com/v3.1/all`
    
    $.get(url, (data) => {
        countries = data
        console.log(countries)
        renderCountries()
    })
}

function renderCountries() {
    clearCountries()
    if (countries.length < 1) {
        clearContinents()
        $(".countries-container").append(`<h2>No countries found 😢</h2>`)
        $("#total-countries-num").text(0)
        $("#total-population-num").text(0)
        $("#avg-population-num").text(0)
        return
    }
    totalPopulation = 0;
    continentsArray = []
    for (let each of countries) {
        $(".countries-container").append(`
            <div class="card-container">
                <h2 id="country-name">${each.name.common}</h2>
                <h2>Population: <span id="population-num">${each.population}</span></h2>
            </div>
        `)
        totalPopulation += each.population;
        continentsArray = continentsArray.concat(each.continents)
    }
    updateSummary()
    renderContinents()
}

function clearCountries() {
    $(".countries-container").html("")
}

function clearContinents() {
    $(".continents-container").html("")
}

function updateSummary() {
    $("#total-countries-num").text(countries.length)
    $("#total-population-num").text(totalPopulation)
    let avgPopulation = totalPopulation / countries.length;
    $("#avg-population-num").text(Math.floor(avgPopulation))
}

function renderContinents() {
    console.log(continentsArray)
    clearContinents()
    
    // from stackoverflow:
    let reducedContinents = continentsArray.reduce((grouping, item) => {
        // If the current list item does not yet exist in grouping, set it's initial count to 1
        if(grouping[item] === undefined) {    
            grouping[item] = 1;
        }
        // If current list item does exist in grouping, increment the count
        else {
            grouping[item] ++;
        }
        return grouping;
    }, {})

    console.log(reducedContinents)
    for(let each in reducedContinents) {
        $(".continents-container").append(`
            <div class="card-container">
                    <h2 id="continent-name">${each}</h2>
                    <h2>Countries: <span id="country-count">${reducedContinents[each]}</span></h2>
            </div>
        `)
    }
    
}


function fetchFew() {
    
    const url = `https://restcountries.com/v3.1/name/${$(".search-text-input").val()}`
        $.get(url, (data) => {
            countries = data
            console.log(countries)
            renderCountries()
        }).fail(() => {
            countries = []
            renderCountries()
        })
}

fetchAll()
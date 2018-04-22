//Global variables
let savedAds = [];
const showSavedAdsButton = document.getElementById('showSavedAds');
let currentPage = 1;

if (!location.search.split('jobAd=')[1]) {
    fetchAdHeadings();
}

function fetchAdHeadings() {
fetch('http://api.arbetsformedlingen.se/af/v0/platsannonser/matchning?lanid=1&sida=1&antalrader=10')
        .then((response) => response.json())
        .then((adHeadings) => {
            console.log(adHeadings)
			displayAdHeading(adHeadings);
        })
        .catch((error) => {
            console.log(error)
	})
}

function displayAdHeading(adHeadings) {
   	const headingOutput = document.getElementById('headingOutput');
    const totalJobs = `<h2>Totalt antal lediga tjänster: ${adHeadings.matchningslista.antal_platsannonser}</h2>`;
    headingOutput.innerHTML = totalJobs;

	for(let i = 0; i < adHeadings.matchningslista.matchningdata.length; i++){
    const adHeadingContainer = `
        <div id='adContainer'>
            <h2>${adHeadings.matchningslista.matchningdata[i].annonsrubrik}</h2>
            <p>Arbetsplats: ${adHeadings.matchningslista.matchningdata[i].arbetsplatsnamn}</p>
            <p>Kommun: ${adHeadings.matchningslista.matchningdata[i].kommunnamn}</p>
            <p>Sista ansökningsdag: ${adHeadings.matchningslista.matchningdata[i].sista_ansokningsdag}</p>
            <p>Yrke: ${adHeadings.matchningslista.matchningdata[i].yrkesbenamning}</p>
            <p>Anställningstyp: ${adHeadings.matchningslista.matchningdata[i].anstallningstyp}</p>
            <p>Läs mer: <a href='?jobAd=${adHeadings.matchningslista.matchningdata[i].annonsid}'>HÄR</a></p>
        </div>
    `;
    headingOutput.insertAdjacentHTML('beforeend', adHeadingContainer);

	}
    headingOutput.insertAdjacentHTML('beforeend', displayPagination(adHeadings.matchningslista));
    const paginationButtons = document.getElementsByClassName('paginationButton');
    for (let pageButton of paginationButtons) {
        pageButton.addEventListener('click', function() {
            const requestPage = this.getAttribute('data-page');
            paginate(requestPage);
        })
    }
}

function fetchSpecificAd(adID) {
    fetch(`http://api.arbetsformedlingen.se/af/v0/platsannonser/${adID}`)
    .then((response) => response.json())
    .then((json) => {

         displaySpecificAd(json);

    })
    .catch((error) => {
        console.log(error);
    });
}

function displayPagination(items) {
    const firstPage = 1;
    const lastPage = items.antal_sidor;
    let paginationContainer = `
        <div id='paginationContainer'>
            <button type='button' class='paginationButton firstLastButton' data-page='${firstPage}'><<</button>`;
    if (currentPage > 1 && lastPage !== currentPage) {
        paginationContainer += `
                <button type='button' class='paginationButton' data-page='${currentPage - 1}'>${currentPage - 1}</button>
                <button type='button' class='paginationButton activePaginationButton' data-page='${currentPage}'>${currentPage}</button>
                <button type='button' class='paginationButton' data-page='${currentPage + 1}'>${currentPage + 1}</button>`
    }
    else if (currentPage === lastPage) {
        paginationContainer += `
                <button type='button' class='paginationButton' data-page='${currentPage - 2}'>${currentPage - 2}</button>
                <button type='button' class='paginationButton' data-page='${currentPage - 1}'>${currentPage - 1}</button>
                <button type='button' class='paginationButton activePaginationButton' data-page='${currentPage}'>${currentPage}</button>`
    }
    else {
        paginationContainer += `
                <button type='button' class='paginationButton activePaginationButton' data-page='${currentPage}'>${currentPage}</button>
                <button type='button' class='paginationButton' data-page='${currentPage + 1}'>${currentPage + 1}</button>
                <button type='button' class='paginationButton' data-page='${currentPage + 2}'>${currentPage + 2}</button>`
    }
    paginationContainer += `
            <button type='button' class='paginationButton firstLastButton' data-page='${lastPage}'>>></button>
        </div>`
    return paginationContainer;
}

function displaySpecificAd(item) {
    const ad = item.platsannons;
    const mainOutput = document.getElementById('mainOutput');
    const adContainer = `
        <div id='adContainer'>
            <h2>Rubrik: ${ad.annons.annonsrubrik}</h2>
            <p>Beskrivning: ${ad.annons.annonstext}</p>
            <p>Yrkesbenämning: ${ad.annons.yrkesbenamning}</p>
            <p>Antal platser: ${ad.annons.antal_platser}</p>
            <p>Ort: ${ad.annons.kommunnamn}</p>
            <p>Sista ansökningsdag: ${ad.ansokan.sista_ansokningsdag}</p>
            <p>Hemsida: ${ad.ansokan.webbplats}</p>
            <p>Arbetsplats: ${ad.arbetsplats.arbetsplatsnamn}</p>
            <p>Omfattning: ${ad.villkor.arbetstid}</p>
            <p>Lön: ${ad.villkor.lonetyp}</p>
            <p>Dela: ${window.location.href}</p>
            <button type="button" id="saveAd${ad.annons.annonsid}" value="${ad.annons.annonsid}">
            Spara annons</button>
        </div>
    `;
    mainOutput.innerHTML = adContainer;

    const saveAdButton = document.getElementById(`saveAd${ad.annons.annonsid}`);
    saveAdButton.addEventListener('click', function(event){
        saveAdToLocalStorage(this.value);
    });
}

function fetchAdFromURL() {
    const url = location.search.split('jobAd=')[1];
    fetchSpecificAd(url);
}

if (location.search.split('jobAd=')[1]) {
    fetchAdFromURL()
}

function saveAdToLocalStorage(id){
    if(!localStorage.getItem('savedAds')){
        localStorage.setItem('savedAds', JSON.stringify(savedAds));
    }
    savedAds = JSON.parse(localStorage.getItem('savedAds'));
    savedAds.push(id);
    localStorage.setItem('savedAds', JSON.stringify(savedAds));
}

showSavedAdsButton.addEventListener('click', function(event){
    displaySavedAds();
});

/* This displaySavedAds-function is under construction: */
function displaySavedAds(){
    console.log('Wow! Visa sparade annonser-button works!')

    /* Getting array of saved adID's from local storage: */
    savedAds = JSON.parse(localStorage.getItem('savedAds'));

    //displayAdHeading(savedAds);

    /* Looping out IDs */
    for(let i = 0; i < savedAds.length; i++){
        let adID = savedAds[i];

        console.log('Sparat annonsid:', adID);
    }
}

function paginate(pageNumber = 1) {
    currentPage = parseInt(pageNumber);
    fetch(`http://api.arbetsformedlingen.se/af/v0/platsannonser/matchning?lanid=1&sida=${pageNumber}&antalrader=10`)
            .then((response) => response.json())
            .then((adHeadings) => displayAdHeading(adHeadings))
            .catch((error) => console.log(error))
}

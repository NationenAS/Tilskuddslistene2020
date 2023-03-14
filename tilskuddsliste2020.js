var data = [];
var alleKommuner = [];
var urlBase = 'https://hotell.difi.no/api/json/ldir/produksjon-og-avlosertilskudd/2020?query=';
var url = urlBase;
var kommuneUrlBase = '&kommunenr=';
var page = 1;
var pages = 0;
var pageUrl = "&page=";
var kommuneUrl = kommuneUrlBase;
var kommune = "";

let dropdown = jQuery('#kommune-liste');

const currentPage = document.getElementById("currentPage");
const totalPage = document.getElementById("totalPage");
const hits = document.getElementById("treff");
const table = document.getElementById("lab-til__entries");

// Sorterer kommunene fra A til Å
var compare = function (a, b) {
    // Use toUpperCase() to ignore character casing
    const nameA = a.kommunenavnNorsk.toUpperCase();
    const nameB = b.kommunenavnNorsk.toUpperCase();

    let comparison = 0;
    if (nameA > nameB) {
        comparison = 1;

    } else if (nameA < nameB) {
        comparison = -1;
    }
    return comparison;
};

//Sorterer tilskudd fra mest til minst
var compare2 = function (a, b) {

    // rydder unna tomme verdier
    if (a.sum_produksjons_og_avloesertilskudd === "") {
        return 1;
    }
    if (b.sum_produksjons_og_avloesertilskudd === "") {
        return -1;
    }

    // Use toUpperCase() to ignore character casing
    const valA = parseInt(a.sum_produksjons_og_avloesertilskudd, 10);
    const valB = parseInt(b.sum_produksjons_og_avloesertilskudd, 10);

    if (a.sum_produksjons_og_avloesertilskudd === "") {
        return 1;
    }
    if (b.sum_produksjons_og_avloesertilskudd === "") {
        return -1;
    }

    let comparison = 0;
    if (valA > valB) {
        comparison = -1;
    } else if (valA < valB) {
        comparison = 1;
    }
    return comparison;
};

//Henter alle kommuner fra Datanorge

var getKommune = function (compare, populateDrop) {

    jQuery.ajax({
        method: 'GET',
        url: 'https://ws.geonorge.no/kommuneinfo/v1/kommuner',
        success: function (response, text, request) {
            alleKommuner = response;
            alleKommuner.sort(compare);
            populateDrop(alleKommuner);
            return alleKommuner;
        }
    });
};

// Henter dataem fra DataNorge       !!legge til pages
var getTable = function (url, kommuneUrl) {
    jQuery.ajax({
        method: 'GET',
        url: url + kommuneUrl,
        success: function (response, text, request) {
            data = response;
            data = data.entries.sort(compare2); //sorterer etter tilskudd mest til minst

            populateTable(data);
            return response;
        }
    });
};

//Henter verdi fra søkefeltet og legger til URL
var getUrl = function () {
    var value = jQuery('#search-input').val();
    url = urlBase + value + "*";
    return url;
};

async function populateTable(data) {

    table.innerHTML = ''; //tømmer tabellen for gamle resultat
    if (!data) {
        console.log("no data");
        return
    }

    // Legger til riktig kommunenavnNorsk etter komunenummer
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < alleKommuner.length; j++) {
            if (data[i].kommunenr == alleKommuner[j].kommunenummer) {
                kommune = alleKommuner[j].kommunenavnNorsk;
                kommune = kommune.toUpperCase();
            }
        }

        //legger til komma til sum.


        // Legger til de 50 øverste på lista til tabell
        if (i < 100) {

            var row = ` <div class="lab-til__entry" data-orgnr="${data[i].orgnr}" onclick="toggleInfo(this)">
            <div>
                <div>${data[i].orgnavn}</div>
                <div>${kommune}</div>
                <div>${numberWithCommas(data[i].sum_produksjons_og_avloesertilskudd)} kr</div>
                <div><svg><use xlink:href="#down-caret"></use></svg></div>
            </div>
            <div>
                <div>Org.nr. <span class="lab-til__id">${data[i].orgnr}</span></div>
                <div>Hvorav avløsertilskudd: <span>${numberWithCommas(data[i].avloesertilskudd)} kr</span></div>
                <div class="lab-til__tilskudd2020">Fjorårets tilskudd <span > </span></div>
                <div class="lab-til__avløser2020">Hvorav fjoråets avløsertilskudd: <span> </span></div>
            </div>
        </div>`;

            table.innerHTML += row;
        } else {


            return
        } //hopper ut når max antall er nådd
    }


};

var populateTablePage = function (data, page) {
    var table = document.getElementById("lab-til__entries");
    table.innerHTML = ''; //tømmer tabellen for gamle resultat
    let tableTemp = '';

    if (data === undefined) {
        return
    }


    // Legger til riktig kommunenavnNorsk etter komunenummer
    for (let i = (page - 1) * 100; i < data.length; i++) {


        for (let j = 0; j < alleKommuner.length; j++) {
            if (data[i].kommunenr == alleKommuner[j].kommunenummer) {
                kommune = alleKommuner[j].kommunenavnNorsk;
                kommune = kommune.toUpperCase();
            }
        }


        // Legger til de 100 øverste på lista til tabell
        if (i < (page) * 100) {
            let row = ` <div class="lab-til__entry" data-orgnr="${data[i].orgnr}" onclick="toggleInfo(this)">
            <div>
                <div>${data[i].orgnavn}</div>
                <div>${kommune}</div>
                <div>${numberWithCommas(data[i].sum_produksjons_og_avloesertilskudd)} kr</div>
                <div><svg><use xlink:href="#down-caret"></use></svg></div>
            </div>
            <div>
                <div>Org.nr. <span class="lab-til__id">${data[i].orgnr}</span></div>
                <div>Hvorav avløsertilskudd: <span>${numberWithCommas(data[i].avloesertilskudd)} kr</span></div>
                <div class="lab-til__tilskudd2020">Fjorårets tilskudd <span > </span></div>
                <div class="lab-til__avløser2020">Hvorav fjoråets avløsertilskudd: <span> </span></div>
            </div>
        </div>`;

            tableTemp += row;
        }
    }

    table.innerHTML = tableTemp;
};


//legger inn kommunene i dropdownmenyen
var populateDrop = function (alleKommuner) {
    dropdown.empty();
    dropdown.append('<option selected="true" value="" >Alle kommuner</option>');
    dropdown.prop('selectedIndex', 0);
    for (var k = 0; k < alleKommuner.length; k++) {
        dropdown.append(jQuery('<option></option>').attr('value', alleKommuner[k].kommunenummer).text(alleKommuner[k]
            .kommunenavnNorsk));
    }
};

getKommune(compare, populateDrop);

// window.onload = setTimeout(function() {
//     getTable(url, kommuneUrl);
// }, 50)


let typingTimer; //timer identifier
const doneTypingInterval = 1000; //time in ms
const input = jQuery('#search-input');

input.on('keyup', () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
});

input.on('keydown', function () {
    clearTimeout(typingTimer);
})


function doneTyping() {
    page = 1; // stiller siden tilbake til 1

    var str = jQuery('#search-input').val();
    var value = str.replace(' ', '+');
    var value2 = jQuery('#kommune-liste').val();
    if (value.length == '' && value2.length == '') {
        var table = document.getElementById("lab-til__entries");
        document.getElementById('nextPage').style.opacity = "0";
        document.getElementById('nextPage').style.cursor = "auto";
        pages = 1;
        data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; //placehodler for 10høyeste
        refreshMeta();
        table.innerHTML = `Søk på Navn, kommune og/eller orgnummer`;
        return

    }
    if (value.length < 3 && value.length > 0) {
        return
    } //returnerer hvis søkefeltet er kortere enn 3 bokstaver 

    var table = document.getElementById("lab-til__entries");
    //table.innerHTML = `<img style="width:100px; display:block; margin: 75px auto; height:100px " src="https://tunmedia.s3.us-east-2.amazonaws.com/natlab/scripts/loader-loading.gif"></img>`;
    table.innerHTML = `<svg id="tractor-waiting" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 962.4 518.9">
<path fill="none" stroke="black" stroke-width="3" stroke-dasharray="4670" stroke-dashoffset="4670" d="M0.6,507c39.2,17.2,87,12.9,122.5-11s57.4-66.6,56.2-109.4c-1.1-36.9-22.7-75.9-58.4-85c-35.6-9.1-74.4,16.3-86.2,51.1s0.6,74.8,25.4,101.9s60.3,42.4,96.4,49.3s73.1,6,109.8,5c33.7-0.9,67.5-1.7,101.2-2.6c48-1.2,100.5-4.2,135.9-36.5c21.4-19.6,33.6-48.1,36.6-77c6.1-58.4-26.8-119.6-80.1-144.2s-123-8.6-158.2,38.4c-38.1,51-28.5,130.4,18.7,173.1S445,505.6,497.1,469c18.9-13.3,34.7-31.1,45.3-51.7c23.6-45.7,19.3-104.6-10.7-146.4c-30.1-41.8-84.5-64.6-135.4-56.7c-19.8,3.1-38.8,10.3-58.6,12.3c-19.9,2-42.2-2.5-54.4-18.3c-12.4-16-10.9-38.4-8.9-58.6c4.5-44.8,11.5-94.4,46.4-122.9C352,1.3,396.1,0.9,436.5,1.7c32.8,0.7,68.2,2.2,93.8,22.7c50.3,40.1,35.4,128.9,85.7,168.9c55.9,44.4,147.9-4.4,206.3,36.7c27.9,19.7,40,55,45.5,88.8c4.2,25.5,5.7,51.4,4.4,77.2c-1,20.6-4.7,42.9-19.8,56.8c-15.1,13.9-71.7,24-46.8-7.5c24.9-31.5,22.9-77.6,0.2-109.7c-22.7-32.2-68.4-46-105-31.5c-36.6,14.5-60.6,56-54.4,94.9c6.1,38.9,41.9,71.1,81.3,72.9c22.9,1,46.6-8,61-25.9c14.3-17.9,17.7-44.6,6-64.3c-11.8-19.9-36.8-29.7-59.9-27.5c-23.1,2.2-44.2,14.7-61.1,30.6c-22.9,21.5-39.9,55.8-25.9,84c8.5,17.2,26.8,27.8,45.5,31.8c18.7,4,38.2,2.2,57.2,0.4c70.6-6.6,141.2-13.2,211.8-19.8"/>
</svg>`

    data = [];
    //if(value.length == 0) {populateTable(data)};
    url = 'https://hotell.difi.no/api/json/ldir/produksjon-og-avlosertilskudd/2020?query=' + value + '*';


    fetchAndPublish();
};

async function fetchAndPublish() {

    let pp = await getPage(url, kommuneUrl);

    if (pp.pages < 2) {
        document.getElementById('nextPage').style.opacity = "0";
        document.getElementById('nextPage').style.cursor = "auto";
    }
    if (pp.pages > 1) {
        document.getElementById('nextPage').style.opacity = "1";
        document.getElementById('nextPage').style.cursor = "pointer";
    }
    if (pp.posts == 0) { //fanger opp hvis søket har 0 treff
        table.innerHTML = "";
        refreshMeta();
        return
    }

    let aall = await getAllPages(pp.pages);

    // populateTable(aall);

    // refreshMeta();
    document.querySelector(".lab-til").scrollIntoView();
}

jQuery('#kommune-liste').on('change', function () {
    page = 1;

    kommuneUrl = kommuneUrlBase + this.value;
    url = getUrl();

    fetchAndPublish();
});

function setPage(p) {
    pages = p;
    return pages;
}

async function getPage(url, kommuneUrl) {
    return jQuery.ajax({
        method: 'GET',
        url: url + kommuneUrl,
        success: function (resp) {
            var data6 = resp;
            setPage(data6.pages); // setter pages til antallet i søket
        }
    });
}


async function getAllPages(pages) {

    const promises = [];
    const prom = [];

    let tempArray = [];
    let tempArray2 = [];
    if (pages == 0) {
        return
    }

    // function addPromis(i) {

    //     console.log("fooo", i);
    // }

    for (let i = 1; i <= pages; i++) {
        if(i > 10) {pages = 10; return;}
        if (i > 5) {
            setTimeout(() => {
                prom.push(getData(url, kommuneUrl, i));
            }, 150 * i)            
                
            console.log("for mange sider");        

        } else {           
            promises.push(getData(url, kommuneUrl, i));
        }
    }

    //løser ut alle promises
    Promise.all(promises)
        .then((result) => {

            for (let i = 0; i < result.length; i++) {
                tempArray = tempArray.concat(result[i].entries);
            }

            data = tempArray; //lagrer dataen vi henter i data[]
            try {
                data = data.sort(compare2); //sorterer etter tilskudd mest til minst
            } catch (error) {
                console.log(error)
            }

            populateTable(data);
            refreshMeta();
            document.querySelector("#lab-til__scroll_to").scrollIntoView();

            return tempArray

        }).catch(err => console.log("error ", err))

    function toManyPages() {
        Promise.all(prom).then((result2) => {

            for (let resIndex = 0; resIndex < result2.length; resIndex++) {
                tempArray2 = tempArray2.concat(result2[resIndex].entries);
            }

            data = data.concat(tempArray2);
            try {
                data = data.sort(compare2); //sorterer etter tilskudd mest til minst
            } catch (error) {
                console.log(error)
            }
            refreshMeta();
            populateTable(data);
            return result2
        });
    }

    setTimeout(() => {
        toManyPages();
    }, 3000);
}

async function getData(url, kommuneUrl, i) {
    setTimeout(() => { console.log(i); }, i * 250)
    let result = await jQuery.ajax({
        method: 'GET',
        tryCount: 0,
        retryLimit: 3,
        url: url + kommuneUrl + pageUrl + i,
        async: true,
        success: function (response, text, request) {
             console.log("suksess " + i)
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log(textStatus, " inni ajax ", errorThrown);
        }
    });

    return result;
};

function prevPage() {
    if (page == 1) {
        return
    }
    if (page > 1) {
        document.getElementById('nextPage').style.opacity = "1";
        document.getElementById('nextPage').style.cursor = "pointer"
    }
    if (pages == 0) {
        return
    }
    page = page - 1;
    if (page == 1) {
        document.getElementById('prevPage').style.opacity = "0";
        document.getElementById('prevPage').style.cursor = "auto"
    }
    populateTablePage(data, page);
    refreshMeta();




}

function nextPage() {

    if (page < pages) {
        page++
    }

    if (page == pages) {
        document.getElementById('nextPage').style.opacity = "0";
        document.getElementById('nextPage').style.cursor = "auto";
    }

    if (page != 1) {
        document.getElementById('prevPage').style.opacity = "1";
        document.getElementById('prevPage').style.cursor = "pointer";
    }
    if (pages == 0) {
        return
    }



    populateTablePage(data, page);
    refreshMeta();

}

function refreshMeta() {

    currentPage.innerHTML = page;
    totalPage.innerHTML = pages;
    hits.innerHTML = data.length;
}
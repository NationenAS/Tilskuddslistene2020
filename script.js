var numberWithCommas = function (x) {
  if(x == null) return 0;
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

function toggleInfo(e) {

  let orgnr = e.dataset.orgnr;

  get2019(e, orgnr).then((data) => {
    if (data.entries.length > 1) { console.log("får flere treff. noe feil har skjedd"); return }

    if (data.entries.length == 0) {
      e.querySelector('.lab-til__tilskudd2020').innerHTML = `<div class="lab-til__tilskudd2020">Sum tilskudd 2019: <span > 0 kr </span></div>`;
      e.querySelector('.lab-til__avløser2020').innerHTML = `<div class="lab-til__avløser2020">Hvorav avløsertilskudd 2019: <span>0 kr</span></div>`;

      return
    }

    if (data.entries.length == 1) {
      e.querySelector('.lab-til__tilskudd2020').innerHTML = `<div class="lab-til__tilskudd2020">Sum tilskudd 2019:  <span >  ${numberWithCommas(data.entries[0].sum_produksjons_og_avloesertilskudd)} kr </span></div>`;
      e.querySelector('.lab-til__avløser2020').innerHTML = `<div class="lab-til__avløser2020">Hvorav avløsertilskudd 2019: <span>${numberWithCommas(data.entries[0].avloesertilskudd)} kr</span></div>`;
    }
  });
  e.classList.toggle("open")
}


async function get2019(e, orgnr) {
  let result = await jQuery.ajax({
    method: 'GET',
    url: "https://hotell.difi.no/api/json/ldir/produksjon-og-avlosertilskudd/2019?query=" + orgnr,
    async: true,
    success: function (response, text, request) { }

  });
  return result;
};
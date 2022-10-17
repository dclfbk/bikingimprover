//Function used to make a rest call to verify which pins are expired. The expired pins are eliminated
export default async function checkUserPins(url){
    console.log("Checking pins...");
    var my_body = {
        "playerId" : "user",
        "type" : "remove",
        "imageName" : "image"
    }
    try{
        const my_url = url + "/manageImages/controlExpireDate"
        const requestSpatialite = {
            method:"post",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify(my_body),
        };
        const fetchdata = await fetch(my_url, requestSpatialite)
            .then(response => response.json())
            .then((new_response_data)=>{
            return new_response_data;
            }).catch((err)=>console.log(err))
            return fetchdata
    }catch(e){
        //alert("Error......");
        console.log(e)
    }
}

//Check the theme saved in the localStorage and assign it to the webApp
export function getTheme(){
    var theme = localStorage.getItem("theme");
    var r = document.querySelector(':root');
    switch(theme){
      case "default": r.style.setProperty('--white','#222222');
                      r.style.setProperty('--black','white');
                      r.style.setProperty('--primaryColor', '#666666'); //#ECC478
                      r.style.setProperty('--secondaryColor', '#6667AB');
                      r.style.setProperty('--inv','invert(1)');
                      break;
      case "blackish":r.style.setProperty('--white','white');
                      r.style.setProperty('--black','black');
                      r.style.setProperty('--primaryColor', '#ECC478');
                      r.style.setProperty('--secondaryColor', '#6667AB');
                      r.style.setProperty('--inv','invert(0)');
                      break;
      default: break;
    }
}

//Check which language has been selected previously and apply it to the webApp
export function getLanguage(){
    var language = localStorage.getItem("currentLanguage");
    if(language == null || language==undefined || language == ""){
        language = "English"
    }
    return language
}

//Apply the selected language
export function setLanguage(newLanguage){
    localStorage.setItem("currentLanguage", newLanguage);
}

export function animateValue(obj, start, end, duration, isProgress) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        if(isProgress){
            obj.value = Math.floor(progress * (end - start) + start);
        }else{
            obj.innerHTML = Math.floor(progress * (end - start) + start);
        }
        if (progress < 1) {
        window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
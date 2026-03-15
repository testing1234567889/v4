
let apps=[]

async function loadApps(){

const res=await fetch("data/apps.json")
apps=await res.json()

app.renderHome()

}

const app={

goHome(){

location.hash="#/home"

},

renderHome(){

const grid=document.getElementById("home-grid")

grid.innerHTML=""

apps.forEach(a=>{

grid.innerHTML+=`

<div class="card" onclick="app.openApp('${a.id}')">

<img src="${a.icon}">

<h3>${a.title}</h3>

<p>${a.developer}</p>

</div>

`

})

},

openApp(id){

const data=apps.find(x=>x.id==id)

document.getElementById("view-home").classList.add("hidden")
document.getElementById("view-detail").classList.remove("hidden")

document.getElementById("detail-icon").src=data.icon
document.getElementById("detail-title").textContent=data.title
document.getElementById("detail-dev").textContent=data.developer
document.getElementById("detail-version").textContent=data.version
document.getElementById("detail-size").textContent=data.size

document.getElementById("detail-desc").textContent=data.description

let mod=""

data.modInfo.forEach(m=>{

mod+=`<li>${m}</li>`

})

document.getElementById("detail-mod").innerHTML="<ul>"+mod+"</ul>"

let ss=""

data.screenshots.forEach(s=>{

ss+=`<img src="${s}">`

})

document.getElementById("detail-ss").innerHTML=ss

this.selected=data

},

showDownloadModal(){

const links=document.getElementById("download-links")

links.innerHTML=""

this.selected.downloadLinks.forEach(l=>{

links.innerHTML+=`

<a href="${l.url}" target="_blank">${l.name}</a><br>

`

})

document.getElementById("download-modal").classList.remove("hidden")

},

closeModal(){

document.getElementById("download-modal").classList.add("hidden")

}

}

document.getElementById("search-input").addEventListener("input",e=>{

const q=e.target.value.toLowerCase()

const filtered=apps.filter(a=>

a.title.toLowerCase().includes(q)||
a.developer.toLowerCase().includes(q)

)

const grid=document.getElementById("home-grid")

grid.innerHTML=""

filtered.forEach(a=>{

grid.innerHTML+=`

<div class="card" onclick="app.openApp('${a.id}')">

<img src="${a.icon}">

<h3>${a.title}</h3>

<p>${a.developer}</p>

</div>

`

})

})

loadApps()

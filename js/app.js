
let apps=[];

async function loadApps(){
const res=await fetch("data/apps.json");
apps=await res.json();
render(apps);
}

function render(list){

const grid=document.getElementById("apps-grid");
grid.innerHTML="";

list.forEach(app=>{

grid.innerHTML+=`
<div class="card">

<img src="${app.icon}" loading="lazy">

<h3>${app.title}</h3>

<p>${app.developer}</p>

<p class="text-xs">${app.version} • ${app.size}</p>

<a href="${app.download}" target="_blank">Download</a>

</div>
`;

});

}

document.getElementById("search").addEventListener("input",e=>{

const q=e.target.value.toLowerCase();

const filtered=apps.filter(a=>
a.title.toLowerCase().includes(q) ||
a.developer.toLowerCase().includes(q)
);

render(filtered);

});

loadApps();

document.addEventListener("DOMContentLoaded", function() {
    fetch("../manifest.json")
    .then(response => response.json())
    .then(data => {
        document.getElementById("name").textContent = `Name : ${data.name}`;
        document.getElementById("version").innerHTML = `Version : <span class="code">${data.version}</span>`;
        document.getElementById("description").textContent = `Description : ${data.description}`;
        document.getElementById("homepage_url").innerHTML = `Home page : <br><a href="${data.homepage_url}" class="code">${data.homepage_url}</a>`;
        document.getElementById("author_name").textContent = `Author : ${data.developer.name}`;
        document.getElementById("author_website").innerHTML = `Website : <br><a href="${data.developer.url}" class="code">${data.developer.url}</a>`;

        const permissionsList = document.getElementById("permissions");
        data.permissions.forEach(permission => {
            const li = document.createElement("li");
            li.textContent = permission;
            permissionsList.appendChild(li);
        });
    });
});
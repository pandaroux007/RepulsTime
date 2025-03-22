function setLinkData(name, dataToSet) {
    element = document.getElementById(name);
    element.textContent = dataToSet;
    element.href = dataToSet;
}

document.addEventListener("DOMContentLoaded", function() {
    fetch("../manifest.json")
    .then(response => response.json())
    .then(data => {
        document.getElementById("name").textContent = `Name : ${data.name}`;
        document.getElementById("version").textContent = data.version;
        document.getElementById("description").textContent = `Description : ${data.description}`;
        setLinkData("homepage_url", data.homepage_url);
        document.getElementById("author_name").textContent = `Author : ${data.developer.name}`;
        setLinkData("author_website", data.developer.url);

        const permissionsList = document.getElementById("permissions");
        data.permissions.forEach(permission => {
            const li = document.createElement("li");
            li.textContent = permission;
            permissionsList.appendChild(li);
        });
    }).catch((errorMsg) => {
        error = document.getElementById("error");
        error.style.display = "block";
        error.textContent = errorMsg;
    });
});
let username = document.getElementById("username");
let password = document.getElementById("password");
let confirmPassword = document.getElementById("confirmPassword");
let signUpBtn = document.getElementById("signUpBtn");


signUpBtn.addEventListener("click", registerInformation);

function registerInformation(event){
    event.preventDefault();
    let usernameValue = username.value;
    let passwordValue = password.value;
    let confirmPasswordValue = confirmPassword.value;

    let usernameRegX = /^([\w]+)@([a-zA-Z]+).([a-zA-Z\.]+)$/;
    let passwordRegX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W]).{8,10}$/;

    if(passwordValue.match(passwordRegX)){
        alert("Valid Password");
    }else{
        alert("Invalid Password");
    }
}
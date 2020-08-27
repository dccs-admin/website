// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyD8U3O5Z_KOFhvM0OqCnBJTILNTmFS2Y14",
    authDomain: "form-828d4.firebaseapp.com",
    databaseURL: "https://form-828d4.firebaseio.com",
    projectId: "form-828d4",
    storageBucket: "form-828d4.appspot.com",
    messagingSenderId: "311837331784",
    appId: "1:311837331784:web:4b912f624ea1db7307237d",
    measurementId: "G-LL3RJ1D0DS"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore(); 

function resetPassword() {
    var auth = firebase.auth();
    var email = document.getElementById("enter-email").value;

    if (email != "")
    {
        auth.sendPasswordResetEmail(email).then(function() {
            window.alert("An email has been sent to you. Please check your email and verify.");
        }).catch(function(error){
            window.alert("There was an error. :|");
        })
    }
    else
    {
        window.alert("Please input your email first.");
    }
}
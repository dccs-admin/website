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
const functions = firebase.functions();
const auth = firebase.auth(); 
const adminItems = document.querySelectorAll('.admin');

let childListRowCount = 0;

let totalCost = 0;

//add Admin cloud function
const adminForm = document.querySelector('.admin-actions');
adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const adminEmail = document.querySelector('#admin-email').value;
    const addAdminRole = functions.httpsCallable('addAdminRole');
    addAdminRole({ email: adminEmail }).then(result => {
        console.log(result);
    });
    window.alert("Successfully added an admin!");
});

function signUp(){

    var email = document.getElementById("email");
    var password = document.getElementById("password");

    const promise = auth.createUserWithEmailAndPassword(email.value, password.value);
    promise.catch(e => alert(e.message));
}

function signIn(){ 

    var email = document.getElementById("email");
    var password = document.getElementById("password");

    const promise = auth.signInWithEmailAndPassword(email.value, password.value);
    promise.catch(e => alert(e.message));

}

function signOut(){
    auth.signOut();

    document.getElementById("signOut").style.display = "none";
    document.getElementById("sendVerification").style.display = "none";
    document.getElementById("plsVerifyText").style.display= "none";
    
    hideClassRegistration();
    hideChildren();

}

auth.onAuthStateChanged(function(user) {
    if (user) {
        //User has signed in 
        var user = firebase.auth().currentUser;
        var uid = user.uid; 
        
        //console.log(uid);
        var email_verified = user.emailVerified;
        var email = user.email;
        
        //hide the login fields
        document.getElementById("formContainer").style.display = "none";

        //display the current user email
        document.getElementById("current-user").innerHTML = email;

        //display the "Sign Out" button
        document.getElementById("signOut").style.display = "block";

        if (!email_verified) {
            //show "Send Verification" button
            document.getElementById("sendVerification").style.display = "block";
            document.getElementById("plsVerifyText").style.display= "block";

            document.getElementById("show-profile-btn").style.display="none";
            document.getElementById("show-children-btn").style.display="none";

            document.getElementById("register-classes-btn").style.display = "none";
            adminItems.forEach(item => item.style.display = 'none');
        
        } else {
            //hide "Send Verification" button
            document.getElementById("sendVerification").style.display = "none";
            document.getElementById("plsVerifyText").style.display= "none";

            document.getElementById("show-profile-btn").style.display="block";
            document.getElementById("show-children-btn").style.display="block";

            document.getElementById("register-classes-btn").style.display = "block";
            document.getElementById("hide-register-classes-btn").style.display="none";
            document.getElementById("class-registration").style.display="none";

            //admin check
            user.getIdTokenResult().then(idTokenResult => {
                user.admin = idTokenResult.claims.admin;
                if (user.admin === true) {
                    adminItems.forEach(item => item.style.display = 'block');
                    document.getElementById("admin-print").style.display = "block";
                    document.getElementById("admin-print").innerHTML = "Administrator";
                    document.getElementById("admin-print").style.color = "magenta";
                    document.getElementById("show-profile-btn").style.display="none";
                    document.getElementById("show-children-btn").style.display="none";
                    document.getElementById("register-classes-btn").style.display="none";
                }
            })
            
        }
        
    } else {
        //no user is signed in
        adminItems.forEach(item => item.style.display = 'none');
        document.getElementById("admin-print").style.display = "none";
        document.getElementById("admin-print").innerHTML = "";
        document.getElementById("formContainer").style.display = "block";
        document.getElementById("current-user").innerHTML = "No Active User";
        document.getElementById("sendVerification").style.display = "none";
        document.getElementById("plsVerifyText").style.display= "none";
        document.getElementById("show-profile-btn").style.display="none";
        document.getElementById("profile").style.display="none";
        document.getElementById("hide-profile-btn").style.display="none";
        document.getElementById("show-children-btn").style.display="none";
        document.getElementById("hide-children-btn").style.display="none";
        document.getElementById("child-list").style.display="none";
        document.getElementById("register-classes-btn").style.display = "none";
        document.getElementById("hide-register-classes-btn").style.display="none";
        document.getElementById("class-registration").style.display="none";
        //hideAdminPanel();
        //hideClassRegistration();
        //hideProfile();
        //hideChildren();
        totalCost = 0;
        hideNewClass();
        document.getElementById("admin-email").value = "";
        hideClassRosterFinder();
    }
}); 

function showProfile(){
    document.getElementById("profile").style.display="block";
    document.getElementById("hide-profile-btn").style.display="block";
    document.getElementById("show-profile-btn").style.display="none";

    var user = firebase.auth().currentUser;
    var uid = user.uid;
    var email_verified = user.emailVerified;
    var email = user.email;
    var docRef = db.collection("users").doc(uid);
    
    //check if firestore has a doc for user
    docRef.get().then(function(doc) { 
        if (doc.exists) {
            let docData = doc.data();

            //get Parent Name
            let parentName = docData["parent_name"];
            document.getElementById("profile-parent-name").innerHTML = "Parent Name: " + parentName;

            //get Phone Num
            let phoneNum = docData["phone_num"];
            document.getElementById("profile-phone-num").innerHTML = "Phone Number: " + phoneNum;
        } else {
            //else CREATE DOC 
            db.collection("users").doc(uid).set({
                email: email
            })
        }
    }).catch(function(error) {
        
    });

    document.getElementById("profile-email").innerHTML = "Current email: " + email;
}

function showRegisExample() {
    document.getElementById('hide-regis-example').style.display='block'; 
    document.getElementById('show-regis-example').style.display='none'; 
    document.getElementById('regis-example').style.display='block';
}

function showChildren(){
    document.getElementById("hide-children-btn").style.display="block";
    document.getElementById("show-children-btn").style.display="none";
    document.getElementById("child-list").style.display="block";
    var classString = "";
    var user = firebase.auth().currentUser;
    var uid = user.uid;
    var docRef = db.collection("users").doc(uid).collection("children");
    docRef.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            let docData = doc.data();
            var table = document.getElementById("child-list-table");
            let dateOfBirth = docData["dateOfBirth"];
            let gender = docData["gender"];
            let name = docData["name"];

            var row = table.insertRow();
            var cell1 = row.insertCell(0); //Child Name
            var cell2 = row.insertCell(1); //Birth Date
            var cell3 = row.insertCell(2); //Gender
            var cell4 = row.insertCell(3); //Enrolled Classes

            let class1 = docData["class1"];
            let catg1 = docData["catg1"];
            if (class1 !== "") {
                var ref = db.collection("classes").doc(catg1).collection(catg1+"-classes-list").doc(class1);
                ref.get().then(function(doc) {
                    var docData = doc.data();
                    var startTime = docData["startTime"].slice(0,4);
                    var endTime = docData["endTime"];
                    classString = classString + class1;
                    classString = classString + "<br>" + startTime + " to " + endTime + "<br><br>";
                    cell4.innerHTML = classString;
                })
            }

            let class2 = docData["class2"];
            let catg2 = docData["catg2"];
            if (class2 !== "") {
                var ref = db.collection("classes").doc(catg2).collection(catg2+"-classes-list").doc(class2);
                ref.get().then(function(doc) {
                    var docData = doc.data();
                    var startTime = docData["startTime"].slice(0,4);
                    var endTime = docData["endTime"];
                    classString = classString + class2;
                    classString = classString + "<br>" + startTime + " to " + endTime + "<br><br>";
                    cell4.innerHTML = classString;
                })
            }

            let class3 = docData["class3"];
            let catg3 = docData["catg3"];
            if (class3 !== "") {
                var ref = db.collection("classes").doc(catg3).collection(catg3+"-classes-list").doc(class3);
                ref.get().then(function(doc) {
                    var docData = doc.data();
                    var startTime = docData["startTime"].slice(0,4);
                    var endTime = docData["endTime"];
                    classString = classString + class3;
                    classString = classString + "<br>" + startTime + " to " + endTime + "<br><br>";
                    cell4.innerHTML = classString;
                })
            }
            
            let class4 = docData["class4"];
            let catg4 = docData["catg4"];
            if (class4 !== "") {
                var ref = db.collection("classes").doc(catg4).collection(catg4+"-classes-list").doc(class4);
                ref.get().then(function(doc) {
                    var docData = doc.data();
                    var startTime = docData["startTime"].slice(0,4);
                    var endTime = docData["endTime"];
                    classString = classString + class4;
                    classString = classString + "<br>" + startTime + " to " + endTime + "<br><br>";
                    cell4.innerHTML = classString;
                })
            }
            
            let class5 = docData["class5"];
            let catg5 = docData["catg5"];
            if (class5 !== "") {
                var ref = db.collection("classes").doc(catg5).collection(catg5+"-classes-list").doc(class5);
                ref.get().then(function(doc) {
                    var docData = doc.data();
                    var startTime = docData["startTime"].slice(0,4);
                    var endTime = docData["endTime"];
                    classString = classString + class5;
                    classString = classString + "<br>" + startTime + " to " + endTime + "<br><br>";
                    cell4.innerHTML = classString;
                })
            }

            let class6 = docData["class6"];
            let catg6 = docData["catg6"];
            if (class6 !== "") {
                var ref = db.collection("classes").doc(catg6).collection(catg6+"-classes-list").doc(class6);
                ref.get().then(function(doc) {
                    var docData = doc.data();
                    var startTime = docData["startTime"].slice(0,4);
                    var endTime = docData["endTime"];
                    classString = classString + class6;
                    classString = classString + "<br>" + startTime + " to " + endTime + "<br><br>";
                    cell4.innerHTML = classString;
                })
            }
                    
            //write data to table
            cell1.innerHTML = name;
            cell2.innerHTML = dateOfBirth;
            cell3.innerHTML = gender;

        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    })
    
}

function openChildDropdown(){
    document.getElementById("add-child-dropdown").style.display="block";
    document.getElementById("hide-new-child-btn").style.display="block";
    document.getElementById("add-new-child-btn").style.display="none";
}

/*
function openAdminPanel() {
    document.getElementById("admin-panel").style.display="block";
    document.getElementById("open-admin-panel-btn").style.display="none";
    document.getElementById("close-admin-panel-btn").style.display="block";
}
*/

function openClassRegistration(){

    document.getElementById("hide-register-classes-btn").style.display="block";
    document.getElementById("register-classes-btn").style.display="none";
    document.getElementById("class-registration").style.display="block";

    var user = firebase.auth().currentUser;
    var uid = user.uid;
    var docRef = db.collection("users").doc(uid).collection("children");
    docRef.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            let docData = doc.data();
            let name = docData["name"];
            var select = document.getElementById("student-to-register");
            var opt = document.createElement('option');
            opt.appendChild(document.createTextNode(name));
            opt.value = name;
            select.appendChild(opt);
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    })
    var catg1 = document.getElementById("choose-category-1");
    var option = document.createElement('option');
    option.appendChild(document.createTextNode("-- Choose a Class Category --"))
    option.value = 0;
    catg1.appendChild(option);

    var catg2 = document.getElementById("choose-category-2");
    var option = document.createElement('option');
    option.appendChild(document.createTextNode("-- Choose a Class Category --"))
    option.value = 0;
    catg2.appendChild(option);

    var catg3 = document.getElementById("choose-category-3");
    var option = document.createElement('option');
    option.appendChild(document.createTextNode("-- Choose a Class Category --"))
    option.value = 0;
    catg3.appendChild(option);

    var catg4 = document.getElementById("choose-category-4");
    var option = document.createElement('option');
    option.appendChild(document.createTextNode("-- Choose a Class Category --"))
    option.value = 0;
    catg4.appendChild(option);

    var catg5 = document.getElementById("choose-category-5");
    var option = document.createElement('option');
    option.appendChild(document.createTextNode("-- Choose a Class Category --"))
    option.value = 0;
    catg5.appendChild(option);

    var catg6 = document.getElementById("choose-category-6");
    var option = document.createElement('option');
    option.appendChild(document.createTextNode("-- Choose a Class Category --"))
    option.value = 0;
    catg6.appendChild(option);
    

    var classRef = db.collection("classes");
    classRef.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            let catgData = doc.data();
            let catgName = catgData["categoryName"];
            
            var option = document.createElement('option');
            option.appendChild(document.createTextNode(catgName));
            option.value = doc.id; 
            catg1.appendChild(option);

            var option = document.createElement('option');
            option.appendChild(document.createTextNode(catgName));
            option.value = doc.id; 
            catg2.appendChild(option);

            var option = document.createElement('option');
            option.appendChild(document.createTextNode(catgName));
            option.value = doc.id; 
            catg3.appendChild(option);

            var option = document.createElement('option');
            option.appendChild(document.createTextNode(catgName));
            option.value = doc.id; 
            catg4.appendChild(option);

            var option = document.createElement('option');
            option.appendChild(document.createTextNode(catgName));
            option.value = doc.id; 
            catg5.appendChild(option);

            var option = document.createElement('option');
            option.appendChild(document.createTextNode(catgName));
            option.value = doc.id; 
            catg6.appendChild(option);

        })
    })
}
/*
function hideAdminPanel() {
    document.getElementById("admin-panel").style.display="none";
    document.getElementById("open-admin-panel-btn").style.display="block";
    document.getElementById("close-admin-panel-btn").style.display="none";
}
*/

function hideRegisExample() {
    document.getElementById('hide-regis-example').style.display='none'; 
    document.getElementById('show-regis-example').style.display='block'; 
    document.getElementById('regis-example').style.display='none';
}

function hideClassRegistration(){
    totalCost = 0;
    hideRegisExample();
    document.getElementById("hide-register-classes-btn").style.display="none";
    document.getElementById("register-classes-btn").style.display="block";
    document.getElementById("class-registration").style.display="none";

    totalCost = 0;
    document.getElementById("total-cost").innerHTML = "$0";

    var sel = document.getElementById('student-to-register');
    for (i = sel.length - 1; i >= 0; i--) {
        sel.remove(i);
    }

    var sel = document.getElementById('choose-category-1');
    for (i = sel.length - 1; i >= 0; i--) {
        sel.remove(i);
    }
    var sel = document.getElementById('choose-category-2');
    for (i = sel.length - 1; i >= 0; i--) {
        sel.remove(i);
    }
    var sel = document.getElementById('choose-category-3');
    for (i = sel.length - 1; i >= 0; i--) {
        sel.remove(i);
    }
    var sel = document.getElementById('choose-category-4');
    for (i = sel.length - 1; i >= 0; i--) {
        sel.remove(i);
    }
    var sel = document.getElementById('choose-category-5');
    for (i = sel.length - 1; i >= 0; i--) {
        sel.remove(i);
    }
    var sel = document.getElementById('choose-category-6');
    for (i = sel.length - 1; i >= 0; i--) {
        sel.remove(i);
    }

    var sel = document.getElementById('choose-class-1');
    for (i = sel.length - 1; i >= 0; i--) {
        sel.remove(i); 
    }
    
    var sel = document.getElementById('choose-class-2');
    for (i = sel.length - 1; i >= 0; i--) {
        sel.remove(i);
    }
    var sel = document.getElementById('choose-class-3');
    for (i = sel.length - 1; i >= 0; i--) {
        sel.remove(i);
    }
    var sel = document.getElementById('choose-class-4');
    for (i = sel.length - 1; i >= 0; i--) {
        sel.remove(i);
    }
    var sel = document.getElementById('choose-class-5');
    for (i = sel.length - 1; i >= 0; i--) {
        sel.remove(i);
    }
    var sel = document.getElementById('choose-class-6');
    for (i = sel.length - 1; i >= 0; i--) {
        sel.remove(i);
    } 

    document.getElementById("time-1").innerHTML = "";
    document.getElementById("time-2").innerHTML = "";
    document.getElementById("time-3").innerHTML = "";
    document.getElementById("time-4").innerHTML = "";
    document.getElementById("time-5").innerHTML = "";
    document.getElementById("time-6").innerHTML = "";
    document.getElementById("cost-1").innerHTML = "";
    document.getElementById("cost-2").innerHTML = "";
    document.getElementById("cost-3").innerHTML = "";
    document.getElementById("cost-4").innerHTML = "";
    document.getElementById("cost-5").innerHTML = "";
    document.getElementById("cost-6").innerHTML = "";
}

function hideChildDropdown(){
    document.getElementById("add-child-dropdown").style.display="none";
    document.getElementById("add-new-child-btn").style.display="block";
    document.getElementById("hide-new-child-btn").style.display="none";
}

function hideProfile(){
    document.getElementById("profile").style.display="none";
    document.getElementById("hide-profile-btn").style.display="none";
    document.getElementById("show-profile-btn").style.display="block";
}

function hideChildren(){
    hideChildDropdown();
    document.getElementById("hide-children-btn").style.display="none";
    document.getElementById("show-children-btn").style.display="block";
    document.getElementById("child-list").style.display="none";
    var rowCount = document.getElementById("child-list-table").rows.length;
    for (var i = rowCount - 1; i > 0; i--) {
        document.getElementById("child-list-table").deleteRow(i);
    }
} 

function addChild() {
    var user = firebase.auth().currentUser;
    var uid = user.uid;
    var table = document.getElementById("child-list-table");
    var row = table.insertRow();
    var cell1 = row.insertCell(0); //Child Name
    var cell2 = row.insertCell(1); //Birth Date
    var cell3 = row.insertCell(2); //Gender
    var cell4 = row.insertCell(3); //Enrolled Classes
    var childName = document.getElementById("add-child-name").value;
    var childDateOfBirth = document.getElementById("add-child-date-of-birth").value;
    var childGender = document.getElementById("add-child-gender").value;
    childListRowCount++;
    //cell1.innerHTML = childListRowCount;
    cell1.innerHTML = childName;
    cell2.innerHTML = childDateOfBirth;
    cell3.innerHTML = childGender;
    db.collection("users").doc(uid).collection("children").doc(childName).set({
        name: childName,
        dateOfBirth: childDateOfBirth,
        gender: childGender,
        catg1: 0,
        catg2: 0,
        catg3: 0,
        catg4: 0,
        catg5: 0,
        catg6: 0,
        class1: "",
        class2: "",
        class3: "",
        class4: "",
        class5: "",
        class6: ""
    })
}

function send_verification(){
    var user = firebase.auth().currentUser;
    user.sendEmailVerification().then(function() {
        alert("Verification Email Sent.");
    }).catch(function(error) {
        alert("An error happened.");
    });
}

/*
function removeRow(){
    var target = document.getElementById("target-input").value;
    var targetAsInt = parseInt(target, 10);
    if ((target != "" && targetAsInt != 0) && targetAsInt <= childListRowCount) {
        document.getElementById("child-list-table").deleteRow(targetAsInt);
        childListRowCount--;
    } else {
        window.alert("Please input a valid Child #, or add a Child if you have not yet done so.");
    }

    //reset numbers
    var childListTable = document.getElementById("child-list-table");
    for (i = 1; i <= childListRowCount; i++) {
        childListTable.rows[i].cells[0].innerHTML = i;
    }
}
*/

// Profile Save Changes Buttons

function storeParentNameData() { 
    var user = firebase.auth().currentUser;
    var uid = user.uid;
    
    var parentName = document.getElementById("parent_name_field").value;

    db.collection("users").doc(uid).update({
        parent_name: parentName
    })
} 

function storePhoneNumData() {
    var user = firebase.auth().currentUser;
    var uid = user.uid;
    
    var phoneNum = document.getElementById("phone_num_field").value;

    db.collection("users").doc(uid).update({
        phone_num: phoneNum
    });
}

function getCost(catgName, className) {
    var costRef = db.collection("classes").doc(catgName).collection(catgName+"-classes-list").doc(className);
    costRef.get().then(function(doc) {
        let docData = doc.data();
        let cost = parseInt(docData["classCost"]);
        totalCost += cost;
    })
}
/*
function updateCost() {
    var catg1 = document.getElementById("choose-category-1").value;
    var class1 = document.getElementById("choose-class-1").value;
    getCost(catg1, class1).then(printTotalCost);
    
    if (class1 !== "") {
        var costRef1 = db.collection("classes").doc(catg1).collection(catg1+"-classes-list").doc(class1);
        costRef1.get().then(function(doc) {
            if (doc.exists) {
                let cost1data = doc.data();
                let cost1 = parseInt(cost1data["classCost"]);
                totalCost = totalCost + cost1;
                //console.log("a")
            }
        })
    }
    var catg2 = document.getElementById("choose-category-2").value;
    var class2 = document.getElementById("choose-class-2").value;
    if (class2 !== "") {
        var costRef2 = db.collection("classes").doc(catg2).collection(catg2+"-classes-list").doc(class2);
        costRef2.get().then(function(doc) {
            if (doc.exists) {
                let cost2data = doc.data();
                let cost2 = parseInt(cost2data["classCost"]);
                totalCost = totalCost + cost2;
                //console.log("b")
            }
        })
    }
    var catg3 = document.getElementById("choose-category-3").value;
    var class3 = document.getElementById("choose-class-3").value;
    if (class3 !== "") {
        var costRef3 = db.collection("classes").doc(catg3).collection(catg3+"-classes-list").doc(class3);
        costRef3.get().then(function(doc) {
            if (doc.exists) {
                let cost3data = doc.data();
                let cost3 = parseInt(cost3data["classCost"]);
                totalCost = totalCost + cost3;
                //console.log("c")
            }
        })
    }
    var catg4 = document.getElementById("choose-category-4").value;
    var class4 = document.getElementById("choose-class-4").value;
    if (class4 !== "") {
        var costRef4 = db.collection("classes").doc(catg4).collection(catg4+"-classes-list").doc(class4);
        costRef4.get().then(function(doc) {
            if (doc.exists) {
                let cost4data = doc.data();
                let cost4 = parseInt(cost4data["classCost"]);
                totalCost = totalCost + cost4;
                //console.log("d")
            }
        })
    }
    var catg5 = document.getElementById("choose-category-5").value;
    var class5 = document.getElementById("choose-class-5").value;
    if (class5 !== "") {
        var costRef5 = db.collection("classes").doc(catg5).collection(catg5+"-classes-list").doc(class5);
        costRef5.get().then(function(doc) {
            if (doc.exists) {
                let cost5data = doc.data();
                let cost5 = parseInt(cost5data["classCost"]);
                totalCost = totalCost + cost5;
                //console.log("e")
            }
        })
    }
    var catg6 = document.getElementById("choose-category-6").value;
    var class6 = document.getElementById("choose-class-6").value;
    if (class6 !== "") {
        var costRef6 = db.collection("classes").doc(catg6).collection(catg6+"-classes-list").doc(class6);
        costRef6.get().then(function(doc) {
            if (doc.exists) {
                let cost6data = doc.data();
                let cost6 = parseInt(cost6data["classCost"]);
                totalCost = totalCost + cost6;
                //console.log("f")
            }
        })
    }
    return totalCost;
}
*/

function updateChooseClass1() {
    let categoryChoice = document.getElementById("choose-category-1").value;
    var sel = document.getElementById('choose-class-1');
    if (sel != null){
        for (i = sel.length - 1; i >= 0; i--) {
            sel.remove(i);
        }
    }
    if (categoryChoice != "") {
        var docRef = db.collection("classes").doc(categoryChoice).collection(categoryChoice+"-classes-list");

        let defaultOpt = "-- Choose a Class --"
        var select = document.getElementById("choose-class-1");
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(defaultOpt));
        opt.value = 0;
        select.appendChild(opt);

        docRef.get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) { 
                let docData = doc.data();
                let className = docData["className"];
                var select = document.getElementById("choose-class-1");
                var opt = document.createElement('option');
                opt.appendChild(document.createTextNode(className));
                opt.value = doc.id; //May need to change this
                select.appendChild(opt);
            });
        })
        .catch(function(error) {
            console.log("There was an error:", error);
        }) 
    } 
}
function updateChooseClass2() {
    let categoryChoice = document.getElementById("choose-category-2").value;
    var sel = document.getElementById('choose-class-2');
    if (sel != null){
        for (i = sel.length - 1; i >= 0; i--) {
            sel.remove(i);
        }
    }
    if (categoryChoice != "") {
        var docRef = db.collection("classes").doc(categoryChoice).collection(categoryChoice+"-classes-list");
        
        let defaultOpt = "-- Choose a Class --"
        var select = document.getElementById("choose-class-2");
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(defaultOpt));
        opt.value = 0;
        select.appendChild(opt);

        docRef.get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) { 
                let docData = doc.data();
                let className = docData["className"];
                var select = document.getElementById("choose-class-2");
                var opt = document.createElement('option');
                opt.appendChild(document.createTextNode(className));
                opt.value = doc.id; //May need to change this
                select.appendChild(opt);
            });
        })
        .catch(function(error) { 
            console.log("Error getting documents: ", error);
        }) 
    }
}
function updateChooseClass3() {
    let categoryChoice = document.getElementById("choose-category-3").value;
    var sel = document.getElementById('choose-class-3');
    if (sel != null){
        for (i = sel.length - 1; i >= 0; i--) {
            sel.remove(i);
        }
    }
    if (categoryChoice != "") {
        var docRef = db.collection("classes").doc(categoryChoice).collection(categoryChoice+"-classes-list");
        
        let defaultOpt = "-- Choose a Class --"
        var select = document.getElementById("choose-class-3");
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(defaultOpt));
        opt.value = 0;
        select.appendChild(opt);

        docRef.get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) { 
                let docData = doc.data();
                let className = docData["className"];
                var select = document.getElementById("choose-class-3");
                var opt = document.createElement('option');
                opt.appendChild(document.createTextNode(className));
                opt.value = doc.id; //May need to change this
                select.appendChild(opt);
            });
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        }) 
    }
}
function updateChooseClass4() {
    let categoryChoice = document.getElementById("choose-category-4").value;
    var sel = document.getElementById('choose-class-4');
    if (sel != null){
        for (i = sel.length - 1; i >= 0; i--) {
            sel.remove(i);
        }
    }
    if (categoryChoice != "") {
        var docRef = db.collection("classes").doc(categoryChoice).collection(categoryChoice+"-classes-list");
        
        let defaultOpt = "-- Choose a Class --"
        var select = document.getElementById("choose-class-4");
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(defaultOpt));
        opt.value = 0;
        select.appendChild(opt);

        docRef.get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) { 
                let docData = doc.data();
                let className = docData["className"];
                var select = document.getElementById("choose-class-4");
                var opt = document.createElement('option');
                opt.appendChild(document.createTextNode(className));
                opt.value = doc.id; //May need to change this
                select.appendChild(opt);
            });
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        }) 
    }
}
function updateChooseClass5() {
    let categoryChoice = document.getElementById("choose-category-5").value;
    var sel = document.getElementById('choose-class-5');
    if (sel != null){
        for (i = sel.length - 1; i >= 0; i--) {
            sel.remove(i);
        }
    }
    if (categoryChoice != "") {
        var docRef = db.collection("classes").doc(categoryChoice).collection(categoryChoice+"-classes-list");
        
        let defaultOpt = "-- Choose a Class --"
        var select = document.getElementById("choose-class-5");
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(defaultOpt));
        opt.value = 0;
        select.appendChild(opt);

        docRef.get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) { 
                let docData = doc.data();
                let className = docData["className"];
                var select = document.getElementById("choose-class-5");
                var opt = document.createElement('option');
                opt.appendChild(document.createTextNode(className));
                opt.value = doc.id; //May need to change this
                select.appendChild(opt);
            });
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        }) 
    }
}
function updateChooseClass6() {
    let categoryChoice = document.getElementById("choose-category-6").value;
    var sel = document.getElementById('choose-class-6');
    if (sel != null){
        for (i = sel.length - 1; i >= 0; i--) {
            sel.remove(i);
        }
    }
    if (categoryChoice != "") {
        var docRef = db.collection("classes").doc(categoryChoice).collection(categoryChoice+"-classes-list");
        
        let defaultOpt = "-- Choose a Class --"
        var select = document.getElementById("choose-class-6");
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(defaultOpt));
        opt.value = 0;
        select.appendChild(opt);

        docRef.get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) { 
                let docData = doc.data();
                let className = docData["className"];
                var select = document.getElementById("choose-class-6");
                var opt = document.createElement('option');
                opt.appendChild(document.createTextNode(className));
                opt.value = doc.id; //May need to change this
                select.appendChild(opt);
            });
        })
        .catch(function(error) {
            console.log("Error getting documents: ", error);
        }) 
    }
}

function updateClassSelection1() {
    let classChosen = document.getElementById("choose-class-1").value;
    let categoryChoice = document.getElementById("choose-category-1").value;
    var docRef = db.collection("classes").doc(categoryChoice).collection(categoryChoice+"-classes-list").doc(classChosen);
    docRef.get().then(function(doc) {
        let docData = doc.data();
        let startTime = docData["startTime"];
        let endTime = docData["endTime"];
        let cost = docData["classCost"];
        document.getElementById("cost-1").innerHTML = "$" + cost;
        //totalCost = totalCost + parseInt(cost);
        //console.log("pog");
        document.getElementById("time-1").innerHTML = startTime + " - " + endTime;
        //document.getElementById("total-cost").innerHTML = "$" + totalCost;
        //updateCost();
    })
}

function updateClassSelection2() {
    let classChosen = document.getElementById("choose-class-2").value;
    let categoryChoice = document.getElementById("choose-category-2").value;
    var docRef = db.collection("classes").doc(categoryChoice).collection(categoryChoice+"-classes-list").doc(classChosen);
    docRef.get().then(function(doc) {
        let docData = doc.data();
        let startTime = docData["startTime"];
        let endTime = docData["endTime"];
        let cost = docData["classCost"];
        document.getElementById("cost-2").innerHTML = "$" + cost;
        //totalCost += parseInt(cost);
        document.getElementById("time-2").innerHTML = startTime + " - " + endTime;
        //document.getElementById("total-cost").innerHTML = "$" + totalCost;
        //updateCost();
    })
}

function updateClassSelection3() {
    let classChosen = document.getElementById("choose-class-3").value;
    let categoryChoice = document.getElementById("choose-category-3").value;
    var docRef = db.collection("classes").doc(categoryChoice).collection(categoryChoice+"-classes-list").doc(classChosen);
    docRef.get().then(function(doc) {
        let docData = doc.data();
        let startTime = docData["startTime"];
        let endTime = docData["endTime"];
        let cost = docData["classCost"];
        document.getElementById("cost-3").innerHTML = "$" + cost;
        //totalCost += parseInt(cost);
        document.getElementById("time-3").innerHTML = startTime + " - " + endTime;
        //document.getElementById("total-cost").innerHTML = "$" + totalCost;
        //updateCost();
    })
}

function updateClassSelection4() {
    let classChosen = document.getElementById("choose-class-4").value;
    let categoryChoice = document.getElementById("choose-category-4").value;
    var docRef = db.collection("classes").doc(categoryChoice).collection(categoryChoice+"-classes-list").doc(classChosen);
    docRef.get().then(function(doc) {
        let docData = doc.data();
        let startTime = docData["startTime"];
        let endTime = docData["endTime"];
        let cost = docData["classCost"];
        document.getElementById("cost-4").innerHTML = "$" + cost;
        //totalCost += parseInt(cost);
        document.getElementById("time-4").innerHTML = startTime + " - " + endTime;
        //document.getElementById("total-cost").innerHTML = "$" + totalCost;
        //updateCost();
    })
}

function updateClassSelection5() {
    let classChosen = document.getElementById("choose-class-5").value;
    let categoryChoice = document.getElementById("choose-category-5").value;
    var docRef = db.collection("classes").doc(categoryChoice).collection(categoryChoice+"-classes-list").doc(classChosen);
    docRef.get().then(function(doc) {
        let docData = doc.data();
        let startTime = docData["startTime"];
        let endTime = docData["endTime"];
        let cost = docData["classCost"];
        document.getElementById("cost-5").innerHTML = "$" + cost;
        //totalCost += parseInt(cost);
        document.getElementById("time-5").innerHTML = startTime + " - " + endTime;
        //document.getElementById("total-cost").innerHTML = "$" + totalCost;
        //updateCost();
    })
}

function updateClassSelection6() {
    let classChosen = document.getElementById("choose-class-6").value;
    let categoryChoice = document.getElementById("choose-category-6").value;
    var docRef = db.collection("classes").doc(categoryChoice).collection(categoryChoice+"-classes-list").doc(classChosen);
    docRef.get().then(function(doc) {
        let docData = doc.data();
        let startTime = docData["startTime"];
        let endTime = docData["endTime"];
        let cost = docData["classCost"];
        document.getElementById("cost-6").innerHTML = "$" + cost;
        //totalCost += parseInt(cost);
        document.getElementById("time-6").innerHTML = startTime + " - " + endTime;
        //document.getElementById("total-cost").innerHTML = "$" + totalCost;
        //updateCost();
    })
}

function submitClassRegistration() {
    var r = confirm("Are you sure you want to submit? Once again, you will not be able to remove your child from the selected classes; you will only be able to add new classes.\nPressing 'OK' will submit your child.\nPressing 'Cancel' will cancel your registration.");
    if (r != true) {
        window.alert("You pressed Cancel.")
        hideClassRegistration();
    } else {
        var user = firebase.auth().currentUser;
        var uid = user.uid;
        
        var debtRef = db.collection("debt");
        debtRef.get().then(function(doc) { 
            if (doc.exists) {
                let debtData = doc.data();
            } else {
                //else CREATE DOC 
                db.collection("debt").doc(uid).set({
                    debt: 0,
                    uid: uid
                })
            }
        }).catch(function(error) {
            
        });

        var user = firebase.auth().currentUser;
        var uid = user.uid;
        var childName = document.getElementById("student-to-register").value;
        let class1 = document.getElementById("choose-class-1").value;
        let catg1 = document.getElementById("choose-category-1").value;
        let class2 = document.getElementById("choose-class-2").value;
        let catg2 = document.getElementById("choose-category-2").value;
        let class3 = document.getElementById("choose-class-3").value;
        let catg3 = document.getElementById("choose-category-3").value;
        let class4 = document.getElementById("choose-class-4").value;
        let catg4 = document.getElementById("choose-category-4").value;
        let class5 = document.getElementById("choose-class-5").value;
        let catg5 = document.getElementById("choose-category-5").value;
        let class6 = document.getElementById("choose-class-6").value;
        let catg6 = document.getElementById("choose-category-6").value;

        
        var childDoc = db.collection("users").doc(uid).collection("children").doc(childName);
        childDoc.get().then(function(doc) {
            if (doc.exists) {
                var docData = doc.data();
                if (catg1 != 0) {
                    var curClass1 = docData["class1"];
                    var curCatg1 = docData["catg1"];
                    db.collection("classes").doc(curCatg1).collection(curCatg1+"-classes-list").doc(curClass1).collection("students").doc(childName).delete();
                }

                if (catg2 != 0) {
                    var curClass2 = docData["class2"];
                    var curCatg2 = docData["catg2"];
                    db.collection("classes").doc(curCatg2).collection(curCatg2+"-classes-list").doc(curClass2).collection("students").doc(childName).delete();
                }

                if (catg3 != 0) {
                    console.log("rsgetarsg" + catg3);
                    var curClass3 = docData["class3"];
                    var curCatg3 = docData["catg3"];
                    db.collection("classes").doc(curCatg3).collection(curCatg3+"-classes-list").doc(curClass3).collection("students").doc(childName).delete();
                } 

                if (catg4 != 0) {
                    var curClass4 = docData["class4"];
                    var curCatg4 = docData["catg4"];
                    db.collection("classes").doc(curCatg4).collection(curCatg4+"-classes-list").doc(curClass4).collection("students").doc(childName).delete();
                }

                if (catg5 != 0) {
                    var curClass5 = docData["class5"];
                    var curCatg5 = docData["catg5"];
                    db.collection("classes").doc(curCatg5).collection(curCatg5+"-classes-list").doc(curClass5).collection("students").doc(childName).delete();
                }

                if (catg6 != 0) {
                    var curClass6 = docData["class6"];
                    var curCatg6 = docData["catg6"];
                    db.collection("classes").doc(curCatg6).collection(curCatg6+"-classes-list").doc(curClass6).collection("students").doc(childName).delete();
                }

            }
        })
        
        
        

        //update class roster 
        
        if (catg1 != 0) { 
            db.collection("classes").doc(catg1).collection(catg1+"-classes-list").doc(class1).collection("students").doc(childName).set({
                name: childName,
                uid: uid
            }) 
        } 
        if (catg2 != 0) { 
            db.collection("classes").doc(catg2).collection(catg2+"-classes-list").doc(class2).collection("students").doc(childName).set({
                name: childName,
                uid: uid
            }) 
        } 
        if (catg3 != 0) { 
            console.log(catg3);
            db.collection("classes").doc(catg3).collection(catg3+"-classes-list").doc(class3).collection("students").doc(childName).set({
                name: childName,
                uid: uid
            }) 
        } 
        if (catg4 != 0) { 
            db.collection("classes").doc(catg4).collection(catg4+"-classes-list").doc(class4).collection("students").doc(childName).set({
                name: childName,
                uid: uid
            }) 
        } 
        if (catg5 != 0) { 
            db.collection("classes").doc(catg5).collection(catg5+"-classes-list").doc(class5).collection("students").doc(childName).set({
                name: childName,
                uid: uid
            }) 
        } 
        if (catg6 != 0) { 
            db.collection("classes").doc(catg6).collection(catg6+"-classes-list").doc(class6).collection("students").doc(childName).set({
                name: childName,
                uid: uid
            }) 
        } 
        
        //update child page
        db.collection("users").doc(uid).collection("children").doc(childName).update({
            class1: class1,
            class2: class2,
            class3: class3,
            class4: class4,
            class5: class5,
            class6: class6,

            catg1: catg1,
            catg2: catg2,
            catg3: catg3,
            catg4: catg4,
            catg5: catg5,
            catg6: catg6
            
        })
        .catch(function(error) {
            console.log("Error recording classes: ", error);
        })
    }
}

function addNewClass() {
    document.getElementById("add-new-class-btn").style.display = "none";
    document.getElementById("hide-new-class-btn").style.display = "block";
    document.getElementById("add-new-class").style.display = "block";

    var docRef = db.collection("classes");

    let defaultOpt = "-- Please Choose a Category or Create One --"
    var select = document.getElementById("add-new-class-catg-select");
    var opt = document.createElement('option');
    opt.appendChild(document.createTextNode(defaultOpt));
    opt.value = 0;
    select.appendChild(opt);

    let createOpt = "- Create a New Category -"
    var select = document.getElementById("add-new-class-catg-select");
    var opt = document.createElement('option');
    opt.appendChild(document.createTextNode(createOpt));
    opt.value = "create-new-catg";
    select.appendChild(opt);

    docRef.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) { 
            let docData = doc.data();
            let className = docData["categoryName"];
            var select = document.getElementById("add-new-class-catg-select");
            var opt = document.createElement('option');
            opt.appendChild(document.createTextNode(className));
            opt.value = doc.id; //May need to change this
            select.appendChild(opt);
        });
    })
    .catch(function(error) {
        console.log("Error getting documents: ", error);
    }) 
}

function hideNewClass() {
    document.getElementById("add-new-class-btn").style.display = "block";
    document.getElementById("hide-new-class-btn").style.display = "none";
    document.getElementById("add-new-class").style.display = "none";
    document.getElementById("create-new-catg").style.display="none";
    var sel = document.getElementById('add-new-class-catg-select');
    for (i = sel.length - 1; i >= 0; i--) {
        sel.remove(i);
    }
    document.getElementById("new-catg-name").value = "";
    document.getElementById("add-new-class-name").value = "";
}

function updateNewClassCatg() {
    var catgSelection = document.getElementById("add-new-class-catg-select").value;
    if (catgSelection === "create-new-catg") {
        document.getElementById("create-new-catg").style.display = "block";
    } else {
        document.getElementById("create-new-catg").style.display = "none";
    }
}

function submitNewClass() {
    if (document.getElementById("create-new-catg").style.display == "none") {
        var newClassCatg = document.getElementById("add-new-class-catg-select").value;
    } else {
        var newClassCatg = document.getElementById("new-catg-name").value;
        db.collection("classes").doc(newClassCatg).set({
            categoryName: newClassCatg
        })
    }
    
    var newClassName = document.getElementById("add-new-class-name").value;

    var newClassCost = document.getElementById("add-class-cost").value;

    var newClassStartTime = document.getElementById("add-class-startTime").value;

    var newClassEndTime = document.getElementById("add-class-endTime").value;

    var newClassMaxStudents = document.getElementById("add-class-max-students").value;

    var newClassTeacherName = document.getElementById("add-class-teacher-name").value;
    
    db.collection("classes").doc(newClassCatg).collection(newClassCatg+"-classes-list").doc(newClassName).set({
        className: newClassName,
        classCost: newClassCost,
        startTime: newClassStartTime,
        endTime: newClassEndTime,
        maxStudents: newClassMaxStudents,
        teacherName: newClassTeacherName
    })

    db.collection("classes").doc(newClassCatg).collection(newClassCatg+"-classes-list").doc(newClassName).collection("students").doc("temp").set({
        temp: "temp"
    })
}

function openClassRosterFinder() {
    document.getElementById("find-class-roster-btn").style.display = "none";
    document.getElementById("hide-class-roster-btn").style.display = "block";
    document.getElementById("display-class-roster").style.display = "block";

    var catg = document.getElementById("pick-class-catg");
    var option = document.createElement('option');
    option.appendChild(document.createTextNode("-- Choose a Class Category --"))
    option.value = 0;
    catg.appendChild(option);

    var classRef = db.collection("classes");
    classRef.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            let catgData = doc.data();
            let catgName = catgData["categoryName"];
            
            var option = document.createElement('option');
            option.appendChild(document.createTextNode(catgName));
            option.value = doc.id; 
            catg.appendChild(option);
        })
    })
}

function hideClassRosterFinder() {
    document.getElementById("find-class-roster-btn").style.display = "block";
    document.getElementById("hide-class-roster-btn").style.display = "none";
    document.getElementById("display-class-roster").style.display = "none";
    var sel = document.getElementById('pick-class-catg');
    if (sel != null){
        for (i = sel.length - 1; i >= 0; i--) {
            sel.remove(i);
        }
    }
    var sel = document.getElementById('pick-class');
    if (sel != null){
        for (i = sel.length - 1; i >= 0; i--) {
            sel.remove(i);
        }
    }
    document.getElementById("info-class-name").innerHTML = "";
    document.getElementById("info-start-time").innerHTML = "";
    document.getElementById("info-end-time").innerHTML = "";
    document.getElementById("info-cost").innerHTML = "";
    document.getElementById("info-max-students").innerHTML = "";
    document.getElementById("info-teacher-name").innerHTML = "";
    hideClassInfo();
    hideClassRoster();
    var rowCount = document.getElementById("child-roster-table").rows.length;
    for (var i = rowCount - 1; i > 0; i--) {
        document.getElementById("child-roster-table").deleteRow(i);
    }
}

function updateCategoryFinder() {
    let categoryChoice = document.getElementById("pick-class-catg").value;
    var sel = document.getElementById('pick-class');
    if (sel != null){
        for (i = sel.length - 1; i >= 0; i--) {
            sel.remove(i);
        }
    }
    if (categoryChoice != 0) {
        var docRef = db.collection("classes").doc(categoryChoice).collection(categoryChoice+"-classes-list");

        let defaultOpt = "-- Choose a Class --"
        var select = document.getElementById("pick-class");
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode(defaultOpt));
        opt.value = 0;
        select.appendChild(opt);

        docRef.get().then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) { 
                let docData = doc.data();
                let className = docData["className"];
                var select = document.getElementById("pick-class");
                var opt = document.createElement('option');
                opt.appendChild(document.createTextNode(className));
                opt.value = doc.id; //May need to change this
                select.appendChild(opt);
            });
        })
        .catch(function(error) {
            console.log("There was an error:", error);
        }) 
    } 
}

function updateClassFinder() {
    var rowCount = document.getElementById("child-roster-table").rows.length;
    for (var i = rowCount - 1; i > 0; i--) {
        document.getElementById("child-roster-table").deleteRow(i);
    }
    // This fuction is the one that actually updates the class roster and info
    let categoryChoice = document.getElementById("pick-class-catg").value;
    let classChoice = document.getElementById("pick-class").value;

    // Class info
    var infoRef = db.collection("classes").doc(categoryChoice).collection(categoryChoice+"-classes-list").doc(classChoice);
    infoRef.get().then(function(doc) {
        var infoData = doc.data();
        var className = infoData["className"];
        var startTime = infoData["startTime"];
        var endTime = infoData["endTime"];
        var classCost = infoData["classCost"];
        var maxStudents = infoData["maxStudents"];
        var teacherName = infoData["teacherName"];
        document.getElementById("info-class-name").innerHTML = className;
        document.getElementById("info-start-time").innerHTML = startTime;
        document.getElementById("info-end-time").innerHTML = endTime;
        document.getElementById("info-cost").innerHTML = classCost;
        document.getElementById("info-max-students").innerHTML = maxStudents;
        document.getElementById("info-teacher-name").innerHTML = teacherName;
    })

    // Class roster
    var rosterRef = db.collection("classes").doc(categoryChoice).collection(categoryChoice+"-classes-list").doc(classChoice).collection("students");
    rosterRef.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            let docData = doc.data();
            if (docData["uid"] !== undefined) {
                var table = document.getElementById("child-roster-table");
                var row = table.insertRow();
                var cell1 = row.insertCell(0); // Student Name
                var cell2 = row.insertCell(1); // Parent Name
                var cell3 = row.insertCell(2); // Email
                var cell4 = row.insertCell(3); // Phone Number
                cell1.innerHTML = docData["name"];
                var userRef = db.collection("users").doc(docData["uid"]);
                userRef.get().then(function(a) {
                    let userData = a.data();
                    var email = userData["email"];
                    var phoneNum = userData["phone_num"];
                    var parentName = userData["parent_name"];
                    cell2.innerHTML = parentName;
                    cell3.innerHTML = email;
                    cell4.innerHTML = phoneNum;
                    console.log("a");
                })
            }
        })
    })
}

function showClassInfo() {
    document.getElementById("show-class-info").style.display = "none";
    document.getElementById("hide-class-info").style.display = "block";
    document.getElementById("admin-class-info").style.display = "block";
}

function hideClassInfo() {
    document.getElementById("show-class-info").style.display = "block";
    document.getElementById("hide-class-info").style.display = "none";
    document.getElementById("admin-class-info").style.display = "none";
}

function showClassRoster() {
    document.getElementById("show-class-roster").style.display = "none";
    document.getElementById("hide-class-roster").style.display = "block";
    document.getElementById("admin-class-roster").style.display = "block";
}

function hideClassRoster() {
    document.getElementById("show-class-roster").style.display = "block";
    document.getElementById("hide-class-roster").style.display = "none";
    document.getElementById("admin-class-roster").style.display = "none";
    
}

/*
addBtn.addEventListener('click', (e) => {
    e.preventDefault();
    rootRef.child(userId.value).set({
        first_name: firstName.value,
        last_name: lastName.value,
        age: age.value
    });
});

updateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const newData = {
        age: age.value,
        first_name: firstName.value,
        last_name: lastName.value
    };
    const updates = {};
    updates['/users/' + userId.value] = newData;
    database.ref().update(updates);
});

removeBtn.addEventListener('click', e => {
    e.preventDefault();
    rootRef.child(userId.value).remove()
    .then(() => { 
        window.alert('User removed from database!');
    })
    .catch(error => {
        console.error(error);
    });
});
*/

/*
rootRef.orderByChild('first_name').equalTo('Joe').on('value', snapshot => {
    console.log(snapshot.val());
});
*/
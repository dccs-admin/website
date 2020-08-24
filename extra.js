function importClassRostersFromFirestore() {
    const firestore = getFirestore();
    var catgRef = firestore.collection("classes");
    catgRef.get().then(function(doc) {
      querySnapshot.forEach(function(doc) {
        let catgData = doc.data();
        let catgName = catgData["categoryName"];
        var classRef = firestore.collection("classes").doc(catgName).collection(catgName+"-classes-list");
            classRef.get().then(function(classDoc) {
                querySnapshot.forEach(function(classDoc) {
                    let className = classDoc.id;
                    var studentsRef = firestore.collection("classes").doc(catgName).collection(catgName+"-classes-list").doc(className).collection("students");
                    studentsRef.get().then(function(studentsDoc) {
                        querySnapshot.forEach(function(studentsDoc) {
                            let studentData = studentsDoc.data();
                            let studentName = studentData["name"];
                            sheet.appendRow(studentName);
                        });
                    });
                });
            });
        });
    });
}
import { db } from '../../..//js/firebase.js'
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDocs, updateDoc, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"; 

const expense_types = [
    "Rent",
    'Dine-Out',
    "Grocery",
    "Commute",
    "Gas",
    "Travel",
    "Household-Expense",
    "Vehicle-Expense",
    "Utilities",
    "Personal-Spendings",
    "Recreation",
    "Entertainment",
    "Monthly-Subscriptions",
    "Credit-Payment",
    "Loan-Payment"
]

var uid, fname, lname,
    creation_date = new Date();
$(function(){
    itemIDGenerator();
    populateReporter();
    populateExpenseCategory();

    $('#reportedBy-other').click(function(){
        console.log('other clicked');
        $('#otherReporter-name').prop("disabled", false);
    });

    /**
     * IF EXPENSE IS CLICKED, DO THIS
     */
    $('#add-category').change(function(){
        if($('#add-category').val() == "expenses"){
            $('#expenseType-card').removeAttr('hidden');
            $('#expenseType-card').show();
        }
        else{
            $('#expenseType-card').hide();
        }
    });

    /**IF ADD NEW PERSON IS CLICKED*/

    $('#add-reportedBy').change(function(){
        console.log('report change')
        if($('#add-reportedBy').val() == "ADD NEW PERSON"){
            $('#otherReporter-name').removeAttr('hidden');
            $('#otherReporter-name').show();
        }
        else{
            $('#otherReporter-name').hide();
        }
    });


    $('#add-submitReport').click(function(){

        var title = $('#add-title').val();
        var note = $('#add-note').val();
        var category = $('#add-category').val();
        var expenseType = $('#add-expenseType').val();
        var value = $('#add-value').val();
        var date = $('#add-date').val();
        var reporter = $('#add-reportedBy').val();
        var paymentMethod = $('#add-paymentMethod').val();

        var id = localStorage.getItem('item_id');
        creation_date = new Date();
        var docData = {
            item_id: id,
            transaction: title,
            note: note,
            date: date,
            category: category,
            expenseType: expenseType,
            value: value,
            reportedBy: reporter,
            paymentMethod: paymentMethod,
            creation_date: creation_date
        }

        

        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
            // User is signed in, see docs for a list of available properties
            // https://firebase.google.com/docs/reference/js/auth.user
            uid = user.uid;
            fname = user.fname;
            lname = user.lname;

            //console.log(uid, month, day, year, docData)
            saveReportToDB(id, uid, docData);
            }
            else {
                console.log('logged out');
                    window.location.href = "../../index.html";
            }
        });

    });

});

/**
 * SAVE DATA TO FIRESTORE
 */
function saveReportToDB(item_id, uid, docData){
    var lastSave = (new Date()).toDateString().split(' ').slice(1).join(' ');
    var lastSaveData = {
        lastSave: lastSave
    }
    updateDoc(doc(db, "users/"+uid ), lastSaveData);
    setDoc(doc(db, "users/"+uid+"/transactions/", item_id ), docData)
                .then(function(){
                window.alert("Report Saved!");
                window.location.href = "transactions-report.html";
                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    window.alert(errorMessage);
    });
}

/**
 * GENERATE RANDOM ITEM ID
 */
function itemIDGenerator(){
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    var fulldate = [year, month, day].join('-');

    $('#add-date').val(fulldate);

    var item_id =  fulldate+"10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
    localStorage.setItem('item_id', item_id);
    $('#item_id').text(item_id);
    console.log(item_id);
}
/**
 * MAINLY HANDLE THE POPULATION OF THE EXPENSE CATEGORY
 */
function populateExpenseCategory(){

   for(var index = 0; index < expense_types.length; index++){
        var option_template = "<option value="+expense_types[index]+">"+expense_types[index]+"</option>";
        $('#add-expenseType').append(option_template);
        $('#edit-expenseType').append(option_template);
   }
}
/**
 * POPULATE THE USERS AND CO USERS
 */
function populateReporter(){
    var user = localStorage.getItem('fullname');

    const reporter = [
        "Me - "+user,
   ]
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/auth.user
          const uid = user.uid;
         
          const query = getDocs(collection(db, "users/"+uid+'/co_users'));

          if(query.empty){
            console.log ('Empty Course Query');
            }
            else{
                query.then(function(query) {
                    query.forEach(doc => {
                        var fname = doc.data().fname;
                        var lname = doc.data().lname;
                        var co_users = fname+' '+lname;
                        
                        //ADD TO ARRAY
                        reporter.push(co_users);                     
                    });
                    //POPULATE THE DROPDOWN USING THE ARRAY VALUES
                    for(var index = 0; index < reporter.length; index++){
                        if(index == 0){
                            var option_template = "<option selected value="+reporter[index]+">"+reporter[index]+"</option>";
                        }
                        else{
                            var option_template = "<option value="+reporter[index]+">"+reporter[index]+"</option>";
                        }
                            $('#add-reportedBy').append(option_template);
                    }
                })
            }
        }
    });
}
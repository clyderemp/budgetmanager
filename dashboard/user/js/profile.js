export function loadProfile(data){
   // console.log(data);
    var fullname = data.fname+' '+data.lname;
    var dob = data.dob;
    $('#profile-fullname').text(fullname);
    var age = calculateAge(dob.replace('-',''));
    $('#profile-age').text('Curently '+age+' years old');
    $('#profile-expenseBudget').text((data.expenseBudget)+'%');
    $('#profile-savingsBudget').text((data.savingsBudget)+'%');
    $('#profile-creditBudget').text((data.creditPaymentBudget)+'%');
}

export function sendCoUserDataToProfile(coUserData_ID, coUserData){
    for(coUserData_ID in coUserData){
        var docData = coUserData[coUserData_ID];
        var html = '<a class="badge bg-primary me-1 my-1" href="../manage-users/view.html">'+docData.fname+' '+docData.lname+'</a>';

        $('#profile-coUsers').append(html)
    }
}

function calculateAge(dob){
    var year = Number(dob.substr(0, 4));
    var month = Number(dob.substr(4, 2)) - 1;
    var day = Number(dob.substr(6, 2));
    var today = new Date();
    var age = today.getFullYear() - year;
    if (today.getMonth() < month || (today.getMonth() == month && today.getDate() < day)) {
        age--;
    }
    return age;
}
const moment = require("moment")
const colors = {
    red: "#FF007F",
    yellow: "#FFB55E",
    green: "#14CC9E"
}
const timezone_name = "Europe/Brussels"
//Format time with moment in display format for frontend
const formatTime = (date) => {
    return moment(date).format("DD-MM-YYYY");
}
// Used to remove +()-/. from number and add extention
const sanitizePhoneNo = (ph_no, ext) => {
    //console.log("sanitizePhoneNo.........", ph_no, ext)
    ext = ext || '+32';
    ph_no = ph_no || '';
    if (ph_no && !ph_no.startsWith("+")) {
        ph_no = ph_no.replace(/\D/g, '');
        ph_no = ph_no.replace(/^0+/, '');
        ph_no = ext + ph_no;
    }
    return ph_no;
}
const validateEmail = (email) => { //Validates the email address
    var emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return emailRegex.test(email);
}

// const validatePhone = (phone) => { //Validates the phone number
//     var phoneRegex = /^\d{1,4}\d{1,3}\d{4,14}$/; // Change this regex based on requirement
//     return phoneRegex.test(phone);
// }
function validatePhone(phone) {
    // Regex to check valid
    // International Phone Numbers
    let regex = new RegExp(/^(\+?\d{1,2}[ -]?)?(\(\+?\d{2,3}\)|\+?\d{2,3})?[ -]?\d{8,15}[ -]?\d{3,4}$/);
    // if phone
    // is empty return false
    if (phone == null) {
        return false;
    }
    // Return true if the phone
    // matched the ReGex
    if (regex.test(phone) == true) {
        return true;
    }
    else {
        return false;
    }
}

let systemUserId = {
    id: 2
};

let urlConfigId = {
    id: 1
}

module.exports = { colors, timezone_name, formatTime, sanitizePhoneNo, validateEmail,validatePhone, systemUserId, urlConfigId };
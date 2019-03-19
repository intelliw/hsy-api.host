function testMoment() {
var m = moment("2011-10-10T10:20:90");
m.isValid(); // false
m.invalidAt(); // 5 for seconds
return m.isValid(); 
}